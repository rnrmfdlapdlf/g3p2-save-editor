import React, { DragEvent, useEffect, useMemo, useState } from "react";
import {
  CharacterEquipmentEdit,
  CharacterEquipmentInfo,
  CharacterMercenaryInfo,
  CHARACTER_NAMES,
  CHARACTER_OPTIONS,
  EQUIPMENT_OPTIONS,
  EQUIPMENT_SLOT_DEFINITIONS,
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
  SaveInfo
} from "../shared/saveFormat";

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
const inventorySlotLimits: Record<EpisodeKey, number> = {
  episode4: 12,
  episode5: 4
};

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
    const slotLimit = inventorySlotLimits[activeEpisode];
    if (currentItems.length >= slotLimit) {
      window.alert(`인벤토리는 최대 ${slotLimit}개 항목까지 저장합니다.`);
      setStatus(`인벤토리는 최대 ${slotLimit}개 항목까지 저장합니다.`);
      return false;
    }
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
        onDragLeave={() => setDragging(false)}
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

          <ChecksumBadge save={save} />
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const originalByCode = useMemo(() => {
    return new Map(originalInventory.map((item) => [item.itemCode, item]));
  }, [originalInventory]);
  const supported = Boolean(save);

  return (
    <article className="equipment-card inventory-card">
      <div className="section-title">
        <div>
          <span className="eyebrow">인벤토리</span>
          <h2>인벤토리</h2>
        </div>
      </div>

      <div className="equipment-slots">
        <div className="inventory-section-heading">
          <span>돈</span>
        </div>

        <div className="edit-panel inventory-money-editor">
          <label htmlFor="money">돈</label>
          <input
            id="money"
            inputMode="numeric"
            value={draftMoneyValue}
            onChange={(event) => onMoneyChange(event.target.value)}
            placeholder="99999"
          />
        </div>

        <div className="inventory-section-heading">
          <span>인벤토리 항목</span>
        </div>

        {draftInventory.length === 0 ? (
          <p className="empty compact">인벤토리가 비어있습니다.</p>
        ) : (
          <div className="inventory-list">
            {draftInventory.map((item, index) => {
              const original = originalByCode.get(item.itemCode);
              const catalogItem = getCatalogItem(item.itemCode);
              const name = catalogItem?.name ?? original?.name ?? "알 수 없음";
              const metadata = original
                ? `code ${item.itemCode} / code offset 0x${toHex(original.codeOffset, 4)} / quantity offset 0x${toHex(
                    original.quantityOffset,
                    4
                  )} / raw ${original.rawQuantity}`
                : `code ${item.itemCode}`;
              return (
                <div key={`${item.itemCode}-${index}`} className="inventory-entry">
                  <div className="inventory-row">
                    <div className="inventory-row-main">
                      <strong>{name}</strong>
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
                  <small className="inventory-metadata">{metadata}</small>
                </div>
              );
            })}
          </div>
        )}

        <button type="button" className="inventory-add-button" onClick={() => setPickerOpen(true)} disabled={!supported}>
          항목 추가
        </button>

      </div>

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
    </article>
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
  });

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="item-picker"
        role="dialog"
        aria-modal="true"
        aria-label="인벤토리 항목 추가"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>인벤토리 항목 추가</h2>
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
            {inventoryCategoryOptions.map((category) => (
              <button
                key={category.key}
                type="button"
                className={activeCategory === category.key ? "picker-tab active" : "picker-tab"}
                onClick={() => setActiveCategory(category.key)}
              >
                {category.label}
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
              {items.map((item) => {
                const alreadyAdded = currentItemCodes.includes(item.code);
                return (
                  <button
                    key={`${item.category}-${item.code}`}
                    type="button"
                    className={alreadyAdded ? "item-picker-row disabled" : "item-picker-row"}
                    onClick={() => {
                      if (alreadyAdded) {
                        window.alert("이미 인벤토리에 추가된 항목입니다.");
                        return;
                      }
                      onAdd(item);
                    }}
                  >
                    <span>{item.name}</span>
                    <small>
                      {getInventoryCategoryLabel(item.category)} / {item.code}
                    </small>
                  </button>
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
          <span className="eyebrow">파티</span>
          <h2>{party?.label ?? "파티 정보"}</h2>
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
            return (
              <label key={slot.key} className="equipment-field">
                <span>{slot.label}</span>
                <select
                  value={value}
                  onChange={(event) => onChange(currentEquipment.characterCode, slot.key, Number(event.target.value))}
                >
                  {options.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name} ({option.code})
                    </option>
                  ))}
                </select>
                <small>{slotInfo ? `offset 0x${toHex(slotInfo.offset, 4)} / ${slotInfo.raw}` : ""}</small>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="equipment-note unsupported">
          <small>{currentEquipment.note ?? "이 캐릭터의 장비 위치는 아직 확인되지 않았습니다."}</small>
        </div>
      )}
    </article>
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
            <small>
              {typeof currentMercenary.offset === "number" && currentMercenary.raw
                ? `offset 0x${toHex(currentMercenary.offset, 4)} / ${currentMercenary.raw}`
                : ""}
            </small>
          </div>
        </div>
      ) : (
        <div className="equipment-note unsupported">
          <small>{currentMercenary.note ?? "이 캐릭터의 용병단 위치는 아직 확인되지 않았습니다."}</small>
        </div>
      )}

      {pickerOpen && currentMercenary ? (
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

function getEquipmentSelectOptions(slot: EquipmentSlotKey, currentValue: number): Array<{ code: number; name: string }> {
  const options = EQUIPMENT_OPTIONS[slot];
  if (options.some((option) => option.code === currentValue)) {
    return options;
  }
  return [{ code: currentValue, name: "현재 저장값" }, ...options];
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
  return {
    characterCode,
    characterName: CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`,
    scope,
    supported: false,
    note: "장비 오프셋이 확인되지 않았습니다.",
    slots: []
  };
}

function buildUnsupportedMercenary(characterCode: number): CharacterMercenaryInfo {
  return {
    characterCode,
    characterName: CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`,
    supported: false,
    note: "용병단 오프셋이 확인되지 않았습니다."
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

function getInventoryCategoryLabel(category: InventoryItemCategory): string {
  return inventoryCategoryOptions.find((item) => item.key === category)?.label ?? "항목";
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
