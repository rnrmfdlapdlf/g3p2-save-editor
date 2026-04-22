export type EpisodeKey = "episode4" | "episode5";

export type PartyMember = {
  slot: number;
  code: number;
  name: string;
  offset: number;
  raw: string;
};

export type PartyInfo = {
  label: string;
  offset: number;
  count: number;
  members: PartyMember[];
};

export type MoneyInfo = {
  label: string;
  offset: number;
  value: number;
  raw: string;
};

export type InventoryItemKey =
  | "lowCapsule"
  | "fullRecoveryCapsule"
  | "recoveryCapsule"
  | "stabilizer"
  | "goddessHolyWater"
  | "mediumCapsule"
  | "highCapsule"
  | "bigCapsule"
  | "gift";

export type InventoryItemInfo = {
  key: InventoryItemKey;
  name: string;
  itemCode: number;
  codeOffset: number;
  quantityOffset: number;
  value: number;
  raw: string;
  supported: boolean;
};

export type EquipmentSlotKey = "weapon" | "armor" | "necklace" | "ring" | "belt" | "shoes";
export type EquipmentScope = "field" | "battle";
export type InventoryItemCategory = EquipmentSlotKey | "item";

export type InventoryCatalogItem = {
  code: number;
  name: string;
  category: InventoryItemCategory;
};

export type InventorySlotInfo = {
  slot: number;
  itemCode: number;
  name: string;
  category?: InventoryItemCategory;
  codeOffset: number;
  quantityOffset: number;
  quantity: number;
  rawCode: string;
  rawQuantity: string;
  known: boolean;
};

export type InventorySlotEdit = {
  itemCode: number;
  quantity: number;
};

export type EquipmentSlotInfo = {
  key: EquipmentSlotKey;
  label: string;
  offset: number;
  value: number;
  raw: string;
};

export type CharacterEquipmentInfo = {
  characterCode: number;
  characterName: string;
  scope: EquipmentScope;
  supported: boolean;
  note?: string;
  slots: EquipmentSlotInfo[];
};

export type CharacterMercenaryInfo = {
  characterCode: number;
  characterName: string;
  supported: boolean;
  note?: string;
  offset?: number;
  value?: number;
  raw?: string;
};

export type SaveLocationLabel = "연대표" | "챕터" | "전투" | "알 수 없음";
export type SaveEpisodeLabel = "미선택" | "에피소드4" | "에피소드5";

export type SaveInfo = {
  filePath: string;
  fileName: string;
  size: number;
  playTime: {
    milliseconds: number;
    display: string;
  };
  location: {
    code: number;
    label: SaveLocationLabel;
    sceneId: number;
  };
  episode: {
    label: SaveEpisodeLabel;
  };
  checksum: {
    stored: number;
    calculated: number;
    ok: boolean;
  };
  money: Record<EpisodeKey, MoneyInfo>;
  inventory: Record<EpisodeKey, Record<InventoryItemKey, InventoryItemInfo>>;
  inventorySlots: Record<EpisodeKey, InventorySlotInfo[]>;
  parties: Record<EpisodeKey, PartyInfo>;
  equipment: Record<EquipmentScope, CharacterEquipmentInfo[]>;
  mercenaries: CharacterMercenaryInfo[];
};

export type CharacterEquipmentEdit = {
  characterCode: number;
  scope: EquipmentScope;
  slots: Record<EquipmentSlotKey, number>;
};

export type CharacterMercenaryEdit = {
  characterCode: number;
  value: number;
};

export type SaveEditRequest = {
  money: Record<EpisodeKey, number>;
  inventory?: Partial<Record<EpisodeKey, Partial<Record<InventoryItemKey, number>>>>;
  inventorySlots?: Partial<Record<EpisodeKey, InventorySlotEdit[]>>;
  parties: Record<EpisodeKey, number[]>;
  equipment?: CharacterEquipmentEdit[];
  mercenaries?: CharacterMercenaryEdit[];
};

export const MONEY_OFFSETS: Record<EpisodeKey, { label: string; offset: number }> = {
  episode4: { label: "에피소드4 / 영혼의 검", offset: 0x63f8 },
  episode5: { label: "에피소드5 / 뫼비우스의 우주", offset: 0x74a8 }
};

export const INVENTORY_ITEM_DEFINITIONS: Record<InventoryItemKey, { name: string; itemCode: number }> = {
  lowCapsule: { name: "로우캡슐", itemCode: 122 },
  fullRecoveryCapsule: { name: "완전회복캡슐", itemCode: 124 },
  recoveryCapsule: { name: "회복캡슐", itemCode: 123 },
  stabilizer: { name: "안정제", itemCode: 125 },
  goddessHolyWater: { name: "여신의 성수", itemCode: 126 },
  mediumCapsule: { name: "미디엄캡슐", itemCode: 222 },
  highCapsule: { name: "하이캡슐", itemCode: 223 },
  bigCapsule: { name: "빅캡슐", itemCode: 224 },
  gift: { name: "기프트", itemCode: 225 }
};

export const INVENTORY_TABLES: Record<EpisodeKey, { startOffset: number; countOffset: number; slotCount: number }> = {
  episode4: {
    startOffset: 0x63fc,
    countOffset: 0x63f4,
    slotCount: 12
  },
  episode5: {
    startOffset: 0x74ac,
    countOffset: 0x74a4,
    slotCount: 4
  }
};

export const PARTY_OFFSETS: Record<EpisodeKey, { label: string; offset: number }> = {
  episode4: { label: "영혼의 검", offset: 0x62f0 },
  episode5: { label: "뫼비우스의 우주", offset: 0x73a0 }
};

export const CHARACTER_NAMES = new Map<number, string>([
  [38, "레드헤드"],
  [56, "아셀라스"],
  [57, "젠"],
  [64, "카를로스"],
  [71, "아레나 샤크바리"],
  [75, "아레나 살라딘"],
  [76, "아레나 데미안"],
  [77, "아레나 아슈레이"],
  [78, "아레나 죠안"],
  [79, "아레나 크리스티앙"],
  [80, "아레나 엠블라"],
  [82, "아레나 레오파드"],
  [83, "아레나 마리아"],
  [84, "아레나 바룬"],
  [85, "아레나 손나딘"],
  [86, "아레나 유진"],
  [87, "아레나 디에네"],
  [88, "아레나 리차드"],
  [89, "아레나 에제키엘"],
  [90, "아레나 제이슨"],
  [91, "아레나 칼리오페"],
  [92, "아레나 레제드람"],
  [93, "아레나 루칼드"],
  [94, "아레나 아만딘"],
  [95, "아레나 로브"],
  [99, "아레나 란"],
  [100, "아레나 루시엔"],
  [101, "아레나 네리사"],
  [102, "아레나 레드헤드"],
  [104, "아레나 아셀라스"],
  [107, "아레나 리엔"],
  [109, "아레나 나탈리"],
  [110, "아레나 테오렐"],
  [219, "살라딘"],
  [220, "크리스티앙"],
  [221, "죠안"],
  [222, "란"],
  [223, "베라모드"],
  [236, "네리사"],
  [237, "에피소드4 데미안"],
  [238, "에피소드4 디에네"],
  [240, "루시엔"],
  [241, "리차드"],
  [242, "에피소드5 디에네"],
  [243, "마리아"],
  [244, "유진"],
  [245, "샤크바리"],
  [246, "에피소드4 루크랜서드"],
  [247, "엠블라"],
  [365, "아레나 베라모드"],
  [398, "리엔"],
  [427, "에피소드5 데미안"],
  [484, "에피소드5 루크랜서드"],
  [563, "나야트레이"],
  [594, "아레나 슈"],
  [598, "아레나 흑태자"],
  [599, "아레나 마에라드"],
  [600, "아레나 블랙레이븐"],
  [601, "아레나 하이델룬"],
  [602, "아레나 팬텀 데미안"],
  [603, "아레나 팬텀 마리아"],
  [604, "아레나 팬텀 유진"],
  [605, "아레나 카를로스"],
  [606, "아레나 슬라임 3형제"]
]);

export const CHARACTER_OPTIONS = Array.from(CHARACTER_NAMES, ([code, name]) => ({ code, name })).sort(
  (a, b) => a.code - b.code
);

export const EQUIPMENT_SLOT_DEFINITIONS: Array<{ key: EquipmentSlotKey; label: string; relativeOffset: number }> = [
  { key: "weapon", label: "무기", relativeOffset: 0 },
  { key: "armor", label: "방어구", relativeOffset: 2 },
  { key: "necklace", label: "목걸이", relativeOffset: 4 },
  { key: "ring", label: "반지", relativeOffset: 6 },
  { key: "belt", label: "허리띠", relativeOffset: 8 },
  { key: "shoes", label: "신발", relativeOffset: 10 }
];

export const EQUIPMENT_OPTIONS: Record<EquipmentSlotKey, Array<{ code: number; name: string }>> = {
  weapon: [
    { code: 0, name: "없음" },
    { code: 25, name: "어씨스터" },
    { code: 26, name: "듀얼 레이저" },
    { code: 56, name: "수련검" },
    { code: 57, name: "키퍼" },
    { code: 58, name: "블릿츠" },
    { code: 59, name: "폴리커" },
    { code: 60, name: "가디안" },
    { code: 61, name: "장검" },
    { code: 62, name: "씨즈" },
    { code: 174, name: "인스트럭터" },
    { code: 178, name: "실버 CON" },
    { code: 180, name: "실버 BAL" }
  ],
  armor: [
    { code: 0, name: "없음" },
    { code: 70, name: "바운서 EXP" },
    { code: 71, name: "바운서 BAL" },
    { code: 72, name: "레더아머" },
    { code: 73, name: "세라믹 아머" },
    { code: 74, name: "클래식 아머" },
    { code: 75, name: "클래식 EXP" },
    { code: 76, name: "클래식 PLUS" },
    { code: 77, name: "애쓸릿 어버" },
    { code: 78, name: "파워 아머" },
    { code: 79, name: "파워 EXP" },
    { code: 80, name: "엘란듀 아머" },
    { code: 81, name: "크로슬리 페일러" },
    { code: 82, name: "아크 아머" },
    { code: 161, name: "아크론 아머" },
    { code: 177, name: "바운서" }
  ],
  necklace: [
    { code: 0, name: "없음" },
    { code: 102, name: "그라톡스" },
    { code: 103, name: "미라쥬" },
    { code: 104, name: "천신경" },
    { code: 105, name: "플레임블라스" },
    { code: 165, name: "천사의 선물" }
  ],
  ring: [
    { code: 0, name: "없음" },
    { code: 96, name: "금반지" },
    { code: 97, name: "루비반지" },
    { code: 98, name: "다이아반지" },
    { code: 99, name: "램버트반지" },
    { code: 100, name: "코어반지" }
  ],
  belt: [
    { code: 0, name: "없음" },
    { code: 90, name: "가죽벨트" },
    { code: 91, name: "체인벨트" },
    { code: 92, name: "아이언벨트" },
    { code: 93, name: "램버트벨트" },
    { code: 94, name: "제쿨트벨트" },
    { code: 163, name: "스톤의 벨트" }
  ],
  shoes: [
    { code: 0, name: "없음" },
    { code: 84, name: "등산화" },
    { code: 85, name: "군화" },
    { code: 86, name: "파워드 슈즈" },
    { code: 87, name: "램버트 슈즈" },
    { code: 88, name: "라이트닝 슈즈" },
    { code: 162, name: "영자신발" }
  ]
};

export const INVENTORY_CATALOG: InventoryCatalogItem[] = [
  ...EQUIPMENT_SLOT_DEFINITIONS.flatMap((slot) =>
    EQUIPMENT_OPTIONS[slot.key]
      .filter((option) => option.code !== 0)
      .map((option) => ({
        code: option.code,
        name: option.name,
        category: slot.key as InventoryItemCategory
      }))
  ),
  { code: 122, name: "로우캡슐", category: "item" as InventoryItemCategory },
  { code: 222, name: "미디엄캡슐", category: "item" as InventoryItemCategory },
  { code: 223, name: "하이캡슐", category: "item" as InventoryItemCategory },
  { code: 224, name: "빅캡슐", category: "item" as InventoryItemCategory },
  { code: 123, name: "회복캡슐", category: "item" as InventoryItemCategory },
  { code: 124, name: "완전회복캡슐", category: "item" as InventoryItemCategory },
  { code: 125, name: "안정제", category: "item" as InventoryItemCategory },
  { code: 126, name: "여신의 성수", category: "item" as InventoryItemCategory },
  { code: 225, name: "기프트", category: "item" as InventoryItemCategory }
].sort((a, b) => a.category.localeCompare(b.category) || a.code - b.code);

export const MERCENARY_OPTIONS: Array<{ code: number; name: string }> = [
  { code: 0, name: "없음" },
  { code: 2, name: "일반병" },
  { code: 3, name: "일반병" },
  { code: 4, name: "바루스슬레이어" },
  { code: 5, name: "루나스군단" },
  { code: 6, name: "코어헌터" },
  { code: 7, name: "가이아버그즈" },
  { code: 8, name: "네트메카닉군단" },
  { code: 9, name: "현혹령군단" },
  { code: 10, name: "우주다하카" },
  { code: 12, name: "네트군단" },
  { code: 13, name: "미네랄군단" },
  { code: 14, name: "가이라리더" },
  { code: 15, name: "아벨리안군단" },
  { code: 16, name: "레즈스탕스1" },
  { code: 17, name: "레지스탕스2" },
  { code: 18, name: "블랙스피어스" },
  { code: 19, name: "글로리가드" },
  { code: 20, name: "아델룬1" },
  { code: 21, name: "아델룬2" },
  { code: 22, name: "아델룬3" },
  { code: 23, name: "강화병1" },
  { code: 24, name: "강화병2" },
  { code: 25, name: "강화병3" },
  { code: 26, name: "세큐리티볼" },
  { code: 27, name: "슬라임" },
  { code: 28, name: "준코부대" },
  { code: 29, name: "로드군단" },
  { code: 30, name: "페이온군단" },
  { code: 31, name: "스트라이커즈" },
  { code: 32, name: "우주해적단" },
  { code: 33, name: "전함크루1" },
  { code: 34, name: "전함크루2" },
  { code: 35, name: "전함크루3" },
  { code: 36, name: "우주말벌떼" },
  { code: 37, name: "페르소광신도들" },
  { code: 38, name: "구룡방원" },
  { code: 39, name: "글로리 마스터" },
  { code: 40, name: "팡테온" },
  { code: 41, name: "시리우스해적단" },
  { code: 42, name: "볼군단" },
  { code: 43, name: "슬라임3형제" },
  { code: 44, name: "은빛갈기" },
  { code: 45, name: "베델친위대" },
  { code: 46, name: "메트로스일반" },
  { code: 47, name: "메트로스장교" },
  { code: 48, name: "연구원" },
  { code: 49, name: "시즈" },
  { code: 50, name: "강화 안드로이드 군단" },
  { code: 51, name: "육갑전사" },
  { code: 52, name: "브레인엠티군단" },
  { code: 53, name: "세큐리티볼군단" },
  { code: 54, name: "세큐리티볼군단" },
  { code: 55, name: "글로리가드" },
  { code: 56, name: "글로리가드" },
  { code: 57, name: "슬라임" },
  { code: 58, name: "팡테온" },
  { code: 59, name: "팡테온" },
  { code: 60, name: "글로리마스터" },
  { code: 61, name: "일반길드" },
  { code: 62, name: "메트로스일반" },
  { code: 63, name: "슈 & 진" },
  { code: 64, name: "소울가딘어즈" },
  { code: 65, name: "강화병1" },
  { code: 66, name: "강화병1" },
  { code: 67, name: "제드군단" },
  { code: 68, name: "영 페이온" },
  { code: 69, name: "구룡방" },
  { code: 70, name: "레드해커즈" },
  { code: 71, name: "메트로스삼인방" },
  { code: 72, name: "페이온군단" },
  { code: 73, name: "로드군단" },
  { code: 74, name: "해커" },
  { code: 75, name: "블랙스피어스" },
  { code: 77, name: "팬널" }
];

const CHAPTER_EQUIPMENT_BASE_OFFSETS: Record<number, number> = {
  219: 0x3ed0,
  220: 0x49bc,
  221: 0x4618
};

const BATTLE_EQUIPMENT_BASE_OFFSETS: Record<number, number> = {
  219: 0x15409,
  220: 0x15db3,
  221: 0x158de
};

const MERCENARY_RELATIVE_OFFSET = -0x30;

const CHECKSUM_WEIGHTS = [3, 5, 7, 9] as const;

export function parseSave(data: Uint8Array, filePath: string): SaveInfo {
  const fileName = filePath.split(/[\\/]/).pop() ?? filePath;
  const storedChecksum = readUint16(data, data.length - 2);
  const calculatedChecksum = calculateChecksum(data);

  return {
    filePath,
    fileName,
    size: data.length,
    playTime: readPlayTime(data),
    location: readSaveLocation(data),
    episode: readSaveEpisode(data),
    checksum: {
      stored: storedChecksum,
      calculated: calculatedChecksum,
      ok: storedChecksum === calculatedChecksum
    },
    money: {
      episode4: readMoney(data, "episode4"),
      episode5: readMoney(data, "episode5")
    },
    inventory: readInventory(data),
    inventorySlots: {
      episode4: readInventorySlots(data, "episode4"),
      episode5: readInventorySlots(data, "episode5")
    },
    parties: {
      episode4: readParty(data, "episode4"),
      episode5: readParty(data, "episode5")
    },
    equipment: {
      field: readEquipment(data, "field"),
      battle: readEquipment(data, "battle")
    },
    mercenaries: readMercenaries(data)
  };
}

export function applyMoney(data: Uint8Array, episode: EpisodeKey, value: number): void {
  writeInverseUint32(data, MONEY_OFFSETS[episode].offset, value);
}

export function applyParty(data: Uint8Array, episode: EpisodeKey, codes: number[]): void {
  if (codes.length > 15) {
    throw new Error("파티는 최대 15명까지 저장합니다.");
  }

  const target = PARTY_OFFSETS[episode];
  writeInverseUint32(data, target.offset, codes.length);

  for (let index = 0; index < codes.length; index += 1) {
    writeInverseUint32(data, target.offset + 4 + index * 4, codes[index]);
  }

  for (let index = codes.length; index < 15; index += 1) {
    writeInverseUint32(data, target.offset + 4 + index * 4, 0);
  }
}

export function applySaveEdits(data: Uint8Array, edits: SaveEditRequest): void {
  applyMoney(data, "episode4", edits.money.episode4);
  applyMoney(data, "episode5", edits.money.episode5);
  applyInventoryEdits(data, edits.inventory ?? {});
  applyInventorySlotEdits(data, edits.inventorySlots ?? {});
  applyParty(data, "episode4", edits.parties.episode4);
  applyParty(data, "episode5", edits.parties.episode5);
  applyEquipmentEdits(data, edits.equipment ?? []);
  applyMercenaryEdits(data, edits.mercenaries ?? []);
  writeUint16(data, data.length - 2, calculateChecksum(data));
}

export function calculateChecksum(data: Uint8Array): number {
  let checksum = 0;
  for (let index = 0; index < data.length - 2; index += 1) {
    checksum += data[index] * CHECKSUM_WEIGHTS[index % CHECKSUM_WEIGHTS.length];
  }
  return checksum % 0x7d00;
}

function readPlayTime(data: Uint8Array): SaveInfo["playTime"] {
  const milliseconds = 0xffffff - readUint24(data, 0x04);
  return {
    milliseconds,
    display: formatPlayTime(milliseconds)
  };
}

function formatPlayTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function readSaveLocation(data: Uint8Array): SaveInfo["location"] {
  const code = readInverseUint32(data, 0x0c);
  return {
    code,
    label: getSaveLocationLabel(code),
    sceneId: readInverseUint32(data, 0x08)
  };
}

function readSaveEpisode(data: Uint8Array): SaveInfo["episode"] {
  return { label: getSaveEpisodeLabel(data) };
}

function getSaveEpisodeLabel(data: Uint8Array): SaveEpisodeLabel {
  const episode5PartyCount = readInverseUint32(data, PARTY_OFFSETS.episode5.offset);
  if (episode5PartyCount > 0) {
    return "에피소드5";
  }

  const episode4PartyCount = readInverseUint32(data, PARTY_OFFSETS.episode4.offset);
  if (episode4PartyCount > 0) {
    return "에피소드4";
  }

  return "미선택";
}

function getActiveEpisodeKey(data: Uint8Array): EpisodeKey {
  return getSaveEpisodeLabel(data) === "에피소드5" ? "episode5" : "episode4";
}

function getSaveLocationLabel(code: number): SaveLocationLabel {
  if (code === 7) {
    return "연대표";
  }
  if (code === 4) {
    return "챕터";
  }
  if (code === 1) {
    return "전투";
  }
  return "알 수 없음";
}

function readMoney(data: Uint8Array, episode: EpisodeKey): MoneyInfo {
  const target = MONEY_OFFSETS[episode];
  return {
    label: target.label,
    offset: target.offset,
    value: readInverseUint32(data, target.offset),
    raw: readRawHex(data, target.offset, 4)
  };
}

function readInventory(data: Uint8Array): Record<EpisodeKey, Record<InventoryItemKey, InventoryItemInfo>> {
  return {
    episode4: {
      lowCapsule: readInventoryItem(data, "episode4", "lowCapsule"),
      fullRecoveryCapsule: readInventoryItem(data, "episode4", "fullRecoveryCapsule"),
      recoveryCapsule: readInventoryItem(data, "episode4", "recoveryCapsule"),
      stabilizer: readInventoryItem(data, "episode4", "stabilizer"),
      goddessHolyWater: readInventoryItem(data, "episode4", "goddessHolyWater"),
      mediumCapsule: readInventoryItem(data, "episode4", "mediumCapsule"),
      highCapsule: readInventoryItem(data, "episode4", "highCapsule"),
      bigCapsule: readInventoryItem(data, "episode4", "bigCapsule"),
      gift: readInventoryItem(data, "episode4", "gift")
    },
    episode5: {
      lowCapsule: readInventoryItem(data, "episode5", "lowCapsule"),
      fullRecoveryCapsule: readInventoryItem(data, "episode5", "fullRecoveryCapsule"),
      recoveryCapsule: readInventoryItem(data, "episode5", "recoveryCapsule"),
      stabilizer: readInventoryItem(data, "episode5", "stabilizer"),
      goddessHolyWater: readInventoryItem(data, "episode5", "goddessHolyWater"),
      mediumCapsule: readInventoryItem(data, "episode5", "mediumCapsule"),
      highCapsule: readInventoryItem(data, "episode5", "highCapsule"),
      bigCapsule: readInventoryItem(data, "episode5", "bigCapsule"),
      gift: readInventoryItem(data, "episode5", "gift")
    }
  };
}

function readInventorySlots(data: Uint8Array, episode: EpisodeKey): InventorySlotInfo[] {
  const table = INVENTORY_TABLES[episode];
  if (table.startOffset <= 0 || table.countOffset <= 0) {
    return [];
  }

  const count = Math.min(readInverseUint32(data, table.countOffset), table.slotCount);
  const slots: InventorySlotInfo[] = [];

  for (let index = 0; index < count; index += 1) {
    const codeOffset = table.startOffset + index * 8;
    const quantityOffset = codeOffset + 4;
    if (quantityOffset + 4 > data.length) {
      break;
    }

    const itemCode = readInverseUint32(data, codeOffset);
    const catalogItem = getInventoryCatalogItem(itemCode);
    slots.push({
      slot: index + 1,
      itemCode,
      name: catalogItem?.name ?? "알 수 없음",
      category: catalogItem?.category,
      codeOffset,
      quantityOffset,
      quantity: readInverseUint32(data, quantityOffset),
      rawCode: readRawHex(data, codeOffset, 4),
      rawQuantity: readRawHex(data, quantityOffset, 4),
      known: Boolean(catalogItem)
    });
  }

  return slots;
}

function readInventoryItem(data: Uint8Array, episode: EpisodeKey, key: InventoryItemKey): InventoryItemInfo {
  const item = INVENTORY_ITEM_DEFINITIONS[key];
  const slot = findInventorySlot(data, episode, item.itemCode);
  if (slot === null) {
    return {
      key,
      name: item.name,
      itemCode: item.itemCode,
      codeOffset: 0,
      quantityOffset: 0,
      value: 0,
      raw: "",
      supported: INVENTORY_TABLES[episode].startOffset > 0
    };
  }

  return {
    key,
    name: item.name,
    itemCode: item.itemCode,
    codeOffset: slot.codeOffset,
    quantityOffset: slot.quantityOffset,
    value: readInverseUint32(data, slot.quantityOffset),
    raw: readRawHex(data, slot.quantityOffset, 4),
    supported: true
  };
}

function applyInventorySlotEdits(data: Uint8Array, edits: Partial<Record<EpisodeKey, InventorySlotEdit[]>>): void {
  for (const [episode, episodeEdits] of Object.entries(edits) as Array<[EpisodeKey, InventorySlotEdit[] | undefined]>) {
    if (!episodeEdits) {
      continue;
    }

    const table = INVENTORY_TABLES[episode];
    if (table.startOffset <= 0 || table.countOffset <= 0) {
      continue;
    }

    const normalized = episodeEdits.filter((item) => item.quantity > 0);
    if (normalized.length > table.slotCount) {
      throw new Error(`인벤토리는 최대 ${table.slotCount}개 항목까지 저장합니다.`);
    }

    const seenCodes = new Set<number>();
    for (const item of normalized) {
      if (!Number.isInteger(item.itemCode) || item.itemCode < 0 || item.itemCode > 0xffffffff) {
        throw new Error("소모품/장비 코드는 0 이상 4바이트 정수 이하여야 합니다.");
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 0 || item.quantity > 99) {
        throw new Error("소모품/장비 수량은 0~99 사이의 정수여야 합니다.");
      }
      if (seenCodes.has(item.itemCode)) {
        throw new Error("같은 소모품/장비는 인벤토리에 중복 저장할 수 없습니다.");
      }
      seenCodes.add(item.itemCode);
    }

    writeInverseUint32(data, table.countOffset, normalized.length);
    normalized.forEach((item, index) => {
      const codeOffset = table.startOffset + index * 8;
      const quantityOffset = codeOffset + 4;
      writeInverseUint32(data, codeOffset, item.itemCode);
      writeInverseUint32(data, quantityOffset, item.quantity);
    });
  }
}

function applyInventoryEdits(data: Uint8Array, edits: Partial<Record<EpisodeKey, Partial<Record<InventoryItemKey, number>>>>): void {
  for (const [episode, episodeEdits] of Object.entries(edits) as Array<[EpisodeKey, Partial<Record<InventoryItemKey, number>> | undefined]>) {
    if (!episodeEdits) {
      continue;
    }

    for (const [key, value] of Object.entries(episodeEdits) as Array<[InventoryItemKey, number | undefined]>) {
      if (typeof value !== "number") {
        continue;
      }
      if (!Number.isInteger(value) || value < 0 || value > 99) {
        throw new Error("소모품 수량은 0~99 사이의 정수여야 합니다.");
      }

      const item = INVENTORY_ITEM_DEFINITIONS[key];
      const existingSlot = findInventorySlot(data, episode, item.itemCode);
      const slot = existingSlot ?? findReusableInventorySlot(data, episode);
      if (slot === null) {
        continue;
      }
      writeInverseUint32(data, slot.codeOffset, item.itemCode);
      writeInverseUint32(data, slot.quantityOffset, value);
      if (existingSlot === null && value > 0) {
        updateInventoryCount(data, episode, slot.index + 1);
      }
    }
  }
}

export function getInventoryCatalogItem(itemCode: number): InventoryCatalogItem | undefined {
  return INVENTORY_CATALOG.find((item) => item.code === itemCode);
}

function findInventorySlot(
  data: Uint8Array,
  episode: EpisodeKey,
  itemCode: number
): { index: number; codeOffset: number; quantityOffset: number } | null {
  const table = INVENTORY_TABLES[episode];
  if (table.startOffset <= 0) {
    return null;
  }
  const scanCount = Math.min(readInverseUint32(data, table.countOffset), table.slotCount);

  for (let index = 0; index < scanCount; index += 1) {
    const codeOffset = table.startOffset + index * 8;
    const quantityOffset = codeOffset + 4;
    if (quantityOffset + 4 > data.length) {
      return null;
    }
    if (readInverseUint32(data, codeOffset) === itemCode) {
      return { index, codeOffset, quantityOffset };
    }
  }

  return null;
}

function findReusableInventorySlot(
  data: Uint8Array,
  episode: EpisodeKey
): { index: number; codeOffset: number; quantityOffset: number } | null {
  const table = INVENTORY_TABLES[episode];
  if (table.startOffset <= 0) {
    return null;
  }

  const currentCount = Math.min(readInverseUint32(data, table.countOffset), table.slotCount);
  if (currentCount >= table.slotCount) {
    return null;
  }

  const codeOffset = table.startOffset + currentCount * 8;
  const quantityOffset = codeOffset + 4;
  if (quantityOffset + 4 > data.length) {
    return null;
  }

  return { index: currentCount, codeOffset, quantityOffset };
}

function updateInventoryCount(data: Uint8Array, episode: EpisodeKey, minimumCount: number): void {
  const table = INVENTORY_TABLES[episode];
  if (table.countOffset <= 0) {
    return;
  }

  const currentCount = readInverseUint32(data, table.countOffset);
  if (currentCount < minimumCount) {
    writeInverseUint32(data, table.countOffset, minimumCount);
  }
}

function readParty(data: Uint8Array, episode: EpisodeKey): PartyInfo {
  const target = PARTY_OFFSETS[episode];
  const count = readInverseUint32(data, target.offset);
  const safeCount = Math.min(count, 30);
  const members: PartyMember[] = [];

  for (let index = 0; index < safeCount; index += 1) {
    const offset = target.offset + 4 + index * 4;
    const code = readInverseUint32(data, offset);
    members.push({
      slot: index + 1,
      code,
      offset,
      raw: readRawHex(data, offset, 4),
      name: CHARACTER_NAMES.get(code) ?? `알 수 없음 (${code})`
    });
  }

  return {
    label: target.label,
    offset: target.offset,
    count,
    members
  };
}

function readEquipment(data: Uint8Array, scope: EquipmentScope): CharacterEquipmentInfo[] {
  const activeParty = readParty(data, getActiveEpisodeKey(data));
  return activeParty.members.map((member) => readCharacterEquipment(data, member.code, scope));
}

function readCharacterEquipment(data: Uint8Array, characterCode: number, scope: EquipmentScope): CharacterEquipmentInfo {
  const characterName = CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`;
  const baseOffset = getEquipmentBaseOffset(data, characterCode, scope);

  if (baseOffset === null) {
    return {
      characterCode,
      characterName,
      scope,
      supported: false,
      note:
        scope === "battle"
          ? "전투 장비 위치가 확인되지 않았거나 전투 세이브가 아닙니다."
          : "아직 장비 오프셋이 확인되지 않은 캐릭터입니다.",
      slots: []
    };
  }

  return {
    characterCode,
    characterName,
    scope,
    supported: true,
    slots: EQUIPMENT_SLOT_DEFINITIONS.map((slot) => {
      const offset = baseOffset + slot.relativeOffset;
      return {
        key: slot.key,
        label: slot.label,
        offset,
        value: readInverseUint16(data, offset),
        raw: readRawHex(data, offset, 2)
      };
    })
  };
}

function applyEquipmentEdits(data: Uint8Array, edits: CharacterEquipmentEdit[]): void {
  for (const edit of edits) {
    const baseOffset = getEquipmentBaseOffset(data, edit.characterCode, edit.scope);
    if (baseOffset === null) {
      continue;
    }

    for (const slot of EQUIPMENT_SLOT_DEFINITIONS) {
      writeInverseUint16(data, baseOffset + slot.relativeOffset, edit.slots[slot.key] ?? 0);
    }
  }
}

function getEquipmentBaseOffset(data: Uint8Array, characterCode: number, scope: EquipmentScope): number | null {
  const locationCode = readInverseUint32(data, 0x0c);
  const baseOffset = scope === "field" ? CHAPTER_EQUIPMENT_BASE_OFFSETS[characterCode] : BATTLE_EQUIPMENT_BASE_OFFSETS[characterCode];

  if (scope === "battle" && locationCode !== 1) {
    return null;
  }

  if (typeof baseOffset !== "number" || baseOffset + 12 > data.length) {
    return null;
  }

  return baseOffset;
}

function readMercenaries(data: Uint8Array): CharacterMercenaryInfo[] {
  const activeParty = readParty(data, getActiveEpisodeKey(data));
  return activeParty.members.map((member) => readCharacterMercenary(data, member.code));
}

function readCharacterMercenary(data: Uint8Array, characterCode: number): CharacterMercenaryInfo {
  const characterName = CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`;
  const offset = getMercenaryOffset(characterCode);

  if (offset === null || offset + 4 > data.length) {
    return {
      characterCode,
      characterName,
      supported: false,
      note: "아직 용병단 위치가 확인되지 않은 캐릭터입니다."
    };
  }

  return {
    characterCode,
    characterName,
    supported: true,
    offset,
    value: readInverseUint32(data, offset),
    raw: readRawHex(data, offset, 4)
  };
}

function applyMercenaryEdits(data: Uint8Array, edits: CharacterMercenaryEdit[]): void {
  for (const edit of edits) {
    const offset = getMercenaryOffset(edit.characterCode);
    if (offset === null || offset + 4 > data.length) {
      continue;
    }
    writeInverseUint32(data, offset, edit.value);
  }
}

function getMercenaryOffset(characterCode: number): number | null {
  const equipmentOffset = CHAPTER_EQUIPMENT_BASE_OFFSETS[characterCode];
  return typeof equipmentOffset === "number" ? equipmentOffset + MERCENARY_RELATIVE_OFFSET : null;
}

function readInverseUint16(data: Uint8Array, offset: number): number {
  return 0xffff - readUint16(data, offset);
}

function writeInverseUint16(data: Uint8Array, offset: number, value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffff) {
    throw new Error("장비 값은 0 이상 2바이트 정수 이하여야 합니다.");
  }
  writeUint16(data, offset, 0xffff - value);
}

function readInverseUint32(data: Uint8Array, offset: number): number {
  return 0xffffffff - readUint32(data, offset);
}

function writeInverseUint32(data: Uint8Array, offset: number, value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new Error("값은 0 이상 4바이트 정수 이하여야 합니다.");
  }
  writeUint32(data, offset, 0xffffffff - value);
}

function readRawHex(data: Uint8Array, offset: number, length: number): string {
  assertRange(data, offset, length);
  return Array.from(data.slice(offset, offset + length), (byte) =>
    byte.toString(16).padStart(2, "0").toUpperCase()
  ).join(" ");
}

function readUint16(data: Uint8Array, offset: number): number {
  assertRange(data, offset, 2);
  return data[offset] | (data[offset + 1] << 8);
}

function readUint24(data: Uint8Array, offset: number): number {
  assertRange(data, offset, 3);
  return data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16);
}

function writeUint16(data: Uint8Array, offset: number, value: number): void {
  assertRange(data, offset, 2);
  data[offset] = value & 0xff;
  data[offset + 1] = (value >>> 8) & 0xff;
}

function readUint32(data: Uint8Array, offset: number): number {
  assertRange(data, offset, 4);
  return (
    data[offset] |
    (data[offset + 1] << 8) |
    (data[offset + 2] << 16) |
    (data[offset + 3] << 24)
  ) >>> 0;
}

function writeUint32(data: Uint8Array, offset: number, value: number): void {
  assertRange(data, offset, 4);
  data[offset] = value & 0xff;
  data[offset + 1] = (value >>> 8) & 0xff;
  data[offset + 2] = (value >>> 16) & 0xff;
  data[offset + 3] = (value >>> 24) & 0xff;
}

function assertRange(data: Uint8Array, offset: number, length: number): void {
  if (offset < 0 || offset + length > data.length) {
    throw new Error(`세이브 파일이 예상보다 짧습니다. offset=0x${offset.toString(16)}`);
  }
}
