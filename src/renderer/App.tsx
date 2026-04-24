import React, { DragEvent, useEffect, useMemo, useState } from "react";
import {
  CharacterEquipmentEdit,
  CharacterEquipmentInfo,
  CharacterMercenaryInfo,
  CHARACTER_NAMES,
  CHARACTER_OPTIONS,
  CONSUMABLE_KIND_LABELS,
  ConsumableKind,
  EQUIPMENT_OPTIONS,
  EQUIPMENT_SLOT_DEFINITIONS,
  EquipmentOption,
  EquipmentSlotKey,
  EquipmentScope,
  EpisodeKey,
  INVENTORY_CATALOG,
  InventoryCatalogItem,
  InventoryItemCategory,
  InventorySlotEdit,
  InventorySlotInfo,
  MERCENARY_OPTIONS,
  MoneyInfo,
  PartyInfo,
  SaveInfo,
  WEAPON_KIND_LABELS,
  WeaponKind
} from "../shared/saveFormat";
import { getItemStatText } from "../shared/itemStats";

const episodeLabels: Record<EpisodeKey, string> = {
  episode4: "에피소드4",
  episode5: "에피소드5"
};

type DraftParties = Record<EpisodeKey, number[]>;
type DraftMoney = Record<EpisodeKey, string>;
type DraftInventorySlot = { itemCode: number; quantity: string };
type DraftInventory = Record<EpisodeKey, DraftInventorySlot[]>;
type DraftEquipment = Record<EquipmentScope, Record<number, Record<EquipmentSlotKey, number>>>;
type DraftMercenaries = Record<number, number>;
type EditorTab = EquipmentScope | "mercenary";

const editorTabLabels: Record<EditorTab, string> = {
  mercenary: "용병단",
  field: "챕터 장비",
  battle: "전투 장비"
};

const emptySaveStatus = "G3P_II*.sav 파일을 여기로 드래그하세요.";

export default function App() {
  const [save, setSave] = useState<SaveInfo | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<EpisodeKey>("episode4");
  const [draftMoney, setDraftMoney] = useState<DraftMoney>({ episode4: "", episode5: "" });
  const [draftInventory, setDraftInventory] = useState<DraftInventory>({
    episode4: [],
    episode5: []
  });
  const [draftParties, setDraftParties] = useState<DraftParties>({ episode4: [], episode5: [] });
  const [draftEquipment, setDraftEquipment] = useState<DraftEquipment>({ field: {}, battle: {} });
  const [draftMercenaries, setDraftMercenaries] = useState<DraftMercenaries>({});
  const [selectedEquipmentCode, setSelectedEquipmentCode] = useState<number | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>("mercenary");
  const [status, setStatus] = useState(emptySaveStatus);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const activeMoney = save?.money[activeEpisode];
  const activeParty = save?.parties[activeEpisode];
  const activePartyCodes = draftParties[activeEpisode];
  const activeMoneyNumber = useMemo(
    () => Number(draftMoney[activeEpisode].replaceAll(",", "")),
    [activeEpisode, draftMoney]
  );
  const allInventoryNumbers = useMemo(
    () =>
      (["episode4", "episode5"] as EpisodeKey[]).flatMap((episode) =>
        draftInventory[episode].map((item) =>
          item.quantity === "" ? 0 : Number(item.quantity.replaceAll(",", ""))
        )
      ),
    [draftInventory]
  );
  const canWrite = Boolean(save && isValidMoney(activeMoneyNumber) && allInventoryNumbers.every(isValidCount));

  async function loadSave(loader: () => Promise<SaveInfo | null>, cancelMessage: string) {
    setBusy(true);
    setStatus("세이브 파일을 읽는 중입니다.");
    try {
      const nextSave = await loader();
      if (nextSave) {
        adoptSave(nextSave);
        setStatus(`${nextSave.fileName} 파일을 열었습니다.`);
      } else {
        setStatus(save ? cancelMessage : emptySaveStatus);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "세이브 파일을 열지 못했습니다.");
    } finally {
      setBusy(false);
      setDragging(false);
    }
  }

  function adoptSave(nextSave: SaveInfo) {
    setSave(nextSave);
    document.title = nextSave.fileName;
    setActiveEpisode(nextSave.episode.label === "에피소드5" ? "episode5" : "episode4");
    setDraftMoney({
      episode4: String(nextSave.money.episode4.value),
      episode5: String(nextSave.money.episode5.value)
    });
    setDraftInventory({
      episode4: buildInventoryDraft(nextSave.inventorySlots.episode4),
      episode5: buildInventoryDraft(nextSave.inventorySlots.episode5)
    });
    setDraftParties({
      episode4: nextSave.parties.episode4.members.map((member) => member.code),
      episode5: nextSave.parties.episode5.members.map((member) => member.code)
    });

    setDraftEquipment({
      field: buildEquipmentDrafts(nextSave.equipment.field),
      battle: buildEquipmentDrafts(nextSave.equipment.battle)
    });
    setDraftMercenaries(
      Object.fromEntries(
        nextSave.mercenaries
          .filter((mercenary) => mercenary.supported && typeof mercenary.value === "number")
          .map((mercenary) => [mercenary.characterCode, mercenary.value ?? 0])
      ) as DraftMercenaries
    );
    setSelectedEquipmentCode(
      nextSave.equipment.field.find((equipment) => equipment.supported)?.characterCode ??
        nextSave.mercenaries.find((mercenary) => mercenary.supported)?.characterCode ??
        null
    );
    setActiveEditorTab((currentTab) => (currentTab === "battle" && nextSave.location.code !== 1 ? "mercenary" : currentTab));
  }

  async function openDroppedSave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files.item(0);
    if (!file) {
      setDragging(false);
      return;
    }

    const filePath = window.g3p2SaveEditor.getPathForFile(file);
    if (!/\.sav(?:\.\d{14})?$/i.test(filePath)) {
      setStatus(".sav 또는 .sav.년월일시분초 파일만 열 수 있습니다.");
      setDragging(false);
      return;
    }

    await loadSave(() => window.g3p2SaveEditor.openSavePath(filePath), "파일 선택이 취소되었습니다.");
  }

  async function writeEditedOriginal() {
    if (!save) {
      setStatus(emptySaveStatus);
      return;
    }
    if (!canWrite) {
      setStatus("저장할 수 없는 값이 있습니다.");
      return;
    }

    const money = {
      episode4: Number(draftMoney.episode4.replaceAll(",", "")),
      episode5: Number(draftMoney.episode5.replaceAll(",", ""))
    };
    const inventorySlots = {
      episode4: parseInventoryDraft(draftInventory.episode4),
      episode5: parseInventoryDraft(draftInventory.episode5)
    };

    if (!isValidMoney(money.episode4) || !isValidMoney(money.episode5)) {
      setStatus("돈 값은 0 이상의 정수여야 합니다.");
      return;
    }
    if (![...inventorySlots.episode4, ...inventorySlots.episode5].map((item) => item.quantity).every(isValidCount)) {
      setStatus("소모품/장비 수량은 0~99 사이의 정수여야 합니다.");
      return;
    }

    setBusy(true);
    setStatus("기존 세이브를 백업하고 저장하는 중입니다.");
    try {
      const result = await window.g3p2SaveEditor.writeEditedOriginal({
        filePath: save.filePath,
        edits: {
          money,
          inventorySlots,
          parties: draftParties,
          equipment: buildEquipmentEdits(save.equipment, draftEquipment),
          mercenaries: buildMercenaryEdits(save.mercenaries, draftMercenaries)
        }
      });

      adoptSave(result.save);
      setStatus(`${result.save.fileName} 파일로 저장했습니다. 백업: ${getFileName(result.backupPath)}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function updateMoney(value: string) {
    setDraftMoney((current) => ({
      ...current,
      [activeEpisode]: value
    }));
  }

  function updateInventoryItem(index: number, value: string) {
    setDraftInventory((current) => ({
      ...current,
      [activeEpisode]: current[activeEpisode].map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: value } : item
      )
    }));
  }

  function deleteInventoryItem(index: number) {
    setDraftInventory((current) => ({
      ...current,
      [activeEpisode]: current[activeEpisode].filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function addInventoryItem(item: InventoryCatalogItem) {
    const currentItems = draftInventory[activeEpisode];
    if (currentItems.some((currentItem) => currentItem.itemCode === item.code)) {
      window.alert("이미 인벤토리에 추가된 항목입니다.");
      setStatus("이미 인벤토리에 추가된 항목입니다.");
      return false;
    }
    setDraftInventory((current) => ({
      ...current,
      [activeEpisode]: [...current[activeEpisode], { itemCode: item.code, quantity: "1" }]
    }));
    return true;
  }

  function addPartyMember(code: number) {
    setDraftParties((current) => {
      const party = current[activeEpisode];
      if (party.length >= 15) {
        setStatus("파티는 최대 15명까지 저장합니다.");
        return current;
      }
      if (party.includes(code)) {
        setStatus("이미 현재 파티에 있는 캐릭터입니다.");
        return current;
      }
      return {
        ...current,
        [activeEpisode]: [...party, code]
      };
    });
  }

  function removePartyMember(index: number) {
    const removedCode = draftParties[activeEpisode][index];
    setDraftParties((current) => ({
      ...current,
      [activeEpisode]: current[activeEpisode].filter((_, memberIndex) => memberIndex !== index)
    }));
    if (selectedEquipmentCode === removedCode) {
      setSelectedEquipmentCode(null);
    }
  }

  function movePartyMember(fromIndex: number, toIndex: number) {
    setDraftParties((current) => {
      const party = [...current[activeEpisode]];
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= party.length || toIndex >= party.length) {
        return current;
      }
      const [moved] = party.splice(fromIndex, 1);
      party.splice(toIndex, 0, moved);
      return {
        ...current,
        [activeEpisode]: party
      };
    });
  }

  useEffect(() => {
    const removeOpenListener = window.g3p2SaveEditor.onOpenSaveRequest(() => {
      void loadSave(() => window.g3p2SaveEditor.openSave(), "파일 선택이 취소되었습니다.");
    });
    const removeSaveListener = window.g3p2SaveEditor.onSaveRequest(() => {
      void writeEditedOriginal();
    });

    return () => {
      removeOpenListener();
      removeSaveListener();
    };
  });

  return (
    <main className="app-shell">
      <header
        className={dragging ? "topbar drop-active" : "topbar"}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDragging(false);
          }
        }}
        onDrop={openDroppedSave}
      >
        <div className="topbar-main">
          <div className="title-stack">
            <h1>{save?.fileName ?? "G3P2 Save Editor"}</h1>
            <p>{status}</p>
          </div>
          <SaveMetaPanel save={save} />
        </div>
        <button type="button" className="primary-button" onClick={writeEditedOriginal} disabled={!canWrite || busy}>
          저장
        </button>
      </header>

      <div className="tabs episode-tabs" role="tablist" aria-label="에피소드 선택">
        {(["episode4", "episode5"] as EpisodeKey[]).map((episode) => (
          <button
            key={episode}
            type="button"
            className={activeEpisode === episode ? "active" : ""}
            onClick={() => setActiveEpisode(episode)}
          >
            {episodeLabels[episode]}
          </button>
        ))}
      </div>

      <section className="workspace">
        <aside className="sidebar">
          <InventoryEditor
            save={save}
            episode={activeEpisode}
            money={activeMoney}
            draftMoneyValue={draftMoney[activeEpisode]}
            draftInventory={draftInventory[activeEpisode]}
            originalInventory={save?.inventorySlots[activeEpisode] ?? []}
            onMoneyChange={updateMoney}
            onInventoryChange={updateInventoryItem}
            onInventoryDelete={deleteInventoryItem}
            onInventoryAdd={addInventoryItem}
          />
        </aside>

        <section className="content">
          <PartyEditor
            party={activeParty}
            codes={activePartyCodes}
            selectedCode={selectedEquipmentCode}
            onAdd={addPartyMember}
            onRemove={removePartyMember}
            onMove={movePartyMember}
            onSelect={setSelectedEquipmentCode}
          />
        </section>

        <aside className="equipment-column">
          <div className="editor-tabs" role="tablist" aria-label="편집 항목 선택">
            {(["mercenary", "field", "battle"] as EditorTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeEditorTab === tab ? "active" : ""}
                disabled={tab === "battle" && save?.location.code !== 1}
                onClick={() => setActiveEditorTab(tab)}
              >
                {editorTabLabels[tab]}
              </button>
            ))}
          </div>

          {activeEditorTab === "mercenary" ? (
            <MercenaryEditor
              save={save}
              selectedCode={selectedEquipmentCode}
              draftMercenaries={draftMercenaries}
              onChange={(characterCode, value) => {
                setDraftMercenaries((current) => ({
                  ...current,
                  [characterCode]: value
                }));
              }}
            />
          ) : (
            <EquipmentEditor
              save={save}
              scope={activeEditorTab}
              selectedCode={selectedEquipmentCode}
              draftEquipment={draftEquipment[activeEditorTab]}
              onChange={(characterCode, slot, value) => {
                setDraftEquipment((current) => ({
                  ...current,
                  [activeEditorTab]: {
                    ...current[activeEditorTab],
                    [characterCode]: {
                      ...(current[activeEditorTab][characterCode] ?? {}),
                      [slot]: value
                    } as Record<EquipmentSlotKey, number>
                  }
                }));
              }}
            />
          )}
        </aside>
      </section>
    </main>
  );
}

function SaveMetaPanel({ save }: { save: SaveInfo | null }) {
  if (!save) {
    return (
      <div className="topbar-meta">
        <div>
          <span className="eyebrow">세이브 위치</span>
          <strong>N/A</strong>
        </div>
        <div>
          <span className="eyebrow">현재 에피소드</span>
          <strong>N/A</strong>
        </div>
        <div>
          <span className="eyebrow">플레이타임</span>
          <strong>N/A</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="topbar-meta">
      <div>
        <span className="eyebrow">세이브 위치</span>
        <strong>{save.location.label}</strong>
      </div>
      <div>
        <span className="eyebrow">현재 에피소드</span>
        <strong>{save.episode.label}</strong>
      </div>
      <div>
        <span className="eyebrow">플레이타임</span>
        <strong>{save.playTime.display}</strong>
      </div>
    </div>
  );
}

function ChecksumBadge({ save }: { save: SaveInfo | null }) {
  if (!save) {
    return <div className="checksum muted">체크섬 대기</div>;
  }

  return (
    <div className={save.checksum.ok ? "checksum ok" : "checksum bad"}>
      <span>{save.checksum.ok ? "체크섬 정상" : "체크섬 불일치"}</span>
      <small>
        저장 0x{toHex(save.checksum.stored, 4)} / 계산 0x{toHex(save.checksum.calculated, 4)}
      </small>
    </div>
  );
}

function MoneyCard({ money, draftValue }: { money?: MoneyInfo; draftValue: string }) {
  return (
    <article className="money-card">
      <span className="eyebrow">{money?.label ?? "돈"}</span>
      <strong>{draftValue ? Number(draftValue.replaceAll(",", "")).toLocaleString("ko-KR") : "-"}</strong>
      <small>
        {money ? `offset 0x${toHex(money.offset, 4)} / 현재 원시값 ${money.raw}` : "세이브 파일을 열면 표시됩니다."}
      </small>
    </article>
  );
}

function InventoryEditor({
  save,
  episode,
  money,
  draftMoneyValue,
  draftInventory,
  originalInventory,
  onMoneyChange,
  onInventoryChange,
  onInventoryDelete,
  onInventoryAdd
}: {
  save: SaveInfo | null;
  episode: EpisodeKey;
  money?: MoneyInfo;
  draftMoneyValue: string;
  draftInventory: DraftInventorySlot[];
  originalInventory: InventorySlotInfo[];
  onMoneyChange: (value: string) => void;
  onInventoryChange: (index: number, value: string) => void;
  onInventoryDelete: (index: number) => void;
  onInventoryAdd: (item: InventoryCatalogItem) => boolean;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [itemInfoOpen, setItemInfoOpen] = useState(false);
  const originalByCode = useMemo(() => {
    return new Map(originalInventory.map((item) => [item.itemCode, item]));
  }, [originalInventory]);
  const supported = Boolean(save);

  return (
    <article className="equipment-card inventory-card">
      <div className="section-title">
        <div>
          <h2>인벤토리</h2>
        </div>
      </div>

      <div className="equipment-slots">
        <div className="inventory-section-heading">
          <span>돈</span>
        </div>

        <div className="inventory-money-editor">
          <span className="item-icon-slot money-icon-slot" aria-hidden="true">
            <img src="/item-icons/money.png" alt="" />
          </span>
          <input
            id="money"
            aria-label="돈"
            inputMode="numeric"
            value={draftMoneyValue}
            onChange={(event) => onMoneyChange(event.target.value)}
            placeholder="99999"
          />
        </div>

        <div className="inventory-section-heading">
          <span>소지품</span>
        </div>

        <div className="inventory-action-grid">
          <button type="button" className="inventory-review-button" onClick={() => setReviewOpen(true)} disabled={!supported}>
            아이템 확인
          </button>
          <button type="button" className="inventory-add-button" onClick={() => setPickerOpen(true)} disabled={!supported}>
            아이템 추가
          </button>
        </div>

        <div className="inventory-section-heading">
          <span>아이템</span>
        </div>

        <button type="button" className="inventory-review-button" onClick={() => setItemInfoOpen(true)}>
          아이템 정보
        </button>
      </div>

      {reviewOpen ? (
        <InventoryReviewModal
          draftInventory={draftInventory}
          originalByCode={originalByCode}
          supported={supported}
          onClose={() => setReviewOpen(false)}
          onInventoryChange={onInventoryChange}
          onInventoryDelete={onInventoryDelete}
          onInventoryAdd={onInventoryAdd}
        />
      ) : null}

      {pickerOpen ? (
        <InventoryPicker
          currentItemCodes={draftInventory.map((item) => item.itemCode)}
          onClose={() => setPickerOpen(false)}
          onAdd={(item) => {
            if (onInventoryAdd(item)) {
              setPickerOpen(false);
            }
          }}
        />
      ) : null}

      {itemInfoOpen ? <ItemInfoModal onClose={() => setItemInfoOpen(false)} /> : null}
    </article>
  );
}

function InventoryReviewModal({
  draftInventory,
  originalByCode,
  supported,
  onClose,
  onInventoryChange,
  onInventoryDelete,
  onInventoryAdd
}: {
  draftInventory: DraftInventorySlot[];
  originalByCode: Map<number, InventorySlotInfo>;
  supported: boolean;
  onClose: () => void;
  onInventoryChange: (index: number, value: string) => void;
  onInventoryDelete: (index: number) => void;
  onInventoryAdd: (item: InventoryCatalogItem) => boolean;
}) {
  const [query, setQuery] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [activeCategory, setActiveCategory] = useState<EquipmentPickerCategory>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const listCategory: PickerCategory = activeCategory === "manual" ? "all" : activeCategory;
  const filteredInventory = draftInventory
    .map((item, index) => ({ item, index, catalogItem: getCatalogItem(item.itemCode) }))
    .filter(({ item, catalogItem }) => {
      if (activeCategory === "manual") {
        return false;
      }
      const name = catalogItem?.name ?? originalByCode.get(item.itemCode)?.name ?? "알 수 없음";
      if (activeCategory !== "all" && catalogItem?.category !== activeCategory) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return name.toLowerCase().includes(normalizedQuery) || String(item.itemCode).includes(normalizedQuery);
    })
    .sort((a, b) => compareGroupedCatalogItems(a.catalogItem, b.catalogItem, listCategory) || a.index - b.index);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="item-picker inventory-review-modal"
        role="dialog"
        aria-modal="true"
        aria-label="아이템 확인"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>아이템 확인</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="item-picker-body">
          <aside className="item-picker-sidebar">
            <button
              type="button"
              className={activeCategory === "all" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveCategory("all")}
            >
              전체
            </button>
            <ItemCategoryFilterTabs
              activeCategory={activeCategory}
              onCategoryChange={(category) => setActiveCategory(category)}
            />
            <div className="picker-sidebar-divider" />
            <button
              type="button"
              className={activeCategory === "manual" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveCategory("manual")}
            >
              수동 코드 입력
            </button>
          </aside>

          <section className="item-picker-results">
            {activeCategory === "manual" ? (
              <ManualCodeInput
                value={manualCode}
                ariaLabel="수동 아이템 코드"
                helpText="목록에 없는 아이템 코드를 직접 입력합니다."
                confirmMessage="255를 넘는 아이템 코드입니다. 그래도 추가할까요?"
                onChange={setManualCode}
                onAdd={(code) => {
                  onInventoryAdd({ code, name: "알 수 없음", category: "item" });
                }}
              />
            ) : (
              <>
                <input
                  className="item-picker-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="이름 또는 코드 검색"
                />
                {draftInventory.length === 0 ? (
                  <p className="empty compact">인벤토리가 비어있습니다.</p>
                ) : filteredInventory.length === 0 ? (
                  <p className="empty compact">필터에 맞는 항목이 없습니다.</p>
                ) : (
                  <div className="inventory-review-list">
                    {filteredInventory.map(({ item, index, catalogItem }, itemIndex) => {
                      const original = originalByCode.get(item.itemCode);
                      const name = catalogItem?.name ?? original?.name ?? "알 수 없음";
                      const stats = catalogItem ? getItemStatText(name) : `code ${item.itemCode}`;
                      const groupLabel = getInventoryResultGroupLabel(catalogItem, listCategory);
                      const previousGroupLabel =
                        itemIndex > 0 ? getInventoryResultGroupLabel(filteredInventory[itemIndex - 1].catalogItem, listCategory) : null;
                      const showGroupDivider = groupLabel !== null && groupLabel !== previousGroupLabel;
                      return (
                  <React.Fragment key={`${item.itemCode}-${index}`}>
                    {showGroupDivider ? <div className="item-group-divider inventory-group-divider">{groupLabel}</div> : null}
                          <div className="inventory-entry">
                            <div className="inventory-row">
                              <ItemIcon item={catalogItem ?? { code: item.itemCode, unknown: true }} />
                              <div className="inventory-row-main">
                                <strong>{name}</strong>
                                {stats ? <small className="item-stat-text">{stats}</small> : null}
                              </div>
                              <input
                                aria-label={`${name} 수량`}
                                inputMode="numeric"
                                value={item.quantity}
                                onChange={(event) => onInventoryChange(index, event.target.value)}
                                placeholder="0"
                                min={0}
                                max={99}
                                disabled={!supported}
                              />
                              <button
                                type="button"
                                className="danger-button"
                                onClick={() => onInventoryDelete(index)}
                                disabled={!supported}
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function InventoryPicker({
  currentItemCodes,
  onClose,
  onAdd
}: {
  currentItemCodes: number[];
  onClose: () => void;
  onAdd: (item: InventoryCatalogItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<InventoryItemCategory | "all">("all");
  const normalizedQuery = query.trim().toLowerCase();
  const items = INVENTORY_CATALOG.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return item.name.toLowerCase().includes(normalizedQuery) || String(item.code).includes(normalizedQuery);
  }).sort((a, b) => compareGroupedCatalogItems(a, b, activeCategory));

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="item-picker"
        role="dialog"
        aria-modal="true"
        aria-label="아이템 추가"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>아이템 추가</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="item-picker-body">
          <aside className="item-picker-sidebar">
            <button
              type="button"
              className={activeCategory === "all" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveCategory("all")}
            >
              전체
            </button>
            <ItemCategoryFilterTabs
              activeCategory={activeCategory}
              onCategoryChange={(category) => setActiveCategory(category)}
            />
          </aside>

          <section className="item-picker-results">
            <input
              className="item-picker-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름 또는 코드 검색"
            />
            <div className="item-picker-list inventory-picker-list">
              {items.map((item, index) => {
                const alreadyAdded = currentItemCodes.includes(item.code);
                const stats = getItemStatText(item.name);
                const groupLabel = getInventoryResultGroupLabel(item, activeCategory);
                const previousGroupLabel = index > 0 ? getInventoryResultGroupLabel(items[index - 1], activeCategory) : null;
                const showGroupDivider = groupLabel !== null && groupLabel !== previousGroupLabel;
                return (
                  <React.Fragment key={`${item.category}-${item.code}`}>
                    {showGroupDivider ? <div className="item-group-divider picker-group-divider">{groupLabel}</div> : null}
                    <button
                      type="button"
                      className={alreadyAdded ? "item-picker-row inventory-item-row disabled" : "item-picker-row inventory-item-row"}
                      onClick={() => {
                        if (alreadyAdded) {
                          window.alert("이미 인벤토리에 추가된 항목입니다.");
                          return;
                        }
                        onAdd(item);
                      }}
                    >
                      <ItemIcon item={item} />
                      <span className="item-picker-main">
                        <span className="item-picker-name">{item.name}</span>
                        {stats ? <small className="item-stat-text">{stats}</small> : null}
                      </span>
                      <small className="item-picker-code">{item.code}</small>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function ItemInfoModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PickerCategory>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const items = INVENTORY_CATALOG.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return item.name.toLowerCase().includes(normalizedQuery) || String(item.code).includes(normalizedQuery);
  }).sort((a, b) => compareGroupedCatalogItems(a, b, activeCategory));

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="item-picker"
        role="dialog"
        aria-modal="true"
        aria-label="아이템 정보"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>아이템 정보</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="item-picker-body">
          <aside className="item-picker-sidebar">
            <button
              type="button"
              className={activeCategory === "all" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveCategory("all")}
            >
              전체
            </button>
            <ItemCategoryFilterTabs
              activeCategory={activeCategory}
              onCategoryChange={(category) => setActiveCategory(category)}
            />
          </aside>

          <section className="item-picker-results">
            <input
              className="item-picker-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름 또는 코드 검색"
            />
            <div className="item-picker-list inventory-picker-list">
              {items.map((item, index) => {
                const stats = getItemStatText(item.name);
                const groupLabel = getInventoryResultGroupLabel(item, activeCategory);
                const previousGroupLabel = index > 0 ? getInventoryResultGroupLabel(items[index - 1], activeCategory) : null;
                const showGroupDivider = groupLabel !== null && groupLabel !== previousGroupLabel;
                return (
                  <React.Fragment key={`${item.category}-${item.code}`}>
                    {showGroupDivider ? <div className="item-group-divider picker-group-divider">{groupLabel}</div> : null}
                    <div className="item-picker-row inventory-item-row">
                      <ItemIcon item={item} />
                      <span className="item-picker-main">
                        <span className="item-picker-name">{item.name}</span>
                        {stats ? <small className="item-stat-text">{stats}</small> : null}
                      </span>
                      <small className="item-picker-code">{item.code}</small>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function PartyEditor({
  party,
  codes,
  selectedCode,
  onAdd,
  onRemove,
  onMove,
  onSelect
}: {
  party?: PartyInfo;
  codes: number[];
  selectedCode: number | null;
  onAdd: (code: number) => void;
  onRemove: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onSelect: (code: number) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <article className="party-card">
      <div className="section-title">
        <div>
          <h2>파티</h2>
        </div>
        <strong>{codes.length}명</strong>
      </div>

      <div className="party-lists">
        <section className="party-list-panel current-party">
          <div className="list-heading">
            <span>현재 파티</span>
            <small>드래그해서 순서 변경</small>
          </div>

          {codes.length === 0 ? (
            <p className="empty">등록된 파티원이 없습니다.</p>
          ) : (
            <ol className="party-member-list">
              {codes.map((code, index) => (
                <li
                  key={`${index}-${code}`}
                  className={[
                    "party-member",
                    dragIndex === index ? "dragging" : "",
                    selectedCode === code ? "selected" : ""
                  ].join(" ")}
                  draggable
                  onClick={() => onSelect(code)}
                  onDragStart={(event) => {
                    setDragIndex(index);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(index));
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const sourceIndex = dragIndex ?? Number(event.dataTransfer.getData("text/plain"));
                    onMove(sourceIndex, index);
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                >
                  <span className="drag-handle">::</span>
                  <span className="member-slot">{index + 1}</span>
                  <span className="member-name">{CHARACTER_NAMES.get(code) ?? `알 수 없음 (${code})`}</span>
                  <span className="member-code">{code}</span>
                  <button type="button" className="danger-button" onClick={() => onRemove(index)}>
                    삭제
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>

        <button type="button" className="inventory-add-button" onClick={() => setPickerOpen(true)} disabled={codes.length >= 15}>
          파티원 추가
        </button>
      </div>

      {pickerOpen ? (
        <PartyPicker
          currentCodes={codes}
          onClose={() => setPickerOpen(false)}
          onAdd={(code) => onAdd(code)}
        />
      ) : null}
    </article>
  );
}

function PartyPicker({
  currentCodes,
  onClose,
  onAdd
}: {
  currentCodes: number[];
  onClose: () => void;
  onAdd: (code: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<CharacterGroup | "all">("all");
  const normalizedQuery = query.trim().toLowerCase();
  const characters = CHARACTER_OPTIONS.filter((character) => {
    const group = getCharacterGroup(character.name);
    if (activeGroup !== "all" && group !== activeGroup) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return character.name.toLowerCase().includes(normalizedQuery) || String(character.code).includes(normalizedQuery);
  }).sort((a, b) => {
    const groupCompare = getCharacterGroupRank(a.name) - getCharacterGroupRank(b.name);
    if (groupCompare !== 0) {
      return groupCompare;
    }
    return a.name.localeCompare(b.name, "ko-KR") || a.code - b.code;
  });

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="item-picker"
        role="dialog"
        aria-modal="true"
        aria-label="파티원 추가"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>파티원 추가</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="item-picker-body">
          <aside className="item-picker-sidebar">
            <button
              type="button"
              className={activeGroup === "all" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveGroup("all")}
            >
              전체
            </button>
            {(["normal", "episode", "arena"] as CharacterGroup[]).map((group) => (
              <button
                key={group}
                type="button"
                className={activeGroup === group ? "picker-tab active" : "picker-tab"}
                onClick={() => setActiveGroup(group)}
              >
                {getCharacterGroupFilterLabel(group)}
              </button>
            ))}
          </aside>

          <section className="item-picker-results">
            <input
              className="item-picker-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름 또는 코드 검색"
            />
            <div className="item-picker-list">
              {characters.map((character, index) => {
                const group = getCharacterGroup(character.name);
                const previousGroup = index > 0 ? getCharacterGroup(characters[index - 1].name) : null;
                const showGroupDivider = group !== previousGroup;
                const alreadyAdded = currentCodes.includes(character.code);

                return (
                  <React.Fragment key={`${character.code}-${character.name}`}>
                    {showGroupDivider ? (
                      <div className="character-divider-row">
                        <span>{getCharacterGroupLabel(group)}</span>
                        {group === "arena" ? (
                          <small>아레나 캐릭터의 경험치는 저장되지 않으며 전투 종료시 레벨 1로 돌아갑니다.</small>
                        ) : null}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className={alreadyAdded ? `item-picker-row disabled ${group}-character` : `item-picker-row ${group}-character`}
                      onClick={() => {
                        if (alreadyAdded) {
                          window.alert("이미 파티에 추가된 캐릭터입니다.");
                          return;
                        }
                        if (currentCodes.length >= 15) {
                          window.alert("파티는 최대 15명까지 저장합니다.");
                          return;
                        }
                        onAdd(character.code);
                      }}
                    >
                      <span>{character.name}</span>
                      <small>
                        {getCharacterGroupLabel(group)} / {character.code}
                      </small>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function EquipmentEditor({
  save,
  scope,
  selectedCode,
  draftEquipment,
  onChange
}: {
  save: SaveInfo | null;
  scope: EquipmentScope;
  selectedCode: number | null;
  draftEquipment: Record<number, Record<EquipmentSlotKey, number>>;
  onChange: (characterCode: number, slot: EquipmentSlotKey, value: number) => void;
}) {
  const [pickerSlot, setPickerSlot] = useState<EquipmentSlotKey | null>(null);
  const equipmentByCode = useMemo(() => {
    return new Map(save?.equipment[scope].map((equipment) => [equipment.characterCode, equipment]) ?? []);
  }, [save, scope]);
  const currentEquipment = selectedCode === null ? null : equipmentByCode.get(selectedCode) ?? buildUnsupportedEquipment(selectedCode, scope);
  const selectedDraft =
    selectedCode === null
      ? null
      : draftEquipment[selectedCode] ?? buildEquipmentDraft(equipmentByCode.get(selectedCode));

  return (
    <article className="equipment-card">
      <div className="section-title">
        <div>
          <h2>{currentEquipment?.characterName ?? "캐릭터 선택"}</h2>
        </div>
      </div>

      {!currentEquipment ? (
        <p className="empty">왼쪽 파티 목록에서 캐릭터를 선택하세요.</p>
      ) : currentEquipment.supported && selectedDraft ? (
        <div className="equipment-slots">
          <div className="equipment-note">
            <small>
              {scope === "field"
                ? "챕터/연대표 캐릭터 장비만 저장됩니다."
                : "전투 중 현재 장비만 저장됩니다."}
            </small>
          </div>

          {EQUIPMENT_SLOT_DEFINITIONS.map((slot) => {
            const slotInfo = currentEquipment.slots.find((item) => item.key === slot.key);
            const value = selectedDraft[slot.key] ?? slotInfo?.value ?? 0;
            const options = getEquipmentSelectOptions(slot.key, value);
            const selectedOption = options.find((option) => option.code === value);
            const isUnknownEquipment = !selectedOption || selectedOption.name === "현재 저장값";
            const selectedName = value === 0 ? "장비 해제" : selectedOption?.name ?? "현재 저장값";
            const selectedStats = value === 0 ? undefined : isUnknownEquipment ? `code ${value}` : getItemStatText(selectedName);
            return (
              <div key={slot.key} className="equipment-entry">
                <small className="equipment-slot-label">{slot.label}</small>
                <div className="equipment-row">
                  <ItemIcon
                    item={
                      value === 0
                        ? { code: 0, category: slot.key }
                        : selectedOption && !isUnknownEquipment
                          ? { ...selectedOption, category: slot.key }
                          : { code: value, category: slot.key, unknown: true }
                    }
                  />
                  <div className="equipment-row-main">
                    <strong>{selectedName}</strong>
                    {selectedStats ? <small className="item-stat-text">{selectedStats}</small> : null}
                  </div>
                  <button type="button" className="equipment-change-button" onClick={() => setPickerSlot(slot.key)}>
                    변경
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="equipment-note unsupported">
          <small>{currentEquipment.note ?? "이 캐릭터의 장비 위치는 아직 확인되지 않았습니다."}</small>
        </div>
      )}

      {pickerSlot && currentEquipment?.supported && selectedDraft ? (
        <EquipmentPicker
          slotKey={pickerSlot}
          currentValue={selectedDraft[pickerSlot] ?? 0}
          onClose={() => setPickerSlot(null)}
          onSelect={(value) => {
            onChange(currentEquipment.characterCode, pickerSlot, value);
            setPickerSlot(null);
          }}
        />
      ) : null}
    </article>
  );
}

type EquipmentPickerItem = {
  code: number;
  name: string;
  category: InventoryItemCategory | null;
  weaponKind?: WeaponKind;
  consumableKind?: ConsumableKind;
  unknown?: boolean;
};

type PickerCategory = InventoryItemCategory | "all";
type EquipmentPickerCategory = PickerCategory | "manual";

function EquipmentPicker({
  slotKey,
  currentValue,
  onClose,
  onSelect
}: {
  slotKey: EquipmentSlotKey;
  currentValue: number;
  onClose: () => void;
  onSelect: (value: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<EquipmentPickerCategory>(slotKey);
  const [manualCode, setManualCode] = useState("");
  const slotLabel = EQUIPMENT_SLOT_DEFINITIONS.find((slot) => slot.key === slotKey)?.label ?? "장비";
  const normalizedQuery = query.trim().toLowerCase();
  const listCategory: PickerCategory = activeCategory === "manual" ? "all" : activeCategory;
  const items = getEquipmentPickerItems(slotKey, currentValue).filter((item) => {
    if (activeCategory === "manual") {
      return false;
    }
    if (activeCategory !== "all" && item.category !== null && item.category !== activeCategory) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return item.name.toLowerCase().includes(normalizedQuery) || String(item.code).includes(normalizedQuery);
  }).sort((a, b) => compareGroupedCatalogItems(a, b, listCategory));

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="item-picker"
        role="dialog"
        aria-modal="true"
        aria-label={`${slotLabel} 변경`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>{slotLabel} 변경</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="item-picker-body">
          <aside className="item-picker-sidebar">
            <button
              type="button"
              className={activeCategory === "all" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveCategory("all")}
            >
              전체
            </button>
            <ItemCategoryFilterTabs
              activeCategory={activeCategory}
              onCategoryChange={(category) => setActiveCategory(category)}
            />
            <div className="picker-sidebar-divider" />
            <button
              type="button"
              className={activeCategory === "manual" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveCategory("manual")}
            >
              수동 코드 입력
            </button>
          </aside>

          <section className="item-picker-results">
            {activeCategory === "manual" ? (
              <ManualCodeInput
                value={manualCode}
                ariaLabel="수동 장비 코드"
                helpText="목록에 없는 장비 코드를 직접 입력합니다."
                confirmMessage="255를 넘는 장비 코드입니다. 그래도 추가할까요?"
                onChange={setManualCode}
                onAdd={(code) => onSelect(code)}
              />
            ) : (
              <>
                <input
                  className="item-picker-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="이름 또는 코드 검색"
                />
                <div className="item-picker-list inventory-picker-list">
                  {items.map((item, index) => {
                    const selected = item.code === currentValue;
                    const stats = item.unknown ? `code ${item.code}` : getItemStatText(item.name);
                    const groupLabel = getInventoryResultGroupLabel(item, listCategory);
                    const previousGroupLabel = index > 0 ? getInventoryResultGroupLabel(items[index - 1], listCategory) : null;
                    const showGroupDivider = groupLabel !== null && groupLabel !== previousGroupLabel;
                    return (
                      <React.Fragment key={`${item.category}-${item.code}`}>
                        {showGroupDivider ? <div className="item-group-divider picker-group-divider">{groupLabel}</div> : null}
                        <button
                          type="button"
                          className={selected ? "item-picker-row inventory-item-row disabled" : "item-picker-row inventory-item-row"}
                          onClick={() => {
                            if (selected) {
                              return;
                            }
                            if (item.category !== null && item.category !== slotKey) {
                              const expectedLabel = getInventoryCategoryLabel(slotKey);
                              const actualLabel = getInventoryCategoryLabel(item.category);
                              const approved = window.confirm(
                                `${slotLabel} 슬롯에 ${actualLabel} 항목을 선택했습니다. ${expectedLabel} 항목이 아니어도 변경할까요?`
                              );
                              if (!approved) {
                                return;
                              }
                            }
                            onSelect(item.code);
                          }}
                        >
                          <ItemIcon item={item} />
                          <span className="item-picker-main">
                            <span className="item-picker-name">{item.name}</span>
                            {stats ? <small className="item-stat-text">{stats}</small> : null}
                          </span>
                          <small className="item-picker-code">{item.code}</small>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function ManualCodeInput({
  value,
  ariaLabel,
  helpText,
  confirmMessage,
  onChange,
  onAdd
}: {
  value: string;
  ariaLabel: string;
  helpText: string;
  confirmMessage: string;
  onChange: (value: string) => void;
  onAdd: (code: number) => void;
}) {
  const trimmedValue = value.trim();
  const parsedCode = Number(trimmedValue);
  const canAdd = trimmedValue.length > 0 && Number.isInteger(parsedCode) && parsedCode >= 0 && parsedCode <= 0xffff;
  return (
    <div className="manual-code-panel">
      <div className="manual-code-editor">
        <ItemIcon item={{ unknown: true }} />
        <input
          aria-label={ariaLabel}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0~255"
        />
      </div>
      <button
        type="button"
        className="inventory-add-button"
        disabled={!canAdd}
        onClick={() => {
          if (!canAdd) {
            return;
          }

          if (parsedCode > 255) {
            const approved = window.confirm(confirmMessage);
            if (!approved) {
              return;
            }
          }

          onAdd(parsedCode);
        }}
      >
        추가
      </button>
      <small className="manual-code-help">{helpText}</small>
    </div>
  );
}

function MercenaryEditor({
  save,
  selectedCode,
  draftMercenaries,
  onChange
}: {
  save: SaveInfo | null;
  selectedCode: number | null;
  draftMercenaries: DraftMercenaries;
  onChange: (characterCode: number, value: number) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const mercenaryByCode = useMemo(() => {
    return new Map(save?.mercenaries.map((mercenary) => [mercenary.characterCode, mercenary]) ?? []);
  }, [save]);
  const currentMercenary =
    selectedCode === null ? null : mercenaryByCode.get(selectedCode) ?? buildUnsupportedMercenary(selectedCode);
  const value =
    selectedCode === null
      ? 0
      : draftMercenaries[selectedCode] ?? currentMercenary?.value ?? 0;

  return (
    <article className="equipment-card">
      <div className="section-title">
        <div>
          <h2>{currentMercenary?.characterName ?? "캐릭터 선택"}</h2>
        </div>
      </div>

      {!currentMercenary ? (
        <p className="empty">왼쪽 파티 목록에서 캐릭터를 선택하세요.</p>
      ) : currentMercenary.supported ? (
        <div className="equipment-slots">
          <div className="equipment-note">
            <small>확인된 캐릭터별 용병단 보유값만 저장됩니다.</small>
          </div>

          <div className="equipment-field">
            <span>용병단</span>
            <button type="button" className="mercenary-option active" onClick={() => setPickerOpen(true)}>
              <span>{getMercenaryName(value)}</span>
              <small>{value}</small>
            </button>
          </div>
        </div>
      ) : (
        <div className="equipment-note unsupported">
          <small>{currentMercenary.note ?? "이 캐릭터의 용병단 위치는 아직 확인되지 않았습니다."}</small>
        </div>
      )}

      {pickerOpen && currentMercenary?.supported ? (
        <MercenaryPicker
          currentValue={value}
          onClose={() => setPickerOpen(false)}
          onSelect={(nextValue) => {
            onChange(currentMercenary.characterCode, nextValue);
            setPickerOpen(false);
          }}
        />
      ) : null}
    </article>
  );
}

function MercenaryPicker({
  currentValue,
  onClose,
  onSelect
}: {
  currentValue: number;
  onClose: () => void;
  onSelect: (value: number) => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const options = getMercenaryOptions(currentValue).filter((option) => {
    if (!normalizedQuery) {
      return true;
    }
    return option.name.toLowerCase().includes(normalizedQuery) || String(option.code).includes(normalizedQuery);
  });

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="item-picker"
        role="dialog"
        aria-modal="true"
        aria-label="용병단 선택"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>용병단 선택</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="item-picker-body">
          <aside className="item-picker-sidebar">
            <button type="button" className="picker-tab active">
              전체
            </button>
          </aside>

          <section className="item-picker-results">
            <input
              className="item-picker-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름 또는 코드 검색"
            />
            <div className="item-picker-list">
              {options.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={option.code === currentValue ? "item-picker-row disabled" : "item-picker-row"}
                  onClick={() => onSelect(option.code)}
                >
                  <span>{option.name}</span>
                  <small>{option.code}</small>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function ItemIcon({
  item
}: {
  item?: {
    code?: number;
    category?: InventoryItemCategory | null;
    weaponKind?: WeaponKind;
    consumableKind?: ConsumableKind;
    unknown?: boolean;
  } | null;
}) {
  const src = getItemIconSrc(item);
  const className = item?.code === 0 ? "item-icon-slot empty-equipment" : "item-icon-slot";
  return (
    <span className={className} aria-hidden="true">
      {src ? <img src={src} alt="" /> : null}
    </span>
  );
}

function ItemCategoryFilterTabs({
  activeCategory,
  onCategoryChange
}: {
  activeCategory: PickerCategory | "manual";
  onCategoryChange: (category: InventoryItemCategory) => void;
}) {
  return (
    <>
      {inventoryCategoryOptions.map((category) => (
        <button
          key={category.key}
          type="button"
          className={activeCategory === category.key ? "picker-tab active" : "picker-tab"}
          onClick={() => onCategoryChange(category.key)}
        >
          {category.label}
        </button>
      ))}
    </>
  );
}

function getItemIconSrc(
  item?: {
    code?: number;
    category?: InventoryItemCategory | null;
    weaponKind?: WeaponKind;
    consumableKind?: ConsumableKind;
    unknown?: boolean;
  } | null
): string | undefined {
  if (item?.unknown) {
    return "/item-icons/unknown.png";
  }
  if (item?.weaponKind === "sword") {
    return "/item-icons/sword.png";
  }
  if (item?.weaponKind === "booster") {
    return "/item-icons/booster.png";
  }
  if (item?.weaponKind === "gun-slicer") {
    return "/item-icons/gun-slicer.png";
  }
  if (item?.weaponKind === "handgun") {
    return "/item-icons/handgun.png";
  }
  if (item?.weaponKind === "cigar") {
    return "/item-icons/cigar.png";
  }
  if (item?.weaponKind === "greatsword") {
    return "/item-icons/greatsword.png";
  }
  if (item?.weaponKind === "ribbon") {
    return "/item-icons/ribbon.png";
  }
  if (item?.weaponKind === "camera-lens") {
    return "/item-icons/camera-lens.png";
  }
  if (item?.weaponKind === "claw") {
    return "/item-icons/claw.png";
  }
  if (item?.weaponKind === "yoyo") {
    return "/item-icons/yoyo.png";
  }
  if (item?.weaponKind === "bottle") {
    return "/item-icons/bottle.png";
  }
  if (item?.consumableKind === "potion") {
    return "/item-icons/potion.png";
  }
  if (item?.consumableKind === "first-aid") {
    return "/item-icons/first-aid.png";
  }
  if (item?.consumableKind === "poison") {
    return "/item-icons/poison.png";
  }
  if (item?.consumableKind === "bomb") {
    return "/item-icons/bomb.png";
  }
  if (item?.category === "armor") {
    return "/item-icons/armor.png";
  }
  if (item?.category === "necklace") {
    return "/item-icons/necklace.png";
  }
  if (item?.category === "ring") {
    return "/item-icons/ring.png";
  }
  if (item?.category === "belt") {
    return "/item-icons/belt.png";
  }
  if (item?.category === "shoes") {
    return "/item-icons/shoes.png";
  }
  return item ? "/item-icons/unknown.png" : undefined;
}

function getEquipmentSelectOptions(slot: EquipmentSlotKey, currentValue: number): EquipmentOption[] {
  const options = EQUIPMENT_OPTIONS[slot];
  if (options.some((option) => option.code === currentValue)) {
    return options;
  }
  return [{ code: currentValue, name: "현재 저장값" }, ...options];
}

function getEquipmentPickerItems(slot: EquipmentSlotKey, currentValue: number): EquipmentPickerItem[] {
  const items = new Map<string, EquipmentPickerItem>();
  const addItem = (item: EquipmentPickerItem) => {
    items.set(`${item.category}-${item.code}`, item);
  };

  addItem({ code: 0, name: "장비 해제", category: null });
  for (const item of INVENTORY_CATALOG) {
    addItem(item);
  }

  if (![...items.values()].some((item) => item.code === currentValue)) {
    const currentOption = getEquipmentSelectOptions(slot, currentValue).find((option) => option.code === currentValue);
    addItem({
      code: currentValue,
      name: currentOption?.name ?? "현재 저장값",
      category: slot,
      weaponKind: currentOption?.weaponKind,
      unknown: !currentOption || currentOption.name === "현재 저장값"
    });
  }

  return [...items.values()].sort((a, b) => {
    const leftCategory = a.category;
    const rightCategory = b.category;
    if (leftCategory === null && rightCategory !== null) {
      return -1;
    }
    if (leftCategory !== null && rightCategory === null) {
      return 1;
    }
    if (leftCategory !== null && rightCategory !== null && leftCategory !== rightCategory) {
      return leftCategory.localeCompare(rightCategory);
    }
    return a.code - b.code;
  });
}

function getMercenaryOptions(currentValue: number): Array<{ code: number; name: string }> {
  if (MERCENARY_OPTIONS.some((option) => option.code === currentValue)) {
    return MERCENARY_OPTIONS;
  }
  return [{ code: currentValue, name: "현재 저장값" }, ...MERCENARY_OPTIONS];
}

function getMercenaryName(value: number): string {
  return MERCENARY_OPTIONS.find((option) => option.code === value)?.name ?? "현재 저장값";
}

function buildUnsupportedEquipment(characterCode: number, scope: EquipmentScope): CharacterEquipmentInfo {
  const characterName = CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`;
  return {
    characterCode,
    characterName,
    scope,
    supported: false,
    note: getCharacterGroup(characterName) === "arena"
          ? "아레나 캐릭터의 정보는 세이브 파일에 기록되지 않습니다."
          : "장비 오프셋이 확인되지 않았습니다.",
    slots: []
  };
}

function buildUnsupportedMercenary(characterCode: number): CharacterMercenaryInfo {
  const characterName = CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`;
  return {
    characterCode,
    characterName,
    supported: false,
    note:
      getCharacterGroup(characterName) === "arena"
        ? "아레나 캐릭터의 정보는 세이브 파일에 기록되지 않습니다."
        : "용병단 오프셋이 확인되지 않았습니다."
  };
}

function buildEquipmentDraft(equipment?: CharacterEquipmentInfo): Record<EquipmentSlotKey, number> | null {
  if (!equipment?.supported) {
    return null;
  }

  return Object.fromEntries(equipment.slots.map((slot) => [slot.key, slot.value])) as Record<EquipmentSlotKey, number>;
}

function buildEquipmentDrafts(equipment: CharacterEquipmentInfo[]): Record<number, Record<EquipmentSlotKey, number>> {
  return Object.fromEntries(
    equipment
      .filter((item) => item.supported)
      .map((item) => [
        item.characterCode,
        Object.fromEntries(item.slots.map((slot) => [slot.key, slot.value]))
      ])
  ) as Record<number, Record<EquipmentSlotKey, number>>;
}

function buildEquipmentEdits(
  equipment: SaveInfo["equipment"],
  draftEquipment: DraftEquipment
): CharacterEquipmentEdit[] {
  return (["field", "battle"] as EquipmentScope[]).flatMap((scope) =>
    equipment[scope]
      .filter((item) => item.supported && draftEquipment[scope][item.characterCode])
      .map((item) => ({
        characterCode: item.characterCode,
        scope,
        slots: Object.fromEntries(
          EQUIPMENT_SLOT_DEFINITIONS.map((slot) => [
            slot.key,
            draftEquipment[scope][item.characterCode][slot.key] ?? item.slots.find((value) => value.key === slot.key)?.value ?? 0
          ])
        ) as Record<EquipmentSlotKey, number>
      }))
  );
}

function buildMercenaryEdits(
  mercenaries: CharacterMercenaryInfo[],
  draftMercenaries: DraftMercenaries
): Array<{ characterCode: number; value: number }> {
  return mercenaries
    .filter((item) => item.supported && typeof draftMercenaries[item.characterCode] === "number")
    .map((item) => ({
      characterCode: item.characterCode,
      value: draftMercenaries[item.characterCode]
    }));
}

function buildInventoryDraft(inventory: InventorySlotInfo[]): DraftInventorySlot[] {
  return inventory.map((item) => ({
    itemCode: item.itemCode,
    quantity: String(item.quantity)
  }));
}

function parseInventoryDraft(inventory: DraftInventorySlot[]): InventorySlotEdit[] {
  return inventory.map((item) => ({
    itemCode: item.itemCode,
    quantity: item.quantity === "" ? 0 : Number(item.quantity.replaceAll(",", ""))
  }));
}

function isValidMoney(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
}

function isValidCount(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 99;
}

type CharacterGroup = "normal" | "episode" | "arena";

function getCharacterGroup(name: string): CharacterGroup {
  if (name.startsWith("에피소드")) {
    return "episode";
  }
  if (name.startsWith("아레나")) {
    return "arena";
  }
  return "normal";
}

function getCharacterGroupRank(name: string): number {
  const group = getCharacterGroup(name);
  if (group === "episode") {
    return 1;
  }
  if (group === "arena") {
    return 2;
  }
  return 0;
}

function getCharacterGroupLabel(group: CharacterGroup): string {
  if (group === "episode") {
    return "에피소드 캐릭터";
  }
  if (group === "arena") {
    return "아레나 캐릭터";
  }
  return "일반 캐릭터";
}

function getCharacterGroupFilterLabel(group: CharacterGroup): string {
  if (group === "episode") {
    return "에피소드";
  }
  if (group === "arena") {
    return "아레나";
  }
  return "일반";
}

const inventoryCategoryOptions: Array<{ key: InventoryItemCategory; label: string }> = [
  { key: "weapon", label: "무기" },
  { key: "armor", label: "방어구" },
  { key: "necklace", label: "목걸이" },
  { key: "ring", label: "반지" },
  { key: "belt", label: "허리띠" },
  { key: "shoes", label: "신발" },
  { key: "item", label: "소모품" }
];

const weaponKindOptions: WeaponKind[] = [
  "gun-slicer",
  "greatsword",
  "handgun",
  "cigar",
  "claw",
  "sword",
  "booster",
  "ribbon",
  "camera-lens",
  "bottle",
  "yoyo"
];

const consumableKindOptions: ConsumableKind[] = ["potion", "first-aid", "poison", "bomb"];

function getInventoryCategoryLabel(category: InventoryItemCategory): string {
  return inventoryCategoryOptions.find((item) => item.key === category)?.label ?? "항목";
}

type GroupableCatalogItem = {
  code: number;
  category?: InventoryItemCategory | null;
  weaponKind?: WeaponKind;
  consumableKind?: ConsumableKind;
};

function getInventoryResultGroupLabel(
  item: GroupableCatalogItem | undefined | null,
  activeCategory: PickerCategory
): string | null {
  if (activeCategory === "weapon" && item?.category === "weapon") {
    return WEAPON_KIND_LABELS[item.weaponKind ?? "unknown"];
  }
  if (activeCategory === "item" && item?.category === "item" && item.consumableKind) {
    return CONSUMABLE_KIND_LABELS[item.consumableKind];
  }
  return null;
}

function compareGroupedCatalogItems(
  left: GroupableCatalogItem | undefined | null,
  right: GroupableCatalogItem | undefined | null,
  activeCategory: PickerCategory
): number {
  if (activeCategory !== "weapon" && activeCategory !== "item") {
    return 0;
  }
  if (left?.category === null && right?.category !== null) {
    return -1;
  }
  if (left?.category !== null && right?.category === null) {
    return 1;
  }
  const groupCompare = getCatalogGroupRank(left, activeCategory) - getCatalogGroupRank(right, activeCategory);
  if (groupCompare !== 0) {
    return groupCompare;
  }
  return (left?.code ?? 0) - (right?.code ?? 0);
}

function getCatalogGroupRank(item: GroupableCatalogItem | undefined | null, activeCategory: PickerCategory): number {
  if (activeCategory === "weapon" && item?.category === "weapon") {
    const rank = weaponKindOptions.indexOf(item.weaponKind ?? "unknown");
    return rank >= 0 ? rank : weaponKindOptions.length;
  }
  if (activeCategory === "item" && item?.category === "item" && item.consumableKind) {
    const rank = consumableKindOptions.indexOf(item.consumableKind);
    return rank >= 0 ? rank : consumableKindOptions.length;
  }
  return -1;
}

function getCatalogItem(itemCode: number): InventoryCatalogItem | undefined {
  return INVENTORY_CATALOG.find((item) => item.code === itemCode);
}

function toHex(value: number, width: number): string {
  return value.toString(16).toUpperCase().padStart(width, "0");
}

function getFileName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() ?? filePath;
}
