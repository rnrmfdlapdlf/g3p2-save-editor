import React, { DragEvent, useEffect, useMemo, useState } from "react";
import {
  ABILITY_OPTIONS,
  AbilityCategory,
  AbilityOption,
  applySaveEdits,
  CharacterAbilitiesEdit,
  CharacterAbilitiesInfo,
  CharacterAbilityValueInfo,
  CharacterEquipmentEdit,
  CharacterEquipmentInfo,
  CharacterMercenaryInfo,
  CharacterMercenaryEdit,
  CharacterStatFieldInfo,
  CharacterStatKey,
  CharacterStatsEdit,
  CharacterStatsInfo,
  CHARACTER_BODY_OPTIONS,
  CHARACTER_FACE_OPTIONS,
  CHARACTER_JOB_OPTIONS,
  CHARACTER_NAMES,
  CHARACTER_NAME_OPTIONS,
  CHARACTER_OPTIONS,
  CHARACTER_VOICE_OPTIONS,
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
  PARTY_MEMBER_LIMIT,
  parseSave,
  SaveEditRequest,
  SaveDataScope,
  PartyInfo,
  SaveInfo,
  WEAPON_ATTACK_TYPE_OPTIONS,
  WEAPON_PIC_OPTIONS,
  WEAPON_TYPE_OPTIONS,
  WEAPON_KIND_LABELS,
  WeaponKind
} from "../shared/saveFormat";
import { getItemStatText } from "../shared/itemStats";

type DraftParties = Record<EpisodeKey, number[]>;
type DraftMoney = Record<SaveDataScope, Record<EpisodeKey, string>>;
type DraftInventorySlot = { itemCode: number; quantity: string };
type DraftInventory = Record<SaveDataScope, Record<EpisodeKey, DraftInventorySlot[]>>;
type CharacterDetailKey = "face" | "name" | "job" | "voice" | "body" | "weaponAttackType" | "weaponPicType" | "weaponType";
type CharacterAppearancePreset = {
  id: string;
  code: number;
  name: string;
  values: Record<CharacterDetailKey, number>;
};
type CharacterDetailField = {
  key: CharacterDetailKey;
  label: string;
  options: Array<{ code: number; name: string }>;
};
type DraftEquipmentEntry = Record<EquipmentSlotKey, number> & {
  face?: number;
  name?: number;
  job?: number;
  voice?: number;
  body?: number;
  weaponAttackType?: number;
  weaponPicType?: number;
  weaponType?: number;
};
type DraftEquipment = Record<EquipmentScope, Record<number, DraftEquipmentEntry>>;
type DraftMercenaries = Record<EquipmentScope, Record<number, number>>;
type DraftStatsEntry = Partial<Record<CharacterStatKey, string>>;
type DraftStats = Record<EquipmentScope, Record<number, DraftStatsEntry>>;
type DraftAbilitiesEntry = Record<number, string>;
type DraftAbilities = Record<EquipmentScope, Record<number, DraftAbilitiesEntry>>;
type MainTab = {
  key: string;
  episode: EpisodeKey;
  scope: SaveDataScope;
  label: string;
};
type MainTabKey = "episode4Field" | "episode5Field" | "episode4Battle" | "episode5Battle";
type CharacterEditorTab = "equipment" | "abilities" | "stats" | "appearance";
type LoadedSave = {
  save: SaveInfo;
  browserBytes?: Uint8Array | null;
};
type AdoptSaveOptions = {
  preserveUi?: boolean;
};

const mainTabs: Array<MainTab & { key: MainTabKey }> = [
  { key: "episode4Field", episode: "episode4", scope: "field", label: "에피소드4" },
  { key: "episode5Field", episode: "episode5", scope: "field", label: "에피소드5" },
  { key: "episode4Battle", episode: "episode4", scope: "battle", label: "에피소드4(전투)" },
  { key: "episode5Battle", episode: "episode5", scope: "battle", label: "에피소드5(전투)" }
];

const characterEditorTabLabels: Record<CharacterEditorTab, string> = {
  equipment: "장비",
  abilities: "어빌리티",
  stats: "스탯",
  appearance: "외형"
};

const dataScopes: SaveDataScope[] = ["field", "battle"];
const episodeKeys: EpisodeKey[] = ["episode4", "episode5"];

const characterAppearancePresets: CharacterAppearancePreset[] = [
  { id: "나야트레이", code: 563, name: "나야트레이", values: { face: 1288, name: 2567, job: 2568, voice: 11, body: 1277, weaponAttackType: 1, weaponType: 11, weaponPicType: 43 } },
  { id: "네리사", code: 236, name: "네리사", values: { face: 655, name: 30, job: 1986, voice: 13, body: 899, weaponAttackType: 1, weaponType: 8, weaponPicType: 40 } },
  { id: "데미안 (에피소드4)", code: 237, name: "데미안 (에피소드4)", values: { face: 657, name: 228, job: 1987, voice: 14, body: 256, weaponAttackType: 1, weaponType: 14, weaponPicType: 56 } },
  { id: "데미안 (에피소드5)", code: 427, name: "데미안 (에피소드5)", values: { face: 657, name: 228, job: 1987, voice: 14, body: 256, weaponAttackType: 1, weaponType: 14, weaponPicType: 56 } },
  { id: "디에네 (에피소드4)", code: 238, name: "디에네 (에피소드4)", values: { face: 656, name: 229, job: 1747, voice: 15, body: 567, weaponAttackType: 1, weaponType: 0, weaponPicType: 47 } },
  { id: "디에네 (에피소드5)", code: 242, name: "디에네 (에피소드5)", values: { face: 656, name: 229, job: 1679, voice: 15, body: 1205, weaponAttackType: 1, weaponType: 0, weaponPicType: 47 } },
  { id: "란", code: 222, name: "란", values: { face: 658, name: 437, job: 1399, voice: 30, body: 570, weaponAttackType: 1, weaponType: 14, weaponPicType: 56 } },
  { id: "레드헤드", code: 38, name: "레드헤드", values: { face: 659, name: 443, job: 1681, voice: 16, body: 1096, weaponAttackType: 1, weaponType: 9, weaponPicType: 41 } },
  { id: "루시엔", code: 240, name: "루시엔", values: { face: 789, name: 451, job: 1988, voice: 17, body: 903, weaponAttackType: 6, weaponType: 10, weaponPicType: 42 } },
  { id: "루크랜서드 (에피소드4)", code: 246, name: "루크랜서드 (에피소드4)", values: { face: 751, name: 1692, job: 1679, voice: 18, body: 649, weaponAttackType: 1479, weaponType: 1, weaponPicType: 53 } },
  { id: "루크랜서드 (에피소드5)", code: 484, name: "루크랜서드 (에피소드5)", values: { face: 751, name: 1692, job: 1747, voice: 18, body: 649, weaponAttackType: 1479, weaponType: 1, weaponPicType: 53 } },
  { id: "리엔", code: 398, name: "리엔", values: { face: 668, name: 456, job: 1688, voice: 19, body: 1017, weaponAttackType: 1, weaponType: 17, weaponPicType: 55 } },
  { id: "리차드", code: 241, name: "리차드", values: { face: 669, name: 459, job: 1989, voice: 20, body: 582, weaponAttackType: 6, weaponType: 13, weaponPicType: 45 } },
  { id: "마리아", code: 243, name: "마리아", values: { face: 671, name: 458, job: 1990, voice: 21, body: 572, weaponAttackType: 1, weaponType: 11, weaponPicType: 43 } },
  { id: "베라모드", code: 223, name: "베라모드", values: { face: 673, name: 462, job: 1399, voice: 22, body: 506, weaponAttackType: 1479, weaponType: 1, weaponPicType: 53 } },
  { id: "베라모드 (마에라드)", code: 223, name: "베라모드 (마에라드)", values: { face: 673, name: 462, job: 1399, voice: 35, body: 507, weaponAttackType: 1479, weaponType: 1, weaponPicType: 53 } },
  { id: "살라딘", code: 219, name: "살라딘", values: { face: 674, name: 463, job: 951, voice: 23, body: 347, weaponAttackType: 1, weaponType: 0, weaponPicType: 49 } },
  { id: "살라딘 (크로슬리 커스텀)", code: 219, name: "살라딘 (크로슬리 커스텀)", values: { face: 674, name: 463, job: 951, voice: 23, body: 1185, weaponAttackType: 1, weaponType: 0, weaponPicType: 52 } },
  { id: "샤크바리", code: 245, name: "샤크바리", values: { face: 675, name: 1943, job: 1986, voice: 24, body: 202, weaponAttackType: 1, weaponType: 15, weaponPicType: 57 } },
  { id: "슈", code: 36, name: "슈", values: { face: 766, name: 1898, job: 2347, voice: 5, body: 1166, weaponAttackType: 6, weaponType: 1479, weaponPicType: 53 } },
  { id: "슈로 위장한 진", code: 36, name: "슈로 위장한 진", values: { face: 766, name: 2423, job: 1998, voice: 5, body: 1166, weaponAttackType: 1479, weaponType: 1479, weaponPicType: 0 } },
  { id: "아셀라스", code: 56, name: "아셀라스", values: { face: 676, name: 467, job: 1995, voice: 25, body: 55, weaponAttackType: 1, weaponType: 0, weaponPicType: 0 } },
  { id: "아슈레이", code: 57, name: "아슈레이", values: { face: 677, name: 468, job: 2001, voice: 34, body: 597, weaponAttackType: 1, weaponType: 0, weaponPicType: 48 } },
  { id: "엠블라", code: 247, name: "엠블라", values: { face: 679, name: 470, job: 2251, voice: 26, body: 392, weaponAttackType: 1479, weaponType: 1, weaponPicType: 53 } },
  { id: "유진", code: 244, name: "유진", values: { face: 756, name: 472, job: 1991, voice: 27, body: 900, weaponAttackType: 1, weaponType: 15, weaponPicType: 57 } },
  { id: "젠 (아슈레이)", code: 57, name: "젠 (아슈레이)", values: { face: 677, name: 2392, job: 1991, voice: 34, body: 597, weaponAttackType: 1, weaponType: 0, weaponPicType: 48 } },
  { id: "죠안", code: 221, name: "죠안", values: { face: 685, name: 475, job: 951, voice: 1, body: 338, weaponAttackType: 1, weaponType: 14, weaponPicType: 56 } },
  { id: "진", code: 239, name: "진", values: { face: 762, name: 1899, job: 2347, voice: 5, body: 1167, weaponAttackType: 1479, weaponType: 1, weaponPicType: 53 } },  // 외형과 데이터가 일치하지 않음. 게임 버그로 보여 외형에 맞게 수동 변경  
  { id: "카를로스", code: 64, name: "카를로스", values: { face: 686, name: 477, job: 2124, voice: 28, body: 641, weaponAttackType: 1, weaponType: 14, weaponPicType: 56 } },
  { id: "크리스티앙", code: 220, name: "크리스티앙", values: { face: 688, name: 479, job: 1296, voice: 32, body: 323, weaponAttackType: 6, weaponType: 12, weaponPicType: 44 } },
  { id: "하이델룬 (건 슬라이서)", code: 601, name: "하이델룬 (건 슬라이서)", values: { face: 1052, name: 2907, job: 2001, voice: 33, body: 1165, weaponAttackType: 1, weaponType: 0, weaponPicType: 49 } },
  { id: "하이델룬 (핸드건)", code: 601, name: "하이델룬 (핸드건)", values: { face: 1052, name: 2907, job: 2001, voice: 33, body: 1165, weaponAttackType: 6, weaponType: 12, weaponPicType: 44 } },
  { id: "흑태자", code: 598, name: "흑태자", values: { face: 229, name: 2904, job: 0, voice: 2, body: 1165, weaponAttackType: 1, weaponType: 15, weaponPicType: 57 } },
];

const emptySaveStatus = "G3P_II*.sav 파일을 열거나 여기로 드래그하세요.";

export default function App() {
  const [save, setSave] = useState<SaveInfo | null>(null);
  const [browserSaveBytes, setBrowserSaveBytes] = useState<Uint8Array | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<MainTabKey>("episode4Field");
  const [draftMoney, setDraftMoney] = useState<DraftMoney>({
    field: { episode4: "", episode5: "" },
    battle: { episode4: "", episode5: "" }
  });
  const [draftInventory, setDraftInventory] = useState<DraftInventory>({
    field: { episode4: [], episode5: [] },
    battle: { episode4: [], episode5: [] }
  });
  const [draftParties, setDraftParties] = useState<DraftParties>({ episode4: [], episode5: [] });
  const [draftEquipment, setDraftEquipment] = useState<DraftEquipment>({ field: {}, battle: {} });
  const [draftMercenaries, setDraftMercenaries] = useState<DraftMercenaries>({ field: {}, battle: {} });
  const [draftStats, setDraftStats] = useState<DraftStats>({ field: {}, battle: {} });
  const [draftAbilities, setDraftAbilities] = useState<DraftAbilities>({ field: {}, battle: {} });
  const [selectedEquipmentCode, setSelectedEquipmentCode] = useState<number | null>(null);
  const [activeCharacterTab, setActiveCharacterTab] = useState<CharacterEditorTab>("equipment");
  const [status, setStatus] = useState(emptySaveStatus);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const activeTabInfo = mainTabs.find((tab) => tab.key === activeMainTab) ?? mainTabs[0];
  const activeEpisode = activeTabInfo.episode;
  const activeDataScope = activeTabInfo.scope;
  const activeMoney = save?.money[activeDataScope][activeEpisode];
  const activeParty = save?.parties[activeEpisode];
  const activePartyCodes =
    activeDataScope === "battle"
      ? (save?.equipment.battle.filter((equipment) => equipment.supported).map((equipment) => equipment.characterCode) ?? [])
      : draftParties[activeEpisode];
  const allMoneyNumbers = useMemo(
    () =>
      dataScopes.flatMap((scope) =>
        episodeKeys.map((episode) => Number(draftMoney[scope][episode].replaceAll(",", "")))
      ),
    [draftMoney]
  );
  const allInventoryNumbers = useMemo(
    () =>
      dataScopes.flatMap((scope) =>
        episodeKeys.flatMap((episode) =>
          draftInventory[scope][episode].map((item) =>
            item.quantity === "" ? 0 : Number(item.quantity.replaceAll(",", ""))
          )
        )
      ),
    [draftInventory]
  );
  const statDraftsValid = useMemo(() => {
    return save ? areStatDraftsValid(save.stats, draftStats) : true;
  }, [save, draftStats]);
  const abilityDraftsValid = useMemo(() => {
    return save ? areAbilityDraftsValid(save.abilities, draftAbilities) : true;
  }, [save, draftAbilities]);
  const electronApi = window.g3p2SaveEditor;
  const saveActionLabel = electronApi ? "저장" : "다운로드";
  const canWrite = Boolean(
    save &&
      (electronApi || browserSaveBytes) &&
      allMoneyNumbers.every(isValidMoney) &&
      allInventoryNumbers.every(isValidCount) &&
      statDraftsValid &&
      abilityDraftsValid
  );

  async function loadSave(loader: () => Promise<LoadedSave | null>, cancelMessage: string) {
    setBusy(true);
    setStatus("세이브 파일을 읽는 중입니다.");
    try {
      const loadedSave = await loader();
      if (loadedSave) {
        adoptSave(loadedSave.save, loadedSave.browserBytes ?? null);
        setStatus(`${loadedSave.save.fileName} 파일을 열었습니다.`);
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

  function adoptSave(nextSave: SaveInfo, nextBrowserBytes: Uint8Array | null = null, options: AdoptSaveOptions = {}) {
    const nextMainTab = options.preserveUi && isMainTabAvailable(nextSave, activeMainTab) ? activeMainTab : getInitialMainTab(nextSave);
    const nextTabInfo = mainTabs.find((tab) => tab.key === nextMainTab) ?? mainTabs[0];
    const selectableCodes = getSelectableCharacterCodes(nextSave, nextTabInfo);
    const nextSelectedCode =
      options.preserveUi && selectedEquipmentCode !== null && selectableCodes.includes(selectedEquipmentCode)
        ? selectedEquipmentCode
        : selectableCodes[0] ?? null;

    setSave(nextSave);
    setBrowserSaveBytes(nextBrowserBytes);
    document.title = nextSave.fileName;
    setActiveMainTab(nextMainTab);
    setDraftMoney({
      field: {
        episode4: String(nextSave.money.field.episode4.value),
        episode5: String(nextSave.money.field.episode5.value)
      },
      battle: {
        episode4: String(nextSave.money.battle.episode4.value),
        episode5: String(nextSave.money.battle.episode5.value)
      }
    });
    setDraftInventory({
      field: {
        episode4: buildInventoryDraft(nextSave.inventorySlots.field.episode4),
        episode5: buildInventoryDraft(nextSave.inventorySlots.field.episode5)
      },
      battle: {
        episode4: buildInventoryDraft(nextSave.inventorySlots.battle.episode4),
        episode5: buildInventoryDraft(nextSave.inventorySlots.battle.episode5)
      }
    });
    setDraftParties({
      episode4: nextSave.parties.episode4.members.map((member) => member.code),
      episode5: nextSave.parties.episode5.members.map((member) => member.code)
    });

    setDraftEquipment({
      field: buildEquipmentDrafts(nextSave.equipment.field),
      battle: buildEquipmentDrafts(nextSave.equipment.battle)
    });
    setDraftMercenaries({
      field: buildMercenaryDrafts(nextSave.mercenaries.field),
      battle: buildMercenaryDrafts(nextSave.mercenaries.battle)
    });
    setDraftStats({
      field: buildStatsDrafts(nextSave.stats.field),
      battle: buildStatsDrafts(nextSave.stats.battle)
    });
    setDraftAbilities({
      field: buildAbilityDrafts(nextSave.abilities.field),
      battle: buildAbilityDrafts(nextSave.abilities.battle)
    });
    setSelectedEquipmentCode(nextSelectedCode);
  }

  async function openSaveFromUser() {
    const api = window.g3p2SaveEditor;
    if (api) {
      await loadSave(async () => {
        const nextSave = await api.openSave();
        return nextSave ? { save: nextSave } : null;
      }, "파일 선택이 취소되었습니다.");
      return;
    }

    await loadSave(openBrowserSavePicker, "파일 선택이 취소되었습니다.");
  }

  async function openDroppedSave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files.item(0);
    if (!file) {
      setDragging(false);
      return;
    }

    const api = window.g3p2SaveEditor;
    const filePath = api?.getPathForFile(file) || file.name;
    if (!/\.sav(?:\.\d{14})?$/i.test(filePath)) {
      setStatus(".sav 또는 .sav.년월일시분초 파일만 열 수 있습니다.");
      setDragging(false);
      return;
    }

    if (api) {
      await loadSave(async () => ({ save: await api.openSavePath(filePath) }), "파일 선택이 취소되었습니다.");
      return;
    }

    await loadSave(() => readBrowserSaveFile(file), "파일 선택이 취소되었습니다.");
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

    const money = buildMoneyEdits(draftMoney);
    const inventorySlots = buildInventorySlotEdits(draftInventory);

    if (!dataScopes.every((scope) => episodeKeys.every((episode) => isValidMoney(money[scope][episode])))) {
      setStatus("돈 값은 0 이상의 정수여야 합니다.");
      return;
    }
    if (
      !dataScopes
        .flatMap((scope) => episodeKeys.flatMap((episode) => inventorySlots[scope]![episode]!.map((item) => item.quantity)))
        .every(isValidCount)
    ) {
      setStatus("소모품/장비 수량은 0~99 사이의 정수여야 합니다.");
      return;
    }
    if (!areStatDraftsValid(save.stats, draftStats)) {
      setStatus("스탯 값은 0~65535 사이의 정수여야 합니다. 현재 TP는 -32768~32767 범위를 사용할 수 있습니다.");
      return;
    }
    if (!areAbilityDraftsValid(save.abilities, draftAbilities)) {
      setStatus("어빌리티 값은 1~20 또는 255여야 합니다.");
      return;
    }

    const edits: SaveEditRequest = {
      money,
      inventorySlots,
      parties: draftParties,
      equipment: buildEquipmentEdits(save.equipment, draftEquipment),
      mercenaries: buildMercenaryEdits(save.mercenaries, draftMercenaries),
      stats: buildStatsEdits(save.stats, draftStats),
      abilities: buildAbilityEdits(save.abilities, draftAbilities)
    };
    const api = window.g3p2SaveEditor;
    if (!api && !browserSaveBytes) {
      setStatus("다운로드할 원본 세이브 데이터가 없습니다. 파일을 다시 열어주세요.");
      return;
    }

    setBusy(true);
    setStatus(api ? "기존 세이브를 백업하고 저장하는 중입니다." : "수정된 세이브를 다운로드하는 중입니다.");
    try {
      if (api) {
        const result = await api.writeEditedOriginal({
          filePath: save.filePath,
          edits
        });

        adoptSave(result.save, null, { preserveUi: true });
        setStatus(`${result.save.fileName} 파일로 저장했습니다. 백업: ${getFileName(result.backupPath)}`);
      } else if (browserSaveBytes) {
        const nextData = new Uint8Array(browserSaveBytes);
        const downloadFileName = getDownloadFileName(save.fileName);
        applySaveEdits(nextData, edits);
        downloadSaveFile(nextData, downloadFileName);
        adoptSave(parseSave(nextData, downloadFileName), nextData, { preserveUi: true });
        setStatus(`${downloadFileName} 파일을 다운로드했습니다.`);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function updateMoney(value: string) {
    setDraftMoney((current) => ({
      ...current,
      [activeDataScope]: {
        ...current[activeDataScope],
        [activeEpisode]: value
      }
    }));
  }

  function updateInventoryItem(index: number, value: string) {
    setDraftInventory((current) => ({
      ...current,
      [activeDataScope]: {
        ...current[activeDataScope],
        [activeEpisode]: current[activeDataScope][activeEpisode].map((item, itemIndex) =>
          itemIndex === index ? { ...item, quantity: value } : item
        )
      }
    }));
  }

  function deleteInventoryItem(index: number) {
    setDraftInventory((current) => ({
      ...current,
      [activeDataScope]: {
        ...current[activeDataScope],
        [activeEpisode]: current[activeDataScope][activeEpisode].filter((_, itemIndex) => itemIndex !== index)
      }
    }));
  }

  function addInventoryItem(item: InventoryCatalogItem) {
    const currentItems = draftInventory[activeDataScope][activeEpisode];
    if (currentItems.some((currentItem) => currentItem.itemCode === item.code)) {
      window.alert("이미 인벤토리에 추가된 항목입니다.");
      setStatus("이미 인벤토리에 추가된 항목입니다.");
      return false;
    }
    setDraftInventory((current) => ({
      ...current,
      [activeDataScope]: {
        ...current[activeDataScope],
        [activeEpisode]: [...current[activeDataScope][activeEpisode], { itemCode: item.code, quantity: "1" }]
      }
    }));
    return true;
  }

  function addPartyMember(code: number) {
    setDraftParties((current) => {
      const party = current[activeEpisode];
      if (party.length >= PARTY_MEMBER_LIMIT) {
        setStatus(`파티는 최대 ${PARTY_MEMBER_LIMIT}명까지 저장합니다.`);
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

  function updateCharacterEquipmentSlot(characterCode: number, slot: EquipmentSlotKey, value: number) {
    setDraftEquipment((current) => ({
      ...current,
      [activeDataScope]: {
        ...current[activeDataScope],
        [characterCode]: {
          ...(current[activeDataScope][characterCode] ?? {}),
          [slot]: value
        } as DraftEquipmentEntry
      }
    }));
  }

  function updateCharacterWeaponDetail(
    characterCode: number,
    key: CharacterDetailKey,
    value: number
  ) {
    setDraftEquipment((current) => ({
      ...current,
      [activeDataScope]: {
        ...current[activeDataScope],
        [characterCode]: {
          ...(current[activeDataScope][characterCode] ?? {}),
          [key]: value
        } as DraftEquipmentEntry
      }
    }));
  }

  function updateCharacterStat(characterCode: number, key: CharacterStatKey, value: string) {
    setDraftStats((current) => ({
      ...current,
      [activeDataScope]: {
        ...current[activeDataScope],
        [characterCode]: {
          ...(current[activeDataScope][characterCode] ?? {}),
          [key]: value
        }
      }
    }));
  }

  function updateCharacterAbility(characterCode: number, abilityCode: number, value: string) {
    setDraftAbilities((current) => ({
      ...current,
      [activeDataScope]: {
        ...current[activeDataScope],
        [characterCode]: {
          ...(current[activeDataScope][characterCode] ?? {}),
          [abilityCode]: value
        }
      }
    }));
  }

  useEffect(() => {
    if (activePartyCodes.length > 0 && (selectedEquipmentCode === null || !activePartyCodes.includes(selectedEquipmentCode))) {
      setSelectedEquipmentCode(activePartyCodes[0]);
    }
  }, [activePartyCodes, selectedEquipmentCode]);

  useEffect(() => {
    const api = window.g3p2SaveEditor;
    if (!api) {
      return;
    }

    const removeOpenListener = api.onOpenSaveRequest(() => {
      void loadSave(async () => {
        const nextSave = await api.openSave();
        return nextSave ? { save: nextSave } : null;
      }, "파일 선택이 취소되었습니다.");
    });
    const removeSaveListener = api.onSaveRequest(() => {
      void writeEditedOriginal();
    });

    return () => {
      removeOpenListener();
      removeSaveListener();
    };
  });

  return (
    <main
      className="app-shell"
      onDragEnter={(event) => {
        if (isFileDrag(event)) {
          event.preventDefault();
          setDragging(true);
        }
      }}
      onDragOver={(event) => {
        if (isFileDrag(event)) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setDragging(true);
        }
      }}
      onDragLeave={(event) => {
        if (isLeavingViewport(event)) {
          setDragging(false);
        }
      }}
      onDrop={openDroppedSave}
    >
      {dragging ? (
        <div className="save-drop-overlay" aria-hidden="true">
          <div className="save-drop-label">세이브 파일을 여기에 드래그해주세요.</div>
        </div>
      ) : null}

      <header className="topbar">
        <div className="topbar-main">
          <div className="title-stack">
            <h1>{save?.fileName ?? "G3P2 Save Editor"}</h1>
            <p>{status}</p>
          </div>
          <SaveMetaPanel save={save} />
        </div>
        <div className="topbar-actions">
          <button type="button" className="secondary-button" onClick={openSaveFromUser} disabled={busy}>
            파일 열기
          </button>
          <button type="button" className="primary-button" onClick={writeEditedOriginal} disabled={!canWrite || busy}>
            {saveActionLabel}
          </button>
        </div>
      </header>
      <div className="tabs episode-tabs" role="tablist" aria-label="에피소드 선택">
        {mainTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeMainTab === tab.key ? "active" : ""}
            disabled={Boolean(save && tab.scope === "battle" && save.type.code !== 1)}
            onClick={() => setActiveMainTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="workspace">
        <aside className="sidebar">
          <InventoryEditor
            save={save}
            episode={activeEpisode}
            money={activeMoney}
            draftMoneyValue={draftMoney[activeDataScope][activeEpisode]}
            draftInventory={draftInventory[activeDataScope][activeEpisode]}
            originalInventory={save?.inventorySlots[activeDataScope][activeEpisode] ?? []}
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
            readOnly={activeDataScope === "battle"}
            selectedCode={selectedEquipmentCode}
            onAdd={addPartyMember}
            onRemove={removePartyMember}
            onMove={movePartyMember}
            onSelect={setSelectedEquipmentCode}
          />
        </section>

        <aside className="equipment-column">
          <div className="editor-tabs" role="tablist" aria-label="편집 항목 선택">
            {(["equipment", "abilities", "stats", "appearance"] as CharacterEditorTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeCharacterTab === tab ? "active" : ""}
                onClick={() => setActiveCharacterTab(tab)}
              >
                {characterEditorTabLabels[tab]}
              </button>
            ))}
          </div>

          <div className="equipment-card">
            <div className="section-title">
              <div>
                <h2>캐릭터 정보</h2>
              </div>
            </div>

            {activeCharacterTab === "stats" ? (
              <StatsEditor
                save={save}
                scope={activeDataScope}
                selectedCode={selectedEquipmentCode}
                draftStats={draftStats[activeDataScope]}
                onChange={updateCharacterStat}
              />
            ) : activeCharacterTab === "abilities" ? (
              <AbilityEditor
                save={save}
                scope={activeDataScope}
                selectedCode={selectedEquipmentCode}
                draftAbilities={draftAbilities[activeDataScope]}
                onChange={updateCharacterAbility}
              />
            ) : activeCharacterTab === "appearance" ? (
              <EquipmentEditor
                mode="appearance"
                save={save}
                scope={activeDataScope}
                selectedCode={selectedEquipmentCode}
                draftEquipment={draftEquipment[activeDataScope]}
                onChange={updateCharacterEquipmentSlot}
                onWeaponDetailChange={updateCharacterWeaponDetail}
              />
            ) : (
              <>
                <div className="equipment-slots">
                  <div className="inventory-section-heading">
                    <span>군단</span>
                  </div>
                </div>

                <MercenaryEditor
                  save={save}
                  scope={activeDataScope}
                  selectedCode={selectedEquipmentCode}
                  draftMercenaries={draftMercenaries[activeDataScope]}
                  onChange={(characterCode, value) => {
                    setDraftMercenaries((current) => ({
                      ...current,
                      [activeDataScope]: {
                        ...current[activeDataScope],
                        [characterCode]: value
                      }
                    }));
                  }}
                />

                <div className="equipment-slots">
                  <div className="inventory-section-heading">
                    <span>장비</span>
                  </div>
                </div>

                <EquipmentEditor
                  mode="equipment"
                  save={save}
                  scope={activeDataScope}
                  selectedCode={selectedEquipmentCode}
                  draftEquipment={draftEquipment[activeDataScope]}
                  onChange={updateCharacterEquipmentSlot}
                  onWeaponDetailChange={updateCharacterWeaponDetail}
                />
              </>
            )}
          </div>
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
          <span className="eyebrow">세이브 타입</span>
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
        <span className="eyebrow">세이브 타입</span>
        <strong>{save.type.label}</strong>
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
  const supported = Boolean(save && money?.supported);

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
            <img src={getAssetSrc("item-icons/money.png")} alt="" />
          </span>
          <input
            id="money"
            aria-label="돈"
            inputMode="numeric"
            value={draftMoneyValue}
            onChange={(event) => onMoneyChange(event.target.value)}
            placeholder="99999"
            disabled={!supported}
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
          전체 아이템 정보
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
  const [activeCategory, setActiveCategory] = useState<PickerCategory>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const listCategory: PickerCategory = activeCategory;
  const filteredInventory = draftInventory
    .map((item, index) => ({ item, index, catalogItem: getCatalogItem(item.itemCode) }))
    .filter(({ item, catalogItem }) => {
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
          </aside>

          <section className="item-picker-results">
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
  const [manualCode, setManualCode] = useState("");
  const [activeCategory, setActiveCategory] = useState<EquipmentPickerCategory>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const listCategory: PickerCategory = activeCategory === "manual" ? "all" : activeCategory;
  const items = INVENTORY_CATALOG.filter((item) => {
    if (activeCategory === "manual") {
      return false;
    }
    if (activeCategory !== "all" && item.category !== activeCategory) {
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
                onAdd={(code) => onAdd({ code, name: "알 수 없음", category: "item" })}
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
                    const alreadyAdded = currentItemCodes.includes(item.code);
                    const stats = getItemStatText(item.name);
                    const groupLabel = getInventoryResultGroupLabel(item, listCategory);
                    const previousGroupLabel = index > 0 ? getInventoryResultGroupLabel(items[index - 1], listCategory) : null;
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
              </>
            )}
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
        aria-label="전체 아이템 정보"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>전체 아이템 정보</h2>
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
  readOnly = false,
  selectedCode,
  onAdd,
  onRemove,
  onMove,
  onSelect
}: {
  party?: PartyInfo;
  codes: number[];
  readOnly?: boolean;
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
          <h2>{readOnly ? "출격 유닛" : "파티"}</h2>
        </div>
        <strong>{codes.length}명</strong>
      </div>

      <div className="party-lists">
        <section className="party-list-panel current-party">
          <div className="list-heading">
            <span>{readOnly ? "전투 데이터" : "현재 파티"}</span>
            <small>{readOnly ? "실제 전투 유닛 기준" : "드래그해서 순서 변경"}</small>
          </div>

          {codes.length === 0 ? (
            <p className="empty">{readOnly ? "확인된 출격 유닛이 없습니다." : "등록된 파티원이 없습니다."}</p>
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
                  draggable={!readOnly}
                  onClick={() => onSelect(code)}
                  onDragStart={(event) => {
                    if (readOnly) {
                      return;
                    }
                    setDragIndex(index);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(index));
                  }}
                  onDragOver={(event) => {
                    if (readOnly) {
                      return;
                    }
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    if (readOnly) {
                      return;
                    }
                    event.preventDefault();
                    const sourceIndex = dragIndex ?? Number(event.dataTransfer.getData("text/plain"));
                    onMove(sourceIndex, index);
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                >
                  <span className="drag-handle">::</span>
                  <span className="member-slot">{index + 1}</span>
                  <span className="member-details">
                    <span className="member-name">{CHARACTER_NAMES.get(code) ?? `알 수 없음 (${code})`}</span>
                    <small className="member-code">code {code}</small>
                  </span>
                  {readOnly ? null : (
                    <button type="button" className="danger-button" onClick={() => onRemove(index)}>
                      삭제
                    </button>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>

        {readOnly ? null : (
          <button type="button" className="inventory-add-button" onClick={() => setPickerOpen(true)} disabled={codes.length >= PARTY_MEMBER_LIMIT}>
            파티원 추가
          </button>
        )}
      </div>

      {pickerOpen && !readOnly ? (
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
  const [manualCode, setManualCode] = useState("");
  const [activeGroup, setActiveGroup] = useState<CharacterGroup | "all" | "manual">("all");
  const normalizedQuery = query.trim().toLowerCase();
  const characters = CHARACTER_OPTIONS.filter((character) => {
    if (activeGroup === "manual") {
      return false;
    }
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
  const addPartyCode = (code: number) => {
    if (currentCodes.includes(code)) {
      window.alert("이미 파티에 추가된 캐릭터입니다.");
      return;
    }
    if (currentCodes.length >= PARTY_MEMBER_LIMIT) {
      window.alert(`파티는 최대 ${PARTY_MEMBER_LIMIT}명까지 저장합니다.`);
      return;
    }
    onAdd(code);
  };

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
            <div className="picker-sidebar-divider" />
            <button
              type="button"
              className={activeGroup === "manual" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveGroup("manual")}
            >
              수동 코드 입력
            </button>
          </aside>

          <section className="item-picker-results">
            {activeGroup === "manual" ? (
              <ManualCodeInput
                value={manualCode}
                ariaLabel="수동 캐릭터 코드"
                helpText="목록에 없는 캐릭터 코드를 직접 입력합니다. 확인된 25개 필드 캐릭터 외에는 용병단과 챕터 장비를 편집할 수 없습니다."
                confirmMessage="255를 넘는 캐릭터 코드입니다. 그래도 추가할까요?"
                onChange={setManualCode}
                onAdd={addPartyCode}
              />
            ) : (
              <>
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
                              <small>아레나 캐릭터의 데이터는 기록되지 않습니다.</small>
                            ) : null}
                          </div>
                        ) : null}

                        <button
                          type="button"
                          className={alreadyAdded ? `item-picker-row disabled ${group}-character` : `item-picker-row ${group}-character`}
                          onClick={() => addPartyCode(character.code)}
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
              </>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function EquipmentEditor({
  mode,
  save,
  scope,
  selectedCode,
  draftEquipment,
  onChange,
  onWeaponDetailChange
}: {
  mode: CharacterEditorTab;
  save: SaveInfo | null;
  scope: EquipmentScope;
  selectedCode: number | null;
  draftEquipment: Record<number, DraftEquipmentEntry>;
  onChange: (characterCode: number, slot: EquipmentSlotKey, value: number) => void;
  onWeaponDetailChange: (
    characterCode: number,
    key: CharacterDetailKey,
    value: number
  ) => void;
  }) {
  const [pickerSlot, setPickerSlot] = useState<EquipmentSlotKey | null>(null);
  const [presetPickerOpen, setPresetPickerOpen] = useState(false);
  const [characterDetailPickerField, setCharacterDetailPickerField] = useState<CharacterDetailField | null>(null);
  const equipmentByCode = useMemo(() => {
    return new Map(save?.equipment[scope].map((equipment) => [equipment.characterCode, equipment]) ?? []);
  }, [save, scope]);
  const currentEquipment = selectedCode === null ? null : equipmentByCode.get(selectedCode) ?? buildUnsupportedEquipment(selectedCode, scope);
  const selectedDraft =
    selectedCode === null
      ? null
      : draftEquipment[selectedCode] ?? buildEquipmentDraft(equipmentByCode.get(selectedCode));

  return (
    <article className="">
      {!currentEquipment ? (
        <p className="empty">왼쪽 파티 목록에서 캐릭터를 선택하세요.</p>
      ) : currentEquipment.supported && selectedDraft ? (
        <div className="equipment-slots">
          {mode === "equipment"
            ? EQUIPMENT_SLOT_DEFINITIONS.map((slot) => {
                const slotInfo = currentEquipment.slots.find((item) => item.key === slot.key);
                const value = selectedDraft[slot.key] ?? slotInfo?.value ?? 0;
                const options = getEquipmentSelectOptions(slot.key, value);
                const selectedOption = options.find((option) => option.code === value);
                const isUnknownEquipment = !selectedOption || selectedOption.name === "현재 저장값";
                const selectedName = value === 0 ? "장비 해제" : selectedOption?.name ?? "현재 저장값";
                const selectedStats = value === 0 ? undefined : isUnknownEquipment ? `code ${value}` : getItemStatText(selectedName);
                return (
                  <div key={slot.key} className="equipment-entry">
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
              })
            : null}
          {mode === "appearance" ? (
            <div className="equipment-detail-selects">
              <div className="inventory-section-heading">
                <span>캐릭터 외형</span>
              </div>
              {getCharacterDetailFields("character").map((field) => (
                <CharacterDetailPickerButton
                  key={field.key}
                  field={field}
                  value={selectedDraft[field.key] ?? currentEquipment[field.key]?.value ?? 0}
                  onOpen={() => setCharacterDetailPickerField(field)}
                />
              ))}

              <div className="inventory-section-heading">
                <span>무기 외형</span>
              </div>
              {getCharacterDetailFields("weapon").map((field) => (
                <CharacterDetailSelect
                  key={field.key}
                  field={field}
                  value={selectedDraft[field.key] ?? currentEquipment[field.key]?.value ?? 0}
                  characterCode={currentEquipment.characterCode}
                  onChange={onWeaponDetailChange}
                />
              ))}

              <div className="inventory-section-heading">
                <span>프리셋</span>
              </div>
              <button type="button" className="inventory-review-button" onClick={() => setPresetPickerOpen(true)}>
                프리셋 선택
              </button>
            </div>
          ) : null}
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
      {characterDetailPickerField && currentEquipment?.supported && selectedDraft ? (
        <CharacterDetailPicker
          field={characterDetailPickerField}
          currentValue={selectedDraft[characterDetailPickerField.key] ?? currentEquipment[characterDetailPickerField.key]?.value ?? 0}
          onClose={() => setCharacterDetailPickerField(null)}
          onSelect={(value) => {
            onWeaponDetailChange(currentEquipment.characterCode, characterDetailPickerField.key, value);
            setCharacterDetailPickerField(null);
          }}
        />
      ) : null}
      {presetPickerOpen && currentEquipment?.supported ? (
        <AppearancePresetPicker
          onClose={() => setPresetPickerOpen(false)}
          onSelect={(preset) => {
            for (const [key, value] of Object.entries(preset.values) as Array<[CharacterDetailKey, number]>) {
              onWeaponDetailChange(currentEquipment.characterCode, key, value);
            }
            setPresetPickerOpen(false);
          }}
        />
      ) : null}
    </article>
  );
}

function AbilityEditor({
  save,
  scope,
  selectedCode,
  draftAbilities,
  onChange
}: {
  save: SaveInfo | null;
  scope: EquipmentScope;
  selectedCode: number | null;
  draftAbilities: Record<number, DraftAbilitiesEntry>;
  onChange: (characterCode: number, abilityCode: number, value: string) => void;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const abilitiesByCode = useMemo(() => {
    return new Map(save?.abilities[scope].map((abilities) => [abilities.characterCode, abilities]) ?? []);
  }, [save, scope]);
  const currentAbilities =
    selectedCode === null ? null : abilitiesByCode.get(selectedCode) ?? buildUnsupportedAbilities(selectedCode, scope);
  const selectedDraft =
    selectedCode === null ? null : draftAbilities[selectedCode] ?? buildAbilityDraft(abilitiesByCode.get(selectedCode));

  return (
    <div className="equipment-slots ability-editor">
      <div className="inventory-section-heading">
        <span>어빌리티</span>
      </div>
      {!currentAbilities ? (
        <p className="empty compact">왼쪽 파티 목록에서 캐릭터를 선택하세요.</p>
      ) : !currentAbilities.supported || !selectedDraft ? (
        <div className="equipment-note unsupported">
          <small>{currentAbilities.note ?? "이 캐릭터의 어빌리티 위치는 아직 확인되지 않았습니다."}</small>
        </div>
      ) : (
        <>
          <button type="button" className="inventory-review-button" onClick={() => setReviewOpen(true)}>
            어빌리티 확인
          </button>
          <button type="button" className="inventory-add-button" onClick={() => setPickerOpen(true)}>
            어빌리티 추가
          </button>
        </>
      )}

      <div className="inventory-section-heading">
        <span>정보</span>
      </div>
      <button type="button" className="inventory-review-button" onClick={() => setInfoOpen(true)}>
        전체 어빌리티 정보
      </button>

      {reviewOpen && currentAbilities?.supported && selectedDraft ? (
        <AbilityReviewModal
          abilities={currentAbilities}
          draftAbilities={selectedDraft}
          onClose={() => setReviewOpen(false)}
          onChange={onChange}
          onDelete={(abilityCode) => onChange(currentAbilities.characterCode, abilityCode, "255")}
        />
      ) : null}
      {pickerOpen && currentAbilities?.supported && selectedDraft ? (
        <AbilityPicker
          currentAbilityCodes={Object.entries(selectedDraft)
            .filter(([, value]) => isActiveAbilityLevel(parseAbilityDraftValue(value)))
            .map(([code]) => Number(code))}
          onClose={() => setPickerOpen(false)}
          onAdd={(ability) => {
            onChange(currentAbilities.characterCode, ability.code, "1");
            setPickerOpen(false);
          }}
        />
      ) : null}
      {infoOpen ? <AbilityInfoModal onClose={() => setInfoOpen(false)} /> : null}
    </div>
  );
}

function AbilityReviewModal({
  abilities,
  draftAbilities,
  onClose,
  onChange,
  onDelete
}: {
  abilities: CharacterAbilitiesInfo;
  draftAbilities: DraftAbilitiesEntry;
  onClose: () => void;
  onChange: (characterCode: number, abilityCode: number, value: string) => void;
  onDelete: (abilityCode: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AbilityFilterCategory>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const knownAbilityCodes = new Set(abilities.abilities.map((ability) => ability.code));
  const draftOnlyAbilities: CharacterAbilityValueInfo[] = Object.entries(draftAbilities)
    .filter(([codeText, valueText]) => {
      const code = Number(codeText);
      return Number.isInteger(code) && code >= 0 && code <= 0xff && !knownAbilityCodes.has(code) && isActiveAbilityLevel(parseAbilityDraftValue(valueText));
    })
    .map(([codeText, valueText]) => {
      const code = Number(codeText);
      return {
        code,
        name: `알 수 없음 (${code})`,
        category: "normal",
        offset: -1,
        value: parseAbilityDraftValue(valueText),
        raw: ""
      };
    });
  const items = [...abilities.abilities, ...draftOnlyAbilities]
    .filter((ability) => {
      const value = parseAbilityDraftValue(draftAbilities[ability.code] ?? String(ability.value));
      if (!isActiveAbilityLevel(value)) {
        return false;
      }
      return matchesAbilityFilter(ability, activeCategory, normalizedQuery);
    })
    .sort(compareAbilityOptions);

  return (
    <AbilityModalShell
      title="어빌리티 확인"
      onClose={onClose}
      activeCategory={activeCategory}
      onCategoryChange={(category) => setActiveCategory(category as AbilityFilterCategory)}
    >
      <input className="item-picker-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름 또는 코드 검색" />
      {items.length === 0 ? (
        <p className="empty compact">표시할 어빌리티가 없습니다.</p>
      ) : (
        <div className="inventory-review-list ability-review-list">
          {items.map((ability, index) => {
            const groupLabel = getAbilityCategoryLabel(getAbilityCategory(ability));
            const previousGroupLabel = index > 0 ? getAbilityCategoryLabel(getAbilityCategory(items[index - 1])) : null;
            const showGroupDivider = groupLabel !== previousGroupLabel;
            return (
              <React.Fragment key={ability.code}>
                {showGroupDivider ? <div className="item-group-divider inventory-group-divider">{groupLabel}</div> : null}
                <div className="inventory-entry">
                  <div className="inventory-row ability-review-row">
                    <div className="inventory-row-main">
                      <strong>{getAbilityDisplayParts(ability).name}</strong>
                      <small className="item-stat-text">{getAbilityDisplayParts(ability).detail ?? `code ${ability.code}`}</small>
                    </div>
                    <div className="stat-pair-inputs ability-level-inputs">
                      <input
                        aria-label={`${formatAbilityName(ability.name)} 현재 레벨`}
                        inputMode="numeric"
                        min={1}
                        max={255}
                        value={draftAbilities[ability.code] ?? String(ability.value)}
                        onChange={(event) => onChange(abilities.characterCode, ability.code, event.target.value)}
                      />
                      <span className="stat-pair-separator">/</span>
                      <input
                        aria-label={`${formatAbilityName(ability.name)} 최대 레벨`}
                        inputMode="numeric"
                        value={ability.maxLevel ?? ""}
                        disabled
                      />
                    </div>
                    <button type="button" className="danger-button" onClick={() => onDelete(ability.code)}>
                      삭제
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </AbilityModalShell>
  );
}

function AbilityPicker({
  currentAbilityCodes,
  onClose,
  onAdd
}: {
  currentAbilityCodes: number[];
  onClose: () => void;
  onAdd: (ability: AbilityOption) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AbilityPickerCategory>("all");
  const [manualCode, setManualCode] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const listCategory = activeCategory === "manual" ? "all" : activeCategory;
  const items = ABILITY_OPTIONS.filter((ability) => {
    if (activeCategory === "manual") {
      return false;
    }
    return matchesAbilityFilter(ability, listCategory, normalizedQuery);
  }).sort(compareAbilityOptions);
  const manualCodeNumber = Number(manualCode.replaceAll(",", ""));
  const manualCodeValid = manualCode.trim() !== "" && Number.isInteger(manualCodeNumber) && manualCodeNumber >= 0 && manualCodeNumber <= 0xff;
  const manualAlreadyAdded = manualCodeValid && currentAbilityCodes.includes(manualCodeNumber);

  return (
    <AbilityModalShell
      title="어빌리티 추가"
      onClose={onClose}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      includeManual
    >
      {activeCategory === "manual" ? (
        <div className="manual-code-panel">
          <div className="manual-code-editor ability-manual-code-editor">
            <span>코드</span>
            <input inputMode="numeric" value={manualCode} onChange={(event) => setManualCode(event.target.value)} />
          </div>
          <button
            type="button"
            className="inventory-add-button"
            disabled={!manualCodeValid || manualAlreadyAdded}
            onClick={() =>
              onAdd(
                ABILITY_OPTIONS.find((ability) => ability.code === manualCodeNumber) ?? {
                  code: manualCodeNumber,
                  name: `알 수 없음 (${manualCodeNumber})`,
                  category: "normal"
                }
              )
            }
          >
            추가
          </button>
          <small className="manual-code-help">
            {manualAlreadyAdded ? "이미 추가된 어빌리티 코드입니다." : "코드표에 없는 어빌리티도 직접 추가할 수 있습니다."}
          </small>
        </div>
      ) : (
        <>
          <input className="item-picker-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름 또는 코드 검색" />
          <div className="item-picker-list inventory-picker-list ability-picker-list">
            {items.map((ability, index) => {
              const alreadyAdded = currentAbilityCodes.includes(ability.code);
              const groupLabel = getAbilityCategoryLabel(getAbilityCategory(ability));
              const previousGroupLabel = index > 0 ? getAbilityCategoryLabel(getAbilityCategory(items[index - 1])) : null;
              const showGroupDivider = groupLabel !== previousGroupLabel;
              return (
                <React.Fragment key={ability.code}>
                  {showGroupDivider ? <div className="item-group-divider picker-group-divider">{groupLabel}</div> : null}
                  <button
                    type="button"
                    className={alreadyAdded ? "item-picker-row ability-picker-row disabled" : "item-picker-row ability-picker-row"}
                    onClick={() => {
                      if (!alreadyAdded) {
                        onAdd(ability);
                      }
                    }}
                  >
                    <span className="item-picker-main">
                      <AbilityPickerText ability={ability} />
                    </span>
                    <small className="item-picker-code">{ability.code}</small>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}
    </AbilityModalShell>
  );
}

function AbilityInfoModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AbilityFilterCategory>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const items = ABILITY_OPTIONS.filter((ability) => matchesAbilityFilter(ability, activeCategory, normalizedQuery)).sort(compareAbilityOptions);

  return (
    <AbilityModalShell
      title="전체 어빌리티 정보"
      onClose={onClose}
      activeCategory={activeCategory}
      onCategoryChange={(category) => setActiveCategory(category as AbilityFilterCategory)}
    >
      <input className="item-picker-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름 또는 코드 검색" />
      <div className="item-picker-list inventory-picker-list ability-picker-list">
        {items.map((ability, index) => {
          const groupLabel = getAbilityCategoryLabel(getAbilityCategory(ability));
          const previousGroupLabel = index > 0 ? getAbilityCategoryLabel(getAbilityCategory(items[index - 1])) : null;
          const showGroupDivider = groupLabel !== previousGroupLabel;
          return (
            <React.Fragment key={ability.code}>
              {showGroupDivider ? <div className="item-group-divider picker-group-divider">{groupLabel}</div> : null}
              <div className="item-picker-row ability-picker-row">
                <span className="item-picker-main">
                  <AbilityPickerText ability={ability} />
                </span>
                <small className="item-picker-code">{ability.code}</small>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbilityModalShell>
  );
}

function AbilityModalShell({
  title,
  activeCategory,
  onCategoryChange,
  onClose,
  includeManual = false,
  children
}: {
  title: string;
  activeCategory: AbilityPickerCategory;
  onCategoryChange: (category: AbilityPickerCategory) => void;
  onClose: () => void;
  includeManual?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="item-picker ability-picker-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="item-picker-header">
          <div>
            <h2>{title}</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="item-picker-body">
          <aside className="item-picker-sidebar">
            {(["all", "normal", "equipped", "special", "legionSpecial", "specialUnlock", "dummy"] as AbilityFilterCategory[]).map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? "picker-tab active" : "picker-tab"}
                onClick={() => onCategoryChange(category)}
              >
                {getAbilityCategoryLabel(category)}
              </button>
            ))}
            {includeManual ? (
              <>
                <div className="picker-sidebar-divider" />
                <button
                  type="button"
                  className={activeCategory === "manual" ? "picker-tab active" : "picker-tab"}
                  onClick={() => onCategoryChange("manual")}
                >
                  수동 코드 입력
                </button>
              </>
            ) : null}
          </aside>
          <section className="item-picker-results">{children}</section>
        </div>
      </section>
    </div>
  );
}

function StatsEditor({
  save,
  scope,
  selectedCode,
  draftStats,
  onChange
}: {
  save: SaveInfo | null;
  scope: EquipmentScope;
  selectedCode: number | null;
  draftStats: Record<number, DraftStatsEntry>;
  onChange: (characterCode: number, key: CharacterStatKey, value: string) => void;
}) {
  const statsByCode = useMemo(() => {
    return new Map(save?.stats[scope].map((stats) => [stats.characterCode, stats]) ?? []);
  }, [save, scope]);
  const currentStats = selectedCode === null ? null : statsByCode.get(selectedCode) ?? buildUnsupportedStats(selectedCode, scope);
  const selectedDraft = selectedCode === null ? null : draftStats[selectedCode] ?? buildStatsDraft(statsByCode.get(selectedCode));

  if (!currentStats) {
    return <p className="empty">왼쪽 파티 목록에서 캐릭터를 선택하세요.</p>;
  }

  if (!currentStats.supported || !selectedDraft) {
    return (
      <div className="equipment-note unsupported">
        <small>{currentStats.note ?? "이 캐릭터의 스탯 위치는 아직 확인되지 않았습니다."}</small>
      </div>
    );
  }

  const fieldsByKey = new Map(currentStats.fields.map((field) => [field.key, field]));
  const getValue = (key: CharacterStatKey) => {
    const field = fieldsByKey.get(key);
    return selectedDraft[key] ?? (typeof field?.value === "number" ? String(field.value) : "");
  };
  const topFields: CharacterStatKey[] = ["level", "levelExp", "exp"];
  const bottomFields: CharacterStatKey[] = ["psy", "stp", "ctp", "dep", "dex"];

  return (
    <div className="equipment-slots stat-editor">
      <div className="inventory-section-heading">
        <span>기본 스탯</span>
      </div>
      {topFields.map((key) => {
        const field = fieldsByKey.get(key);
        return field ? (
          <CharacterStatInput
            key={field.key}
            characterCode={currentStats.characterCode}
            field={field}
            value={getValue(field.key)}
            onChange={onChange}
          />
        ) : null;
      })}
      <div className="stat-divider" aria-hidden="true" />
      <CharacterStatPairInput
        label="HP"
        characterCode={currentStats.characterCode}
        left={fieldsByKey.get("hp")}
        leftValue={getValue("hp")}
        right={fieldsByKey.get("lp")}
        rightValue={getValue("lp")}
        onChange={onChange}
      />
      <CharacterStatPairInput
        label="SOUL"
        characterCode={currentStats.characterCode}
        left={fieldsByKey.get("soulCurrent")}
        leftValue={getValue("soulCurrent")}
        rightValue="150"
        onChange={onChange}
      />
      <CharacterStatPairInput
        label="TP"
        characterCode={currentStats.characterCode}
        left={fieldsByKey.get("tpCurrent")}
        leftValue={getValue("tpCurrent")}
        right={fieldsByKey.get("tpMax")}
        rightValue={getValue("tpMax")}
        onChange={onChange}
      />
      <div className="stat-divider" aria-hidden="true" />
      {bottomFields.map((key) => {
        const field = fieldsByKey.get(key);
        return field ? (
          <CharacterStatInput
            key={field.key}
            characterCode={currentStats.characterCode}
            field={field}
            value={getValue(field.key)}
            onChange={onChange}
          />
        ) : null;
      })}
    </div>
  );
}

function CharacterStatPairInput({
  label,
  characterCode,
  left,
  leftValue,
  right,
  rightValue,
  onChange
}: {
  label: string;
  characterCode: number;
  left?: CharacterStatFieldInfo;
  leftValue: string;
  right?: CharacterStatFieldInfo;
  rightValue: string;
  onChange: (characterCode: number, key: CharacterStatKey, value: string) => void;
}) {
  return (
    <div className="equipment-field stat-field stat-pair-field">
      <span>{label}</span>
      <div className="stat-pair-inputs">
        <input
          aria-label={`${label} 현재`}
          inputMode="numeric"
          value={leftValue}
          onChange={(event) => {
            if (left) {
              onChange(characterCode, left.key, event.target.value);
            }
          }}
          placeholder=""
          disabled={!left?.editable}
          title={left?.note}
        />
        <span className="stat-pair-separator">/</span>
        <input
          aria-label={`${label} 최대`}
          inputMode="numeric"
          value={rightValue}
          onChange={(event) => {
            if (right) {
              onChange(characterCode, right.key, event.target.value);
            }
          }}
          placeholder=""
          disabled={!right?.editable}
          title={right?.note}
        />
      </div>
    </div>
  );
}

function CharacterStatInput({
  characterCode,
  field,
  value,
  onChange
}: {
  characterCode: number;
  field: CharacterStatFieldInfo;
  value: string;
  onChange: (characterCode: number, key: CharacterStatKey, value: string) => void;
}) {
  return (
    <label className="equipment-field stat-field">
      <span>{field.label}</span>
      <input
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(characterCode, field.key, event.target.value)}
        placeholder="-"
        disabled={!field.editable}
        title={field.note}
      />
    </label>
  );
}

function CharacterDetailPickerButton({
  field,
  value,
  onOpen
}: {
  field: CharacterDetailField;
  value: number;
  onOpen: () => void;
}) {
  const selectedOption = getWeaponDetailOptions(field.options, value).find((option) => option.code === value);
  return (
    <div className="equipment-field">
      <span>{field.label}</span>
      <button type="button" className="appearance-picker-button" onClick={onOpen}>
        <span className="appearance-picker-main">
          <strong>{selectedOption?.name ?? "현재 저장값"}</strong>
          <small>{value}</small>
        </span>
        <span className="appearance-picker-action">변경</span>
      </button>
    </div>
  );
}

function CharacterDetailSelect({
  field,
  value,
  characterCode,
  onChange
}: {
  field: CharacterDetailField;
  value: number;
  characterCode: number;
  onChange: (characterCode: number, key: CharacterDetailKey, value: number) => void;
}) {
  return (
    <label className="equipment-field">
      <span>{field.label}</span>
      <select value={value} onChange={(event) => onChange(characterCode, field.key, Number(event.target.value))}>
        {getWeaponDetailOptions(field.options, value).map((option) => (
          <option key={option.code} value={option.code}>
            {option.code} - {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function CharacterDetailPicker({
  field,
  currentValue,
  onClose,
  onSelect
}: {
  field: CharacterDetailField;
  currentValue: number;
  onClose: () => void;
  onSelect: (value: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "manual">("all");
  const [manualCode, setManualCode] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const options = getWeaponDetailOptions(field.options, currentValue).filter((option) => {
    if (activeTab === "manual") {
      return false;
    }
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
        aria-label={`${field.label} 선택`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>{field.label} 선택</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="item-picker-body">
          <aside className="item-picker-sidebar">
            <button
              type="button"
              className={activeTab === "all" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveTab("all")}
            >
              전체
            </button>
            <div className="picker-sidebar-divider" />
            <button
              type="button"
              className={activeTab === "manual" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveTab("manual")}
            >
              수동 코드 입력
            </button>
          </aside>

          <section className="item-picker-results">
            {activeTab === "manual" ? (
              <ManualCodeInput
                value={manualCode}
                ariaLabel={`수동 ${field.label} 코드`}
                helpText={`목록에 없는 ${field.label} 코드를 직접 입력합니다.`}
                confirmMessage="65535를 넘는 코드입니다. 그래도 추가할까요?"
                onChange={setManualCode}
                onAdd={onSelect}
              />
            ) : (
              <>
                <input
                  className="item-picker-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="이름 또는 코드 검색"
                />
                <div className="item-picker-list">
                  {options.map((option) => {
                    const selected = option.code === currentValue;
                    return (
                      <button
                        key={option.code}
                        type="button"
                        className={selected ? "item-picker-row disabled" : "item-picker-row"}
                        onClick={() => {
                          if (!selected) {
                            onSelect(option.code);
                          }
                        }}
                      >
                        <span>{option.name}</span>
                        <small>{option.code}</small>
                      </button>
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

function AppearancePresetPicker({
  onClose,
  onSelect
}: {
  onClose: () => void;
  onSelect: (preset: CharacterAppearancePreset) => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const presets = characterAppearancePresets.filter((preset) => {
    if (!normalizedQuery) {
      return true;
    }
    return (
      preset.name.toLowerCase().includes(normalizedQuery) ||
      preset.id.toLowerCase().includes(normalizedQuery) ||
      String(preset.code).includes(normalizedQuery)
    );
  });

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="item-picker appearance-preset-picker"
        role="dialog"
        aria-modal="true"
        aria-label="외형 프리셋 선택"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>외형 프리셋 선택</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="item-picker-body single-pane-picker">
          <section className="item-picker-results">
            <input
              className="item-picker-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름 또는 코드 검색"
            />
            <div className="item-picker-list">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="item-picker-row appearance-preset-row"
                  onClick={() => onSelect(preset)}
                >
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
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
type AbilityFilterCategory = AbilityCategory | "all";
type AbilityPickerCategory = AbilityFilterCategory | "manual";

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
  scope,
  selectedCode,
  draftMercenaries,
  onChange
}: {
  save: SaveInfo | null;
  scope: EquipmentScope;
  selectedCode: number | null;
  draftMercenaries: Record<number, number>;
  onChange: (characterCode: number, value: number) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const mercenaryByCode = useMemo(() => {
    return new Map(save?.mercenaries[scope].map((mercenary) => [mercenary.characterCode, mercenary]) ?? []);
  }, [save, scope]);
  const currentMercenary =
    selectedCode === null ? null : mercenaryByCode.get(selectedCode) ?? buildUnsupportedMercenary(selectedCode, scope);
  const value =
    selectedCode === null
      ? 0
      : draftMercenaries[selectedCode] ?? currentMercenary?.value ?? 0;

  return (
    <article className="">

      {!currentMercenary ? (
        <p className="empty">왼쪽 파티 목록에서 캐릭터를 선택하세요.</p>
      ) : currentMercenary.supported ? (
        <div className="equipment-slots">
          <div className="equipment-field">
            <button type="button" className="mercenary-option active" onClick={() => setPickerOpen(true)}>
              <span>{getMercenaryName(value)}</span>
              <small>{value}</small>
            </button>
          </div>
        </div>
      ) : (
        <div className="equipment-note unsupported">
          <small>{currentMercenary.note ?? "이 캐릭터의 군단 위치는 아직 확인되지 않았습니다."}</small>
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
  const [manualCode, setManualCode] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "manual">("all");
  const normalizedQuery = query.trim().toLowerCase();
  const options = getMercenaryOptions(currentValue).filter((option) => {
    if (activeTab === "manual") {
      return false;
    }
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
        aria-label="군단 선택"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="item-picker-header">
          <div>
            <h2>군단 선택</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="item-picker-body">
          <aside className="item-picker-sidebar">
            <button
              type="button"
              className={activeTab === "all" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveTab("all")}
            >
              전체
            </button>
            <div className="picker-sidebar-divider" />
            <button
              type="button"
              className={activeTab === "manual" ? "picker-tab active" : "picker-tab"}
              onClick={() => setActiveTab("manual")}
            >
              수동 코드 입력
            </button>
          </aside>

          <section className="item-picker-results">
            {activeTab === "manual" ? (
              <ManualCodeInput
                value={manualCode}
                ariaLabel="수동 군단 코드"
                helpText="목록에 없는 군단 코드를 직접 입력합니다."
                confirmMessage="255를 넘는 군단 코드입니다. 그래도 추가할까요?"
                onChange={setManualCode}
                onAdd={onSelect}
              />
            ) : (
              <>
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
              </>
            )}
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
    return getAssetSrc("item-icons/unknown.png");
  }
  if (item?.weaponKind === "sword") {
    return getAssetSrc("item-icons/sword.png");
  }
  if (item?.weaponKind === "booster") {
    return getAssetSrc("item-icons/booster.png");
  }
  if (item?.weaponKind === "gun-slicer") {
    return getAssetSrc("item-icons/gun-slicer.png");
  }
  if (item?.weaponKind === "handgun") {
    return getAssetSrc("item-icons/handgun.png");
  }
  if (item?.weaponKind === "cigar") {
    return getAssetSrc("item-icons/cigar.png");
  }
  if (item?.weaponKind === "greatsword") {
    return getAssetSrc("item-icons/greatsword.png");
  }
  if (item?.weaponKind === "ribbon") {
    return getAssetSrc("item-icons/ribbon.png");
  }
  if (item?.weaponKind === "camera-lens") {
    return getAssetSrc("item-icons/camera-lens.png");
  }
  if (item?.weaponKind === "claw") {
    return getAssetSrc("item-icons/claw.png");
  }
  if (item?.weaponKind === "yoyo") {
    return getAssetSrc("item-icons/yoyo.png");
  }
  if (item?.weaponKind === "bottle") {
    return getAssetSrc("item-icons/bottle.png");
  }
  if (item?.consumableKind === "potion") {
    return getAssetSrc("item-icons/potion.png");
  }
  if (item?.consumableKind === "first-aid") {
    return getAssetSrc("item-icons/first-aid.png");
  }
  if (item?.consumableKind === "poison") {
    return getAssetSrc("item-icons/poison.png");
  }
  if (item?.consumableKind === "bomb") {
    return getAssetSrc("item-icons/bomb.png");
  }
  if (item?.consumableKind === "green-liquid") {
    return getAssetSrc("item-icons/green-liquid.png");
  }
  if (item?.category === "armor") {
    return getAssetSrc("item-icons/armor.png");
  }
  if (item?.category === "necklace") {
    return getAssetSrc("item-icons/necklace.png");
  }
  if (item?.category === "ring") {
    return getAssetSrc("item-icons/ring.png");
  }
  if (item?.category === "belt") {
    return getAssetSrc("item-icons/belt.png");
  }
  if (item?.category === "shoes") {
    return getAssetSrc("item-icons/shoes.png");
  }
  return item ? getAssetSrc("item-icons/unknown.png") : undefined;
}

function getEquipmentSelectOptions(slot: EquipmentSlotKey, currentValue: number): EquipmentOption[] {
  const options = EQUIPMENT_OPTIONS[slot];
  if (options.some((option) => option.code === currentValue)) {
    return options;
  }
  return [{ code: currentValue, name: "현재 저장값" }, ...options];
}

function AbilityPickerText({ ability }: { ability: AbilityOption }) {
  const display = getAbilityDisplayParts(ability);
  return (
    <>
      <span className="item-picker-name">{display.name}</span>
      {display.detail ? <small className="item-stat-text">{display.detail}</small> : null}
    </>
  );
}

function formatAbilityName(name: string): string {
  return name.replace(/\s*\(/g, " (");
}

function getAbilityDisplayParts(ability: AbilityOption): { name: string; detail?: string } {
  if (ability.category === "dummy") {
    return { name: ability.name, detail: "더미" };
  }
  if (ability.category === "legionSpecial" && ability.legion) {
    return {
      name: ability.name,
      detail: ability.character ? `${ability.legion} / ${ability.character}` : ability.legion
    };
  }
  if (ability.character) {
    return { name: ability.name, detail: ability.character };
  }
  return { name: ability.name };
}

function getAbilityCategory(ability: AbilityOption): AbilityCategory {
  return ability.category;
}

function getAbilityCategoryLabel(category: AbilityFilterCategory): string {
  if (category === "normal") {
    return "일반 어빌리티";
  }
  if (category === "equipped") {
    return "장착 어빌리티";
  }
  if (category === "special") {
    return "필살기";
  }
  if (category === "legionSpecial") {
    return "군단 필살기";
  }
  if (category === "specialUnlock") {
    return "필살기 획득용";
  }
  if (category === "dummy") {
    return "더미";
  }
  return "전체";
}

function getAbilityCategoryRank(ability: AbilityOption): number {
  const category = getAbilityCategory(ability);
  if (category === "normal") {
    return 0;
  }
  if (category === "equipped") {
    return 1;
  }
  if (category === "special") {
    return 2;
  }
  if (category === "legionSpecial") {
    return 3;
  }
  if (category === "specialUnlock") {
    return 4;
  }
  return 5;
}

function compareAbilityOptions(a: AbilityOption, b: AbilityOption): number {
  return getAbilityCategoryRank(a) - getAbilityCategoryRank(b) || a.code - b.code;
}

function matchesAbilityFilter(ability: AbilityOption, category: AbilityFilterCategory, normalizedQuery: string): boolean {
  if (category !== "all" && getAbilityCategory(ability) !== category) {
    return false;
  }
  if (!normalizedQuery) {
    return true;
  }
  const display = getAbilityDisplayParts(ability);
  return (
    formatAbilityName(ability.name).toLowerCase().includes(normalizedQuery) ||
    display.name.toLowerCase().includes(normalizedQuery) ||
    (display.detail?.toLowerCase().includes(normalizedQuery) ?? false) ||
    (ability.legion?.toLowerCase().includes(normalizedQuery) ?? false) ||
    String(ability.code).includes(normalizedQuery)
  );
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

function buildUnsupportedMercenary(characterCode: number, scope: EquipmentScope): CharacterMercenaryInfo {
  const characterName = CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`;
  return {
    characterCode,
    characterName,
    scope,
    supported: false,
    note:
      getCharacterGroup(characterName) === "arena"
        ? "아레나 캐릭터의 정보는 세이브 파일에 기록되지 않습니다."
        : "군단 오프셋이 확인되지 않았습니다."
  };
}

function buildUnsupportedStats(characterCode: number, scope: EquipmentScope): CharacterStatsInfo {
  const characterName = CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`;
  return {
    characterCode,
    characterName,
    scope,
    supported: false,
    note:
      getCharacterGroup(characterName) === "arena"
        ? "아레나 캐릭터의 정보는 세이브 파일에 기록되지 않습니다."
        : "스탯 오프셋이 확인되지 않았습니다.",
    fields: []
  };
}

function buildUnsupportedAbilities(characterCode: number, scope: EquipmentScope): CharacterAbilitiesInfo {
  const characterName = CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`;
  return {
    characterCode,
    characterName,
    scope,
    supported: false,
    note:
      getCharacterGroup(characterName) === "arena"
        ? "아레나 캐릭터의 정보는 세이브 파일에 기록되지 않습니다."
        : "어빌리티 오프셋이 확인되지 않았습니다.",
    abilities: []
  };
}

function buildEquipmentDraft(equipment?: CharacterEquipmentInfo): DraftEquipmentEntry | null {
  if (!equipment?.supported) {
    return null;
  }

  return {
    ...(Object.fromEntries(equipment.slots.map((slot) => [slot.key, slot.value])) as Record<EquipmentSlotKey, number>),
    face: equipment.face?.value,
    name: equipment.name?.value,
    job: equipment.job?.value,
    voice: equipment.voice?.value,
    body: equipment.body?.value,
    weaponAttackType: equipment.weaponAttackType?.value,
    weaponPicType: equipment.weaponPicType?.value,
    weaponType: equipment.weaponType?.value
  };
}

function buildEquipmentDrafts(equipment: CharacterEquipmentInfo[]): Record<number, DraftEquipmentEntry> {
  return Object.fromEntries(
    equipment
      .filter((item) => item.supported)
      .map((item) => [
        item.characterCode,
        {
          ...(Object.fromEntries(item.slots.map((slot) => [slot.key, slot.value])) as Record<EquipmentSlotKey, number>),
          face: item.face?.value,
          name: item.name?.value,
          job: item.job?.value,
          voice: item.voice?.value,
          body: item.body?.value,
          weaponAttackType: item.weaponAttackType?.value,
          weaponPicType: item.weaponPicType?.value,
          weaponType: item.weaponType?.value
        }
      ])
  ) as Record<number, DraftEquipmentEntry>;
}

function buildMercenaryDrafts(mercenaries: CharacterMercenaryInfo[]): Record<number, number> {
  return Object.fromEntries(
    mercenaries
      .filter((mercenary) => mercenary.supported && typeof mercenary.value === "number")
      .map((mercenary) => [mercenary.characterCode, mercenary.value ?? 0])
  ) as Record<number, number>;
}

function buildStatsDraft(stats?: CharacterStatsInfo): DraftStatsEntry | null {
  if (!stats?.supported) {
    return null;
  }
  return Object.fromEntries(
    stats.fields
      .filter((field) => field.editable && typeof field.value === "number")
      .map((field) => [field.key, String(field.value)])
  ) as DraftStatsEntry;
}

function buildStatsDrafts(statsList: CharacterStatsInfo[]): Record<number, DraftStatsEntry> {
  return Object.fromEntries(
    statsList
      .filter((stats) => stats.supported)
      .map((stats) => [
        stats.characterCode,
        Object.fromEntries(
          stats.fields
            .filter((field) => field.editable && typeof field.value === "number")
            .map((field) => [field.key, String(field.value)])
        )
      ])
  ) as Record<number, DraftStatsEntry>;
}

function buildAbilityDraft(abilities?: CharacterAbilitiesInfo): DraftAbilitiesEntry | null {
  if (!abilities?.supported) {
    return null;
  }
  return Object.fromEntries(abilities.abilities.map((ability) => [ability.code, String(ability.value)])) as DraftAbilitiesEntry;
}

function buildAbilityDrafts(abilitiesList: CharacterAbilitiesInfo[]): Record<number, DraftAbilitiesEntry> {
  return Object.fromEntries(
    abilitiesList
      .filter((abilities) => abilities.supported)
      .map((abilities) => [
        abilities.characterCode,
        Object.fromEntries(abilities.abilities.map((ability) => [ability.code, String(ability.value)]))
      ])
  ) as Record<number, DraftAbilitiesEntry>;
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
        face: draftEquipment[scope][item.characterCode].face ?? item.face?.value ?? 0,
        name: draftEquipment[scope][item.characterCode].name ?? item.name?.value ?? 0,
        job: draftEquipment[scope][item.characterCode].job ?? item.job?.value ?? 0,
        voice: draftEquipment[scope][item.characterCode].voice ?? item.voice?.value ?? 0,
        body: draftEquipment[scope][item.characterCode].body ?? item.body?.value ?? 0,
        weaponAttackType:
          draftEquipment[scope][item.characterCode].weaponAttackType ?? item.weaponAttackType?.value ?? 0,
        weaponPicType:
          draftEquipment[scope][item.characterCode].weaponPicType ?? item.weaponPicType?.value ?? 0,
        weaponType:
          draftEquipment[scope][item.characterCode].weaponType ?? item.weaponType?.value ?? 0,
        slots: Object.fromEntries(
          EQUIPMENT_SLOT_DEFINITIONS.map((slot) => [
            slot.key,
            draftEquipment[scope][item.characterCode][slot.key] ?? item.slots.find((value) => value.key === slot.key)?.value ?? 0
          ])
        ) as Record<EquipmentSlotKey, number>
      }))
  );
}

function buildStatsEdits(stats: SaveInfo["stats"], draftStats: DraftStats): CharacterStatsEdit[] {
  return (["field", "battle"] as EquipmentScope[]).flatMap((scope) =>
    stats[scope]
      .filter((item) => item.supported && draftStats[scope][item.characterCode])
      .map((item) => ({
        characterCode: item.characterCode,
        scope,
        values: Object.fromEntries(
          item.fields
            .filter((field) => field.editable)
            .map((field) => [
              field.key,
              Number((draftStats[scope][item.characterCode][field.key] ?? String(field.value ?? 0)).replaceAll(",", ""))
            ])
        ) as Partial<Record<CharacterStatKey, number>>
      }))
  );
}

function buildAbilityEdits(abilities: SaveInfo["abilities"], draftAbilities: DraftAbilities): CharacterAbilitiesEdit[] {
  return (["field", "battle"] as EquipmentScope[]).flatMap((scope) =>
    abilities[scope]
      .filter((item) => item.supported && draftAbilities[scope][item.characterCode])
      .map((item) => ({
        characterCode: item.characterCode,
        scope,
        values: buildAbilityEditValues(item, draftAbilities[scope][item.characterCode])
      }))
  );
}

function buildAbilityEditValues(item: CharacterAbilitiesInfo, draft: DraftAbilitiesEntry): Record<number, number> {
  const values = new Map<number, number>();
  for (const ability of item.abilities) {
    values.set(ability.code, parseAbilityDraftValue(draft[ability.code] ?? String(ability.value)));
  }
  for (const [codeText, valueText] of Object.entries(draft)) {
    const code = Number(codeText);
    if (Number.isInteger(code) && code >= 0 && code <= 0xff) {
      values.set(code, parseAbilityDraftValue(valueText));
    }
  }
  return Object.fromEntries(values) as Record<number, number>;
}

function getWeaponDetailOptions(
  options: Array<{ code: number; name: string }>,
  currentValue: number
): Array<{ code: number; name: string }> {
  if (options.some((option) => option.code === currentValue)) {
    return options;
  }
  return [{ code: currentValue, name: "현재 저장값" }, ...options];
}

function getCharacterDetailFields(group?: "character" | "weapon"): CharacterDetailField[] {
  const fields: CharacterDetailField[] = [
    { key: "face", label: "얼굴", options: CHARACTER_FACE_OPTIONS },
    { key: "name", label: "이름", options: CHARACTER_NAME_OPTIONS },
    { key: "job", label: "직업", options: CHARACTER_JOB_OPTIONS },
    { key: "voice", label: "목소리", options: CHARACTER_VOICE_OPTIONS },
    { key: "body", label: "모델링", options: CHARACTER_BODY_OPTIONS },
    { key: "weaponAttackType", label: "무기 공격 타입", options: WEAPON_ATTACK_TYPE_OPTIONS },
    { key: "weaponType", label: "무기 타입", options: WEAPON_TYPE_OPTIONS },
    { key: "weaponPicType", label: "무기 그림 타입", options: WEAPON_PIC_OPTIONS }
  ];
  if (group === "character") {
    return fields.slice(0, 5);
  }
  if (group === "weapon") {
    return fields.slice(5);
  }
  return fields;
}

function buildMercenaryEdits(
  mercenaries: SaveInfo["mercenaries"],
  draftMercenaries: DraftMercenaries
): CharacterMercenaryEdit[] {
  return (["field", "battle"] as EquipmentScope[]).flatMap((scope) =>
    mercenaries[scope]
      .filter((item) => item.supported && typeof draftMercenaries[scope][item.characterCode] === "number")
      .map((item) => ({
        characterCode: item.characterCode,
        scope,
        value: draftMercenaries[scope][item.characterCode]
      }))
  );
}

function buildInventoryDraft(inventory: InventorySlotInfo[]): DraftInventorySlot[] {
  return inventory.map((item) => ({
    itemCode: item.itemCode,
    quantity: String(item.quantity)
  }));
}

function buildMoneyEdits(draftMoney: DraftMoney): SaveEditRequest["money"] {
  return {
    field: {
      episode4: Number(draftMoney.field.episode4.replaceAll(",", "")),
      episode5: Number(draftMoney.field.episode5.replaceAll(",", ""))
    },
    battle: {
      episode4: Number(draftMoney.battle.episode4.replaceAll(",", "")),
      episode5: Number(draftMoney.battle.episode5.replaceAll(",", ""))
    }
  };
}

function buildInventorySlotEdits(draftInventory: DraftInventory): NonNullable<SaveEditRequest["inventorySlots"]> {
  return {
    field: {
      episode4: parseInventoryDraft(draftInventory.field.episode4),
      episode5: parseInventoryDraft(draftInventory.field.episode5)
    },
    battle: {
      episode4: parseInventoryDraft(draftInventory.battle.episode4),
      episode5: parseInventoryDraft(draftInventory.battle.episode5)
    }
  };
}

function parseInventoryDraft(inventory: DraftInventorySlot[]): InventorySlotEdit[] {
  return inventory.map((item) => ({
    itemCode: item.itemCode,
    quantity: item.quantity === "" ? 0 : Number(item.quantity.replaceAll(",", ""))
  }));
}

function getInitialMainTab(save: SaveInfo): MainTabKey {
  const episode = save.episode.label === "에피소드5" ? "episode5" : "episode4";
  if (save.type.code === 1) {
    return episode === "episode5" ? "episode5Battle" : "episode4Battle";
  }
  return episode === "episode5" ? "episode5Field" : "episode4Field";
}

function isMainTabAvailable(save: SaveInfo, tabKey: MainTabKey): boolean {
  const tab = mainTabs.find((item) => item.key === tabKey);
  return Boolean(tab && (tab.scope === "field" || save.type.code === 1));
}

function getSelectableCharacterCodes(save: SaveInfo, tab: MainTab): number[] {
  if (tab.scope === "battle") {
    const battleCodes = save.equipment.battle.filter((equipment) => equipment.supported).map((equipment) => equipment.characterCode);
    if (battleCodes.length > 0) {
      return battleCodes;
    }
    return save.mercenaries.battle.filter((mercenary) => mercenary.supported).map((mercenary) => mercenary.characterCode);
  }

  const partyCodes = save.parties[tab.episode].members.map((member) => member.code);
  if (partyCodes.length > 0) {
    return partyCodes;
  }

  const fieldCodes = save.equipment.field.filter((equipment) => equipment.supported).map((equipment) => equipment.characterCode);
  if (fieldCodes.length > 0) {
    return fieldCodes;
  }
  return save.mercenaries.field.filter((mercenary) => mercenary.supported).map((mercenary) => mercenary.characterCode);
}

function isValidMoney(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
}

function isValidCount(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 99;
}

function isValidUint16(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xffff;
}

function isValidSignedUint16(value: number): boolean {
  return Number.isInteger(value) && value >= -0x8000 && value <= 0x7fff;
}

function isSignedStatField(key: CharacterStatKey): boolean {
  return key === "tpCurrent";
}

function areStatDraftsValid(stats: SaveInfo["stats"], draftStats: DraftStats): boolean {
  return (["field", "battle"] as EquipmentScope[]).every((scope) =>
    stats[scope].every((item) => {
      const draft = draftStats[scope][item.characterCode];
      if (!draft) {
        return true;
      }
      return item.fields
        .filter((field) => field.editable)
        .every((field) => {
          const value = Number((draft[field.key] ?? String(field.value ?? 0)).replaceAll(",", ""));
          return isSignedStatField(field.key) ? isValidSignedUint16(value) : isValidUint16(value);
        });
    })
  );
}

function areAbilityDraftsValid(abilities: SaveInfo["abilities"], draftAbilities: DraftAbilities): boolean {
  return (["field", "battle"] as EquipmentScope[]).every((scope) =>
    abilities[scope].every((item) => {
      const draft = draftAbilities[scope][item.characterCode];
      if (!draft) {
        return true;
      }
      return Object.entries(draft).every(([codeText, valueText]) => {
        const code = Number(codeText);
        const value = parseAbilityDraftValue(valueText);
        return Number.isInteger(code) && code >= 0 && code <= 0xff && isValidAbilityLevel(value);
      });
    })
  );
}

function parseAbilityDraftValue(value: string): number {
  const normalizedValue = value.trim().replaceAll(",", "");
  if (normalizedValue === "") {
    return 0xff;
  }
  return Number(normalizedValue);
}

function isValidAbilityLevel(value: number): boolean {
  return Number.isInteger(value) && ((value >= 1 && value <= 20) || value === 0xff);
}

function isActiveAbilityLevel(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 20;
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

function isFileDrag(event: DragEvent<HTMLElement>): boolean {
  return Array.from(event.dataTransfer.types).includes("Files");
}

function isLeavingViewport(event: DragEvent<HTMLElement>): boolean {
  return (
    event.clientX <= 0 ||
    event.clientY <= 0 ||
    event.clientX >= window.innerWidth ||
    event.clientY >= window.innerHeight
  );
}

function getAssetSrc(path: string): string {
  return `./${path}`;
}

function getDownloadFileName(filePath: string): string {
  const fileName = getFileName(filePath);
  const backupMatch = fileName.match(/^(.+\.sav)\.\d{14}$/i);
  return backupMatch?.[1] ?? fileName;
}

async function openBrowserSavePicker(): Promise<LoadedSave | null> {
  const file = await pickBrowserFile();
  return file ? readBrowserSaveFile(file) : null;
}

function pickBrowserFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    let resolved = false;
    let handleFocus: () => void;
    const finish = (file: File | null) => {
      if (resolved) {
        return;
      }
      resolved = true;
      window.removeEventListener("focus", handleFocus);
      input.remove();
      resolve(file);
    };
    handleFocus = () => {
      window.setTimeout(() => finish(input.files?.item(0) ?? null), 300);
    };
    input.type = "file";
    input.accept = ".sav,.SAV";
    input.style.display = "none";
    input.addEventListener(
      "change",
      () => {
        finish(input.files?.item(0) ?? null);
      },
      { once: true }
    );
    window.addEventListener("focus", handleFocus, { once: true });
    document.body.append(input);
    input.click();
  });
}

async function readBrowserSaveFile(file: File): Promise<LoadedSave> {
  if (!/\.sav(?:\.\d{14})?$/i.test(file.name)) {
    throw new Error(".sav 또는 .sav.년월일시분초 파일만 열 수 있습니다.");
  }

  const browserBytes = new Uint8Array(await file.arrayBuffer());
  return {
    save: parseSave(browserBytes, file.name),
    browserBytes
  };
}

function downloadSaveFile(data: Uint8Array, fileName: string): void {
  const downloadBuffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(downloadBuffer).set(data);
  const blob = new Blob([downloadBuffer], {
    type: "application/octet-stream"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
