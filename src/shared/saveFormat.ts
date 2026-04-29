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
  supported: boolean;
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
export type SaveDataScope = EquipmentScope;
export type InventoryItemCategory = EquipmentSlotKey | "item";
export type WeaponKind =
  | "gun-slicer"
  | "sword"
  | "handgun"
  | "booster"
  | "cigar"
  | "camera-lens"
  | "greatsword"
  | "ribbon"
  | "claw"
  | "bottle"
  | "yoyo"
  | "asura"
  | "unknown";
export type ConsumableKind = "potion" | "first-aid" | "poison" | "bomb" | "green-liquid";

export const WEAPON_KIND_LABELS: Record<WeaponKind, string> = {
  "gun-slicer": "건 슬라이서",
  sword: "검",
  handgun: "핸드건",
  booster: "부스터",
  cigar: "시가",
  "camera-lens": "카메라 렌즈",
  greatsword: "대검",
  ribbon: "리본",
  claw: "크로",
  bottle: "술병",
  yoyo: "요요",
  asura: "아수라",
  unknown: "미분류"
};

export const CONSUMABLE_KIND_LABELS: Record<ConsumableKind, string> = {
  potion: "포션",
  "first-aid": "구급상자",
  poison: "독약",
  bomb: "폭탄",
  "green-liquid": "녹색 폭탄"
};

export type EquipmentOption = {
  code: number;
  name: string;
  weaponKind?: WeaponKind;
};

export type InventoryCatalogItem = {
  code: number;
  name: string;
  category: InventoryItemCategory;
  weaponKind?: WeaponKind;
  consumableKind?: ConsumableKind;
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

export type CharacterWeaponDetailInfo = {
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
  face?: CharacterWeaponDetailInfo;
  name?: CharacterWeaponDetailInfo;
  job?: CharacterWeaponDetailInfo;
  voice?: CharacterWeaponDetailInfo;
  body?: CharacterWeaponDetailInfo;
  weaponAttackType?: CharacterWeaponDetailInfo;
  weaponPicType?: CharacterWeaponDetailInfo;
  weaponType?: CharacterWeaponDetailInfo;
  slots: EquipmentSlotInfo[];
};

export type CharacterMercenaryInfo = {
  characterCode: number;
  characterName: string;
  scope: EquipmentScope;
  supported: boolean;
  note?: string;
  offset?: number;
  value?: number;
  raw?: string;
};

export type CharacterStatKey =
  | "level"
  | "levelExp"
  | "exp"
  | "lp"
  | "hp"
  | "psy"
  | "tpMax"
  | "stp"
  | "ctp"
  | "dep"
  | "dex"
  | "soulCurrent"
  | "tpCurrent";

export type CharacterStatFieldInfo = {
  key: CharacterStatKey;
  label: string;
  offset?: number;
  value?: number;
  raw?: string;
  editable: boolean;
  note?: string;
};

export type CharacterStatsInfo = {
  characterCode: number;
  characterName: string;
  scope: EquipmentScope;
  supported: boolean;
  note?: string;
  fields: CharacterStatFieldInfo[];
};

export type AbilityOption = {
  code: number;
  name: string;
};

export type CharacterAbilityValueInfo = AbilityOption & {
  offset: number;
  value: number;
  raw: string;
};

export type CharacterAbilitiesInfo = {
  characterCode: number;
  characterName: string;
  scope: EquipmentScope;
  supported: boolean;
  note?: string;
  abilities: CharacterAbilityValueInfo[];
};

export type SaveTypeLabel = "연대표" | "챕터" | "전투" | "알 수 없음";
export type SaveEpisodeLabel = "미선택" | "에피소드4" | "에피소드5";

export type SaveInfo = {
  filePath: string;
  fileName: string;
  size: number;
  playTime: {
    milliseconds: number;
    display: string;
  };
  type: {
    code: number;
    label: SaveTypeLabel;
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
  money: Record<SaveDataScope, Record<EpisodeKey, MoneyInfo>>;
  inventory: Record<SaveDataScope, Record<EpisodeKey, Record<InventoryItemKey, InventoryItemInfo>>>;
  inventorySlots: Record<SaveDataScope, Record<EpisodeKey, InventorySlotInfo[]>>;
  parties: Record<EpisodeKey, PartyInfo>;
  equipment: Record<EquipmentScope, CharacterEquipmentInfo[]>;
  mercenaries: Record<EquipmentScope, CharacterMercenaryInfo[]>;
  stats: Record<EquipmentScope, CharacterStatsInfo[]>;
  abilities: Record<EquipmentScope, CharacterAbilitiesInfo[]>;
};

export type CharacterEquipmentEdit = {
  characterCode: number;
  scope: EquipmentScope;
  face?: number;
  name?: number;
  job?: number;
  voice?: number;
  body?: number;
  weaponAttackType?: number;
  weaponPicType?: number;
  weaponType?: number;
  slots: Record<EquipmentSlotKey, number>;
};

export type CharacterMercenaryEdit = {
  characterCode: number;
  scope: EquipmentScope;
  value: number;
};

export type CharacterStatsEdit = {
  characterCode: number;
  scope: EquipmentScope;
  values: Partial<Record<CharacterStatKey, number>>;
};

export type CharacterAbilitiesEdit = {
  characterCode: number;
  scope: EquipmentScope;
  values: Record<number, number>;
};

export type SaveEditRequest = {
  money: Record<SaveDataScope, Record<EpisodeKey, number>>;
  inventory?: Partial<Record<SaveDataScope, Partial<Record<EpisodeKey, Partial<Record<InventoryItemKey, number>>>>>>;
  inventorySlots?: Partial<Record<SaveDataScope, Partial<Record<EpisodeKey, InventorySlotEdit[]>>>>;
  parties: Record<EpisodeKey, number[]>;
  equipment?: CharacterEquipmentEdit[];
  mercenaries?: CharacterMercenaryEdit[];
  stats?: CharacterStatsEdit[];
  abilities?: CharacterAbilitiesEdit[];
};

type InventoryTable = { startOffset: number; countOffset: number };

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

export const INVENTORY_TABLES: Record<EpisodeKey, InventoryTable> = {
  episode4: {
    startOffset: 0x63fc,
    countOffset: 0x63f4
  },
  episode5: {
    startOffset: 0x74ac,
    countOffset: 0x74a4
  }
};

const BATTLE_INVENTORY_TABLES = {
  episode4: {
    startOffset: 0xada3,
    countOffset: 0xad9b
  },
  episode5InEpisode4Battle: {
    startOffset: 0xbe53,
    countOffset: 0xbe4b
  },
  episode5: {
    startOffset: 0xbe49,
    countOffset: 0xbe41
  }
} satisfies Record<string, InventoryTable>;

export const PARTY_OFFSETS: Record<EpisodeKey, { label: string; offset: number }> = {
  episode4: { label: "영혼의 검", offset: 0x62f0 },
  episode5: { label: "뫼비우스의 우주", offset: 0x73a0 }
};
export const PARTY_MEMBER_LIMIT = 55;

export const CHARACTER_NAMES = new Map<number, string>([
  [36, "슈로 위장한 진"],
  [38, "레드헤드"],
  [39, "아레나 레빈(더미)"],
  [56, "아셀라스"],
  [57, "젠 (아슈레이)"],
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
  [237, "데미안 (에피소드4)"],
  [238, "디에네 (에피소드4)"],
  [239, "진"],
  [240, "루시엔"],
  [241, "리차드"],
  [242, "디에네 (에피소드5)"],
  [243, "마리아"],
  [244, "유진"],
  [245, "샤크바리"],
  [246, "루크랜서드 (에피소드4)"],
  [247, "엠블라"],
  [365, "아레나 베라모드"],
  [398, "리엔"],
  [427, "데미안 (에피소드5)"],
  [484, "루크랜서드 (에피소드5)"],
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

function isArenaCharacterName(name: string): boolean {
  return name.startsWith("아레나");
}

export const EQUIPMENT_SLOT_DEFINITIONS: Array<{ key: EquipmentSlotKey; label: string; relativeOffset: number }> = [
  { key: "weapon", label: "무기", relativeOffset: 0 },
  { key: "armor", label: "방어구", relativeOffset: 2 },
  { key: "necklace", label: "목걸이", relativeOffset: 4 },
  { key: "ring", label: "반지", relativeOffset: 6 },
  { key: "belt", label: "허리띠", relativeOffset: 8 },
  { key: "shoes", label: "신발", relativeOffset: 10 }
];

export const WEAPON_PIC_OPTIONS: Array<{ code: number; name: string }> = [
  { code: 0, name: "없음" },
  { code: 40, name: "밍밍의 리본" },
  { code: 41, name: "윙맨" },
  { code: 42, name: "니카 AF - 1" },
  { code: 43, name: "크로" },
  { code: 44, name: "권총" },
  { code: 45, name: "S&M 357" },
  { code: 47, name: "크루세이더" },
  { code: 48, name: "순백의 눈" },
  { code: 49, name: "버스터 슬라이서" },
  { code: 50, name: "코어 스틱" },
  { code: 51, name: "크루세이더" },
  { code: 52, name: "크로슬리 커스텀" },
  { code: 53, name: "부스터" },
  { code: 54, name: "아수라" },
  { code: 55, name: "쿡 슬라이서3" },
  { code: 56, name: "검" },
  { code: 57, name: "대검" }
];

export const WEAPON_TYPE_OPTIONS: Array<{ code: number; name: string }> = [
  { code: 0, name: "건 슬라이서" },
  { code: 14, name: "검" },
  { code: 12, name: "핸드건" },
  { code: 1, name: "부스터" },
  { code: 13, name: "시가" },
  { code: 10, name: "카메라 렌즈" },
  { code: 15, name: "대검" },
  { code: 8, name: "리본" },
  { code: 11, name: "크로" },
  { code: 17, name: "술병" },
  { code: 9, name: "요요" },
  { code: 16, name: "아수라" },
  { code: 13583, name: "건 슬라이서/핸드건" },
];

export const WEAPON_ATTACK_TYPE_OPTIONS: Array<{ code: number; name: string }> = [
  { code: 1, name: "근거리공격" },
  { code: 6, name: "원거리공격" },
  { code: 1479, name: "부스터" }
];

export const CHARACTER_FACE_OPTIONS: Array<{ code: number; name: string }> = [
  { code: 0, name: "없음" },
  { code: 229, name: "UNKNOWN" },
  { code: 362, name: "아돌" },
  { code: 364, name: "필그림(여)" },
  { code: 408, name: "카렐라" },
  { code: 433, name: "제이슨" },
  { code: 454, name: "아지다하카" },
  { code: 573, name: "칼리오페" },
  { code: 574, name: "이반" },
  { code: 655, name: "네리사" },
  { code: 656, name: "디에네" },
  { code: 657, name: "데미안" },
  { code: 658, name: "란" },
  { code: 659, name: "레드헤드" },
  { code: 668, name: "리엔" },
  { code: 669, name: "리차드" },
  { code: 671, name: "마리아" },
  { code: 672, name: "바룬" },
  { code: 673, name: "베라모드" },
  { code: 674, name: "살라딘" },
  { code: 675, name: "샤크바리" },
  { code: 676, name: "아셀라스" },
  { code: 677, name: "아슈레이" },
  { code: 679, name: "엠블라" },
  { code: 685, name: "죠안" },
  { code: 686, name: "카를로스" },
  { code: 688, name: "크리스티앙" },
  { code: 751, name: "루크랜서드" },
  { code: 756, name: "유진" },
  { code: 759, name: "아만딘" },
  { code: 762, name: "진" },
  { code: 766, name: "슈" },
  { code: 781, name: "손나딘" },
  { code: 789, name: "루시엔" },
  { code: 974, name: "나탈리" },
  { code: 1047, name: "유블레인" },
  { code: 1052, name: "하이델룬" },
  { code: 1078, name: "해커" },
  { code: 1080, name: "스턴(코어헌터)" },
  { code: 1081, name: "로브" },
  { code: 1082, name: "루칼드" },
  { code: 1084, name: "로드" },
  { code: 1085, name: "아델룬" },
  { code: 1086, name: "켄" },
  { code: 1087, name: "해적" },
  { code: 1088, name: "엘더마스터" },
  { code: 1089, name: "광신도" },
  { code: 1092, name: "무녀" },
  { code: 1101, name: "바루스" },
  { code: 1110, name: "테오렐" },
  { code: 1288, name: "나야트레이" },
  { code: 2004, name: "우주말벌" },
  { code: 2323, name: "슬라임3형제" }
];

export const CHARACTER_NAME_OPTIONS: Array<{ code: number; name: string }> = [
  { code: 0, name: "없음" },
  { code: 27, name: "나탈리" },
  { code: 30, name: "네리사" },
  { code: 228, name: "데미안" },
  { code: 229, name: "디에네" },
  { code: 437, name: "란" },
  { code: 443, name: "레드헤드" },
  { code: 449, name: "레제드람" },
  { code: 450, name: "로브" },
  { code: 451, name: "루시엔" },
  { code: 452, name: "루칼드" },
  { code: 455, name: "리벤" },
  { code: 456, name: "리엔" },
  { code: 458, name: "마리아" },
  { code: 459, name: "리차드" },
  { code: 460, name: "바룬" },
  { code: 462, name: "베라모드" },
  { code: 463, name: "살라딘" },
  { code: 464, name: "손나딘" },
  { code: 466, name: "아만딘" },
  { code: 467, name: "아셀라스" },
  { code: 468, name: "아슈레이" },
  { code: 470, name: "엠블라" },
  { code: 471, name: "유블레인" },
  { code: 472, name: "유진" },
  { code: 474, name: "제이슨" },
  { code: 475, name: "죠안" },
  { code: 477, name: "카를로스" },
  { code: 478, name: "칼리오페" },
  { code: 479, name: "크리스티앙" },
  { code: 480, name: "테오렐" },
  { code: 1692, name: "루크랜서드" },
  { code: 1898, name: "슈" },
  { code: 1899, name: "진" },
  { code: 1943, name: "샤크바리" },
  { code: 1999, name: "하이델룬" },
  { code: 2392, name: "젠" },
  { code: 2423, name: "슈로 위장한 진" },
  { code: 2567, name: "나야트레이" },
  // { code: 2907, name: "하이델룬" },
];

export const CHARACTER_JOB_OPTIONS: Array<{ code: number; name: string }> = [
  { code: 0, name: "없음" },
  { code: 951, name: "코어 헌터" },
  { code: 1219, name: "변충류" },
  { code: 1291, name: "엑토플라즘" },
  { code: 1292, name: "귀묘류" },
  { code: 1293, name: "북두괴류" },
  { code: 1294, name: "괴수령류" },
  { code: 1295, name: "포유류" },
  { code: 1296, name: "무직" },
  { code: 1297, name: "우주해적" },
  { code: 1399, name: "학생" },
  { code: 1672, name: "젤류" },
  { code: 1673, name: "세큐리티볼" },
  { code: 1674, name: "스파이더" },
  { code: 1675, name: "라이더" },
  { code: 1679, name: "로드" },
  { code: 1680, name: "제드" },
  { code: 1681, name: "페이온" },
  { code: 1685, name: "아델룬" },
  { code: 1688, name: "술집주인" },
  { code: 1747, name: "마스터" },
  { code: 1897, name: "무녀" },
  { code: 1986, name: "아벨리안" },
  { code: 1987, name: "아르케 중앙군" },
  { code: 1988, name: "기자" },
  { code: 1989, name: "연구소장" },
  { code: 1990, name: "루나스" },
  { code: 1991, name: "길드리더" },
  { code: 1992, name: "보좌관" },
  { code: 1994, name: "베델" },
  { code: 1995, name: "장교" },
  { code: 1996, name: "해적" },
  { code: 1997, name: "그레이팬텀" },
  { code: 1998, name: "교주" },
  { code: 2001, name: "하이델룬" },
  { code: 2002, name: "팡테온 가드" },
  { code: 2003, name: "전함승무원" },
  { code: 2124, name: "구룡방원" },
  { code: 2153, name: "주민" },
  { code: 2244, name: "블랙스피어스" },
  { code: 2245, name: "은빛갈기" },
  { code: 2246, name: "길드원" },
  { code: 2247, name: "발룬티어시민" },
  { code: 2248, name: "슬럼주민" },
  { code: 2250, name: "보아즈교도" },
  { code: 2251, name: "연구원" },
  { code: 2252, name: "해커" },
  { code: 2253, name: "아벨리안" },
  { code: 2254, name: "아벨리안교관" },
  { code: 2255, name: "일반병사" },
  { code: 2256, name: "글로리가드" },
  { code: 2257, name: "베델친위대" },
  { code: 2258, name: "안드로이드" },
  { code: 2259, name: "강화아델룬" },
  { code: 2347, name: "소매치기" },
  { code: 2841, name: "없음" }
];

export const CHARACTER_VOICE_OPTIONS: Array<{ code: number; name: string }> = [
  { code: 0, name: "없음" },
  { code: 1, name: "죠안" },
  { code: 2, name: "제이슨" },
  { code: 3, name: "블랙 스피어스" },
  { code: 4, name: "해적" },
  { code: 5, name: "진(슈)" },
  { code: 6, name: "아만딘" },
  { code: 7, name: "칼리오페" },
  { code: 11, name: "나야트레이" },
  { code: 12, name: "나탈리" },
  { code: 13, name: "네리사" },
  { code: 14, name: "데미안" },
  { code: 15, name: "디에네" },
  { code: 16, name: "레드헤드" },
  { code: 17, name: "루시엔" },
  { code: 18, name: "루크랜서드" },
  { code: 19, name: "리엔" },
  { code: 20, name: "리차드" },
  { code: 21, name: "마리아" },
  { code: 22, name: "베라모드" },
  { code: 23, name: "살라딘" },
  { code: 24, name: "샤크바리" },
  { code: 25, name: "아셀라스" },
  { code: 26, name: "엠블라" },
  { code: 27, name: "유진" },
  { code: 28, name: "카를로스" },
  { code: 30, name: "란" },
  { code: 32, name: "크리스티앙" },
  { code: 33, name: "하이델룬" },
  { code: 34, name: "아슈레이" },
  { code: 35, name: "베라모드 (마에라드)" },
  { code: 36, name: "현혹령" },
  { code: 37, name: "쥰코" },
  { code: 38, name: "아수라수호신" }
];

export const CHARACTER_BODY_OPTIONS: Array<{ code: number; name: string }> = [
  { code: 0, name: "없음" },
  { code: 55, name: "아셀라스" },
  { code: 62, name: "대화모습 (죠안, 보통)" },
  { code: 63, name: "대화모습 (크리스티앙, 보통)" },
  { code: 202, name: "샤크바리" },
  { code: 256, name: "데미안" },
  { code: 323, name: "크리스티앙" },
  { code: 338, name: "죠안" },
  { code: 347, name: "살라딘" },
  { code: 368, name: "제이슨" },
  { code: 392, name: "엠블라" },
  { code: 506, name: "베라모드" },
  { code: 507, name: "베라모드 (마에라드)" },
  { code: 540, name: "칼리오페" },
  { code: 567, name: "디에네 (에피소드4)" },
  { code: 570, name: "란" },
  { code: 572, name: "마리아" },
  { code: 582, name: "리차드" },
  { code: 597, name: "아슈레이" },
  { code: 641, name: "카를로스" },
  { code: 649, name: "루크랜서드" },
  { code: 899, name: "네리사" },
  { code: 900, name: "유진" },
  { code: 903, name: "루시엔" },
  { code: 1007, name: "아만딘" },
  { code: 1017, name: "리엔" },
  { code: 1096, name: "레드헤드" },
  { code: 1165, name: "하이델룬" },
  { code: 1166, name: "슈" },
  { code: 1167, name: "진" },
  { code: 1185, name: "살라딘 (크로슬리 커스텀)" },
  { code: 1205, name: "디에네 (에피소드5)" },
  { code: 1218, name: "나탈리" },
  { code: 1259, name: "손나딘" },
  { code: 1277, name: "나야트레이" },
  { code: 1278, name: "유블레인" },
  { code: 1306, name: "테오렐" },
  { code: 1307, name: "레제드람" },
  { code: 1308, name: "루칼드" },
  { code: 1309, name: "로브" },
  { code: 1310, name: "바룬" },
  { code: 1481, name: "흑태자" }
];

export const EQUIPMENT_OPTIONS: Record<EquipmentSlotKey, EquipmentOption[]> = {
  weapon: [
    { code: 0, name: "없음" },
    { code: 1, name: "옐로 리본", weaponKind: "ribbon" },
    { code: 2, name: "블루 리본", weaponKind: "ribbon" },
    { code: 3, name: "화이트 리본", weaponKind: "ribbon" },
    { code: 4, name: "레드 리본", weaponKind: "ribbon" },
    { code: 5, name: "실버 리본", weaponKind: "ribbon" },
    { code: 6, name: "골드 리본", weaponKind: "ribbon" },
    { code: 7, name: "플라티늄 리본", weaponKind: "ribbon" },
    { code: 10, name: "베이직 휠", weaponKind: "yoyo" },
    { code: 11, name: "체리오트", weaponKind: "yoyo" },
    { code: 12, name: "파이어 휠", weaponKind: "yoyo" },
    { code: 13, name: "써니 휠", weaponKind: "yoyo" },
    { code: 15, name: "글래스 렌즈", weaponKind: "camera-lens" },
    { code: 16, name: "옵틱 써클", weaponKind: "camera-lens" },
    { code: 17, name: "프라임 렌즈", weaponKind: "camera-lens" },
    { code: 18, name: "언터처블 렌즈", weaponKind: "camera-lens" },
    { code: 20, name: "베이직 크로", weaponKind: "claw" },
    { code: 21, name: "세라믹 크로", weaponKind: "claw" },
    { code: 22, name: "아이언 크로", weaponKind: "claw" },
    { code: 23, name: "크리스탈 크로", weaponKind: "claw" },
    { code: 25, name: "어씨스터", weaponKind: "handgun" },
    { code: 26, name: "듀얼 레이지", weaponKind: "handgun" },
    { code: 27, name: "굿 펠라스", weaponKind: "handgun" },
    { code: 28, name: "길라디움 RX", weaponKind: "handgun" },
    { code: 29, name: "트윈 블래스터", weaponKind: "handgun" },
    { code: 30, name: "리볼버 발렌타인", weaponKind: "handgun" },
    { code: 32, name: "마일드 스모크", weaponKind: "cigar" },
    { code: 33, name: "쵸이스", weaponKind: "cigar" },
    { code: 34, name: "헤비 원", weaponKind: "cigar" },
    { code: 35, name: "헤이즐 스모크", weaponKind: "cigar" },
    { code: 36, name: "체인지 스모커", weaponKind: "cigar" },
    { code: 37, name: "후버의 자존심", weaponKind: "cigar" },
    { code: 39, name: "B-포트", weaponKind: "bottle" },
    { code: 40, name: "아이비 포트", weaponKind: "bottle" },
    { code: 41, name: "스파이더 포트", weaponKind: "bottle" },
    { code: 42, name: "스네이크 포트", weaponKind: "bottle" },
    { code: 43, name: "해저드 포트", weaponKind: "bottle" },
    { code: 45, name: "블루", weaponKind: "booster" },
    { code: 46, name: "튜터", weaponKind: "booster" },
    { code: 47, name: "토르트", weaponKind: "booster" },
    { code: 48, name: "레토르트", weaponKind: "booster" },
    { code: 49, name: "T-써클렛", weaponKind: "booster" },
    { code: 50, name: "S-써클렛", weaponKind: "booster" },
    { code: 51, name: "가리우스", weaponKind: "booster" },
    { code: 52, name: "G-써클렛", weaponKind: "booster" },
    { code: 53, name: "아이리스 써클렛", weaponKind: "booster" },
    { code: 54, name: "천원", weaponKind: "booster" },
    { code: 56, name: "수련검", weaponKind: "sword" },
    { code: 57, name: "키퍼", weaponKind: "sword" },
    { code: 58, name: "블리츠", weaponKind: "sword" },
    { code: 59, name: "플리커", weaponKind: "sword" },
    { code: 60, name: "가디안", weaponKind: "sword" },
    { code: 61, name: "장검", weaponKind: "sword" },
    { code: 62, name: "씨즈", weaponKind: "sword" },
    { code: 64, name: "큐티 스톤", weaponKind: "greatsword" },
    { code: 65, name: "라이언 하트", weaponKind: "greatsword" },
    { code: 66, name: "소울 브레이커", weaponKind: "greatsword" },
    { code: 67, name: "어비스 블랙", weaponKind: "greatsword" },
    { code: 129, name: "스페이스 리퍼", weaponKind: "gun-slicer" },
    { code: 130, name: "펠레의 빙검", weaponKind: "gun-slicer" },
    { code: 131, name: "맘모스", weaponKind: "gun-slicer" },
    { code: 132, name: "트윌라잇 크로스", weaponKind: "gun-slicer" },
    { code: 134, name: "크림슨 프리즘", weaponKind: "booster" },
    { code: 135, name: "바인드 프리즘", weaponKind: "booster" },
    { code: 136, name: "헬 프리즘", weaponKind: "booster" },
    { code: 137, name: "멜리사의 해골", weaponKind: "booster" },
    { code: 138, name: "악마의 문장", weaponKind: "booster" },
    { code: 140, name: "젤 샤프란", weaponKind: "ribbon" },
    { code: 142, name: "쥬다스 요요", weaponKind: "yoyo" },
    { code: 144, name: "타이거 아이", weaponKind: "camera-lens" },
    { code: 146, name: "여인의 키스", weaponKind: "claw" },
    { code: 148, name: "더 레이지", weaponKind: "handgun" },
    { code: 150, name: "군터의 팔", weaponKind: "cigar" },
    { code: 152, name: "스노우 화이트", weaponKind: "bottle" },
    { code: 154, name: "멸살지옥검", weaponKind: "sword" },
    { code: 156, name: "발뭉", weaponKind: "greatsword" },
    { code: 158, name: "일반검(더미)", weaponKind: "sword" },
    { code: 159, name: "일반총(더미)", weaponKind: "handgun" },
    { code: 174, name: "인스트럭터", weaponKind: "gun-slicer" },
    { code: 178, name: "실버 EXP", weaponKind: "gun-slicer" },
    { code: 179, name: "실버 QUICK", weaponKind: "gun-slicer" },
    { code: 180, name: "실버 BAL", weaponKind: "gun-slicer" },
    { code: 181, name: "실버 PLUS", weaponKind: "gun-slicer" },
    { code: 182, name: "골드 슬라이서", weaponKind: "gun-slicer" },
    { code: 183, name: "골드 EXP", weaponKind: "gun-slicer" },
    { code: 185, name: "골드 BAL", weaponKind: "gun-slicer" },
    { code: 208, name: "네리사의 마음", weaponKind: "ribbon" },
    { code: 209, name: "레인보우 리본", weaponKind: "ribbon" },
    { code: 212, name: "컴바인 프리즘", weaponKind: "camera-lens" },
    { code: 213, name: "오메가리 플렉터", weaponKind: "camera-lens" },
    { code: 214, name: "베이그 렌즈", weaponKind: "camera-lens" },
    { code: 215, name: "캐츠시저", weaponKind: "claw" },
    { code: 216, name: "이글 네일", weaponKind: "claw" },
    { code: 217, name: "시가 보르도", weaponKind: "cigar" },
    { code: 221, name: "드래곤 스네일", weaponKind: "sword" },
    { code: 226, name: "로프란트 글로리", weaponKind: "sword" },
    { code: 227, name: "가르시아 커스텀", weaponKind: "handgun" },
    
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
    { code: 80, name: "엘린듐 아머" },
    { code: 81, name: "크로슬리 페일러" },
    { code: 82, name: "아크 아머" },
    { code: 161, name: "아크론 아머" },
    { code: 177, name: "바운서" }
  ],
  necklace: [
    { code: 0, name: "없음" },
    { code: 102, name: "그라톡스" },
    { code: 103, name: "천신경" },
    { code: 104, name: "미라쥐" },
    { code: 105, name: "프라임 블레스" },
    { code: 165, name: "천사의 선물" }
  ],
  ring: [
    { code: 0, name: "없음" },
    { code: 96, name: "금반지" },
    { code: 97, name: "루비반지" },
    { code: 98, name: "다이아반지" },
    { code: 99, name: "램버트의 반지" },
    { code: 100, name: "코어반지" }
  ],
  belt: [
    { code: 0, name: "없음" },
    { code: 90, name: "가죽벨트" },
    { code: 91, name: "체인벨트" },
    { code: 92, name: "아이언 벨트" },
    { code: 93, name: "램버트의 벨트" },
    { code: 94, name: "제쿨트 벨트" },
    { code: 163, name: "스톤의 벨트" }
  ],
  shoes: [
    { code: 0, name: "없음" },
    { code: 84, name: "등산화" },
    { code: 85, name: "군화" },
    { code: 86, name: "파워드 슈즈" },
    { code: 87, name: "램버트의 슈즈" },
    { code: 88, name: "라이트닝 슈즈" },
    { code: 162, name: "영자 신발" }
  ]
};

export const INVENTORY_CATALOG: InventoryCatalogItem[] = [
  ...EQUIPMENT_SLOT_DEFINITIONS.flatMap((slot) =>
    EQUIPMENT_OPTIONS[slot.key]
      .filter((option) => option.code !== 0)
      .map((option) => ({
        code: option.code,
        name: option.name,
        category: slot.key as InventoryItemCategory,
        weaponKind: option.weaponKind
      }))
  ),

  { code: 107, name: "프레임쉘1", category: "item" as InventoryItemCategory, consumableKind: "green-liquid" as ConsumableKind },
  { code: 113, name: "썬더아이스1", category: "item" as InventoryItemCategory, consumableKind: "green-liquid" as ConsumableKind },
  { code: 116, name: "배틀포이즌1", category: "item" as InventoryItemCategory, consumableKind: "poison" as ConsumableKind },
  { code: 117, name: "배틀포이즌2", category: "item" as InventoryItemCategory, consumableKind: "poison" as ConsumableKind },
  { code: 118, name: "배틀포이즌3", category: "item" as InventoryItemCategory, consumableKind: "poison" as ConsumableKind },
  { code: 122, name: "로우캡슐", category: "item" as InventoryItemCategory, consumableKind: "potion" as ConsumableKind },
  { code: 123, name: "회복캡슐", category: "item" as InventoryItemCategory, consumableKind: "potion" as ConsumableKind },
  { code: 124, name: "완전회복캡슐", category: "item" as InventoryItemCategory, consumableKind: "potion" as ConsumableKind },
  { code: 125, name: "안정제", category: "item" as InventoryItemCategory, consumableKind: "first-aid" as ConsumableKind },
  { code: 126, name: "여신의 성수", category: "item" as InventoryItemCategory, consumableKind: "potion" as ConsumableKind },
  { code: 167, name: "파멸의 폭염1", category: "item" as InventoryItemCategory, consumableKind: "bomb" as ConsumableKind },
  { code: 168, name: "파멸의 폭염2", category: "item" as InventoryItemCategory, consumableKind: "bomb" as ConsumableKind },
  { code: 169, name: "라이징 스톰", category: "item" as InventoryItemCategory, consumableKind: "bomb" as ConsumableKind },
  { code: 170, name: "애스트로 범", category: "item" as InventoryItemCategory, consumableKind: "bomb" as ConsumableKind },
  { code: 222, name: "미디엄캡슐", category: "item" as InventoryItemCategory, consumableKind: "potion" as ConsumableKind },
  { code: 223, name: "하이캡슐", category: "item" as InventoryItemCategory, consumableKind: "potion" as ConsumableKind },
  { code: 224, name: "빅캡슐", category: "item" as InventoryItemCategory, consumableKind: "potion" as ConsumableKind },
  { code: 225, name: "기프트", category: "item" as InventoryItemCategory, consumableKind: "potion" as ConsumableKind },
  { code: 228, name: "블리자드 캡슐", category: "item" as InventoryItemCategory, consumableKind: "bomb" as ConsumableKind }
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
  { code: 16, name: "레지스탕스1" },
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
  { code: 55, name: "글로리가드1" },
  { code: 56, name: "글로리가드2" },
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
  { code: 77, name: "네트_가이어버그" }
];

const BATTLE_EQUIPMENT_BASE_OFFSETS: Record<number, number> = {
  219: 0x15409,
  222: 0xf827,
  223: 0xfcfc,
  220: 0x15db3,
  221: 0x158de
};

const FIELD_CHARACTER_RECORD_START_OFFSET = 0x0748;
const FIELD_CHARACTER_RECORD_STRIDE = 0x03a4;
const FIELD_CHARACTER_RECORD_COUNT = 25;
const FIELD_CHARACTER_CODE_RELATIVE_OFFSET = 0x0a4;
const FIELD_MERCENARY_RELATIVE_OFFSET = 0x0bc;
const FIELD_EQUIPMENT_RELATIVE_OFFSET = 0x0ec;
const EQUIPMENT_RELATIVE_OFFSET_FROM_CHARACTER = 0x48;
const CHARACTER_NAME_RELATIVE_OFFSET_FROM_EQUIPMENT = -0x46;
const CHARACTER_SECOND_NAME_RELATIVE_OFFSET_FROM_EQUIPMENT = -0x44;
const CHARACTER_VOICE_RELATIVE_OFFSET_FROM_EQUIPMENT = -0x42;
const CHARACTER_BODY_RELATIVE_OFFSET_FROM_EQUIPMENT = -0x40;
const CHARACTER_FACE_RELATIVE_OFFSET_FROM_EQUIPMENT = -0x3e;
const CHARACTER_JOB_RELATIVE_OFFSET_FROM_EQUIPMENT = -0x3c;
const WEAPON_ATTACK_TYPE_RELATIVE_OFFSET_FROM_EQUIPMENT = -0x32;
const WEAPON_PIC_RELATIVE_OFFSET_FROM_EQUIPMENT = -0x04;
const WEAPON_TYPE_RELATIVE_OFFSET_FROM_EQUIPMENT = -0x02;
const BATTLE_MERCENARY_RELATIVE_OFFSET_FROM_CHARACTER = 0x18;
const BATTLE_UNIT_SCAN_START_OFFSET = 0xe000;
const CHARACTER_ABILITY_RELATIVE_OFFSET = 0x77;
const CHARACTER_STAT_DEFINITIONS: Array<{
  key: CharacterStatKey;
  label: string;
  relativeOffset: number;
  battleOnly?: boolean;
  signed?: boolean;
}> = [
  { key: "level", label: "LEVEL", relativeOffset: 0x28 },
  { key: "levelExp", label: "LEVEL EXP", relativeOffset: 0x2a },
  { key: "exp", label: "EXP", relativeOffset: 0x2c },
  { key: "lp", label: "LP / 최대 HP", relativeOffset: 0x30 },
  { key: "hp", label: "현재 HP", relativeOffset: 0x34 },
  { key: "psy", label: "PSY", relativeOffset: 0x38 },
  { key: "tpMax", label: "최대 TP", relativeOffset: 0x3a },
  { key: "stp", label: "STP", relativeOffset: 0x3c },
  { key: "ctp", label: "CTP", relativeOffset: 0x3e },
  { key: "dep", label: "DEP", relativeOffset: 0x40 },
  { key: "dex", label: "DEX", relativeOffset: 0x42 },
  { key: "soulCurrent", label: "현재 SOUL", relativeOffset: 0x3cb, battleOnly: true },
  { key: "tpCurrent", label: "현재 TP", relativeOffset: 0x3cd, battleOnly: true, signed: true }
];
export const ABILITY_OPTIONS: AbilityOption[] = [
  { code: 0, name: "연" },
  { code: 1, name: "파" },
  { code: 2, name: "비" },
  { code: 3, name: "살" },
  { code: 4, name: "혼" },
  { code: 5, name: "폭" },
  { code: 6, name: "광 (사용못함)" },
  { code: 7, name: "오버드라이브" },
  { code: 8, name: "힐" },
  { code: 9, name: "격려" },
  { code: 10, name: "큐어" },
  { code: 11, name: "포스필드" },
  { code: 12, name: "희생" },
  { code: 13, name: "오버플로우" },
  { code: 14, name: "리미트플로우" },
  { code: 15, name: "프레셔" },
  { code: 16, name: "메테오스트라이크" },
  { code: 17, name: "포스리젼" },
  { code: 18, name: "비연참" },
  { code: 19, name: "소닉블레이드" },
  { code: 20, name: "풍아열공참" },
  { code: 21, name: "익스플로젼" },
  { code: 22, name: "헤비프레셔" },
  { code: 26, name: "더블브레이크 (아셀라스)" },
  { code: 27, name: "소울블레스트" },
  { code: 28, name: "엘레멘탈파이어" },
  { code: 29, name: "카운터블레이드" },
  { code: 30, name: "블레이드미사일" },
  { code: 31, name: "사신의 분노" },
  { code: 33, name: "일루션히트" },
  { code: 34, name: "소울스트라이크" },
  { code: 35, name: "마인드어택" },
  { code: 36, name: "하이텔레포트" },
  { code: 37, name: "텔레파시 (사용못함)" },
  { code: 38, name: "쇼크" },
  { code: 39, name: "브레인스톰" },
  { code: 40, name: "배리어" },
  { code: 41, name: "아디지오" },
  { code: 42, name: "프레스토" },
  { code: 43, name: "퍼니피 (사용못함)" },
  { code: 44, name: "리미트크래쉬" },
  { code: 45, name: "리미트캐스트" },
  { code: 46, name: "마인드컨트롤" },
  { code: 47, name: "마인드체인지" },
  { code: 48, name: "파워드배리어" },
  { code: 49, name: "브레인브레이크" },
  { code: 50, name: "일루션컨트럴 (사용못함)" },
  { code: 51, name: "오버테이크" },
  { code: 52, name: "올퍼니피 (사용못함)" },
  { code: 53, name: "익스퍼트웨이브" },
  { code: 54, name: "익스퍼트블레스트" },
  { code: 55, name: "엘레멘탈아이스" },
  { code: 56, name: "엘레멘탈썬더" },
  { code: 57, name: "엘레멘탈라이트" },
  { code: 58, name: "리인카네이션" },
  { code: 59, name: "서몬몬스터" },
  { code: 60, name: "리콜" },
  { code: 61, name: "엘레멘탈실드" },
  { code: 62, name: "엘레멘탈라이트닝 (사용못함)" },
  { code: 63, name: "엘레멘탈다크" },
  { code: 64, name: "하드밸런싱" },
  { code: 65, name: "소프트밸런싱" },
  { code: 66, name: "엘레멘탈베이스" },
  { code: 68, name: "락킹필드" },
  { code: 69, name: "포이즌" },
  { code: 70, name: "기가실드" },
  { code: 71, name: "파이어웨이브" },
  { code: 72, name: "라이트닝샤벨" },
  { code: 73, name: "어스퀘이크" },
  { code: 74, name: "썬더스톰" },
  { code: 75, name: "블리자드" },
  { code: 76, name: "카운터스피어" },
  { code: 77, name: "카운터미사일" },
  { code: 78, name: "아스트럴파이어" },
  { code: 79, name: "엘레멘탈버스터" },
  { code: 80, name: "웨폰크래쉬" },
  { code: 81, name: "에네르기힐 (사용못함)" },
  { code: 82, name: "아스트럴실드" },
  { code: 83, name: "사이킥크로스" },
  { code: 84, name: "캐노피" },
  { code: 85, name: "피드백" },
  { code: 86, name: "아스트럴애로우" },
  { code: 87, name: "아스트럴블레이드" },
  { code: 88, name: "카운터붐" },
  { code: 89, name: "파이널버스터" },
  { code: 90, name: "아스트럴필드" },
  { code: 91, name: "리바이블" },
  { code: 92, name: "와이드힐" },
  { code: 93, name: "크래쉬붐" },
  { code: 94, name: "메테오" },
  { code: 95, name: "다이나믹크래쉬" },
  { code: 96, name: "커스" },
  { code: 97, name: "카운터실드" },
  { code: 98, name: "워큰드아머" },
  { code: 99, name: "파워드아머" },
  { code: 100, name: "파워다운" },
  { code: 101, name: "파워업" },
  { code: 102, name: "스피드업" },
  { code: 103, name: "스피드다운" },
  { code: 104, name: "페스트렉" },
  { code: 105, name: "카피렉" },
  { code: 106, name: "블라인드" },
  { code: 107, name: "안티벨런싱" },
  { code: 108, name: "코메트 (사용못함)" },
  { code: 109, name: "그라비티필드" },
  { code: 110, name: "그라비티벨런스" },
  { code: 111, name: "블레이드샤워" },
  { code: 112, name: "카운터필드" },
  { code: 113, name: "언벨런싱 (사용못함)" },
  { code: 114, name: "블랙홀" },
  { code: 115, name: "미라클" },
  { code: 116, name: "워핑" },
  { code: 117, name: "방어" },
  { code: 118, name: "회피" },
  { code: 121, name: "오메가스윙" },
  { code: 122, name: "공폭탄" },
  { code: 123, name: "헬카이트" },
  { code: 124, name: "Hunter (사용못함)" },
  { code: 125, name: "크레이지 샷 (크리스티앙)" },
  { code: 126, name: "진 풍아열공참 (죠안)" },
  { code: 127, name: "초능력공격" },
  { code: 138, name: "나인크루세이더 (디에네)" },
  { code: 139, name: "다크스크림 (마리아)" },
  { code: 140, name: "리커버리" },
  { code: 141, name: "리제너레이션" },
  { code: 142, name: "엘레멘탈힐" },
  { code: 143, name: "힐윈드" },
  { code: 144, name: "사이킥 드라이브" },
  { code: 145, name: "셰틀라이트 어택" },
  { code: 146, name: "버닝웜" },
  { code: 147, name: "타이타니아 슈발츠" },
  { code: 148, name: "코메트" },
  { code: 149, name: "페이온 스피리츠 (리엔)" },
  { code: 150, name: "무신멸뢰옥 (유진)" },
  { code: 151, name: "LP 증가" },
  { code: 154, name: "SOUL 증가" },
  { code: 155, name: "DEP 증가" },
  { code: 156, name: "TP 증가" },
  { code: 157, name: "PSY 증가" },
  { code: 158, name: "인페르노" },
  { code: 159, name: "폭주 (베라모드)" },
  { code: 160, name: "이스케이프" },
  { code: 161, name: "레이져공격 (사용못함)" },
  { code: 162, name: "천지파열무 (살라딘)" },
  { code: 163, name: "진무 천지파열 (살라딘)" },
  { code: 164, name: "아수라파천무 (베라모드, 살라딘)" },
  { code: 165, name: "빅뱅 (리챠드)" },
  { code: 166, name: "밍밍 스페셜 (네리사)" },
  { code: 167, name: "선 블래스트 (란)" },
  { code: 168, name: "데스포토그래프 (루시엔)" },
  { code: 169, name: "폭풍검 (샤크바리)" },
  { code: 170, name: "이데아캐논 (살라딘)" },
  { code: 171, name: "헬레이져" },
  { code: 172, name: "아이템_테스트 (사용못함)" },
  { code: 173, name: "영혼의집중" },
  { code: 174, name: "소울스트림" },
  { code: 175, name: "대검연마법" },
  { code: 176, name: "광마육혈포" },
  { code: 177, name: "반사광증폭" },
  { code: 178, name: "구룡금나수" },
  { code: 179, name: "발키리의혼" },
  { code: 180, name: "루나무음보법" },
  { code: 181, name: "기자근성" },
  { code: 182, name: "밍밍조련술" },
  { code: 183, name: "머독폭파술" },
  { code: 184, name: "화령제렴술" },
  { code: 185, name: "템페스트" },
  { code: 186, name: "회색의 잔영" },
  { code: 187, name: "강림의 밤" },
  { code: 188, name: "서풍의 광시곡" },
  { code: 189, name: "레드 크로스" },
  { code: 190, name: "아지다하카 전술 Mk-II" },
  { code: 191, name: "월광의 살육" },
  { code: 192, name: "블랙 이클립스" }
];
const FIELD_CHARACTER_RECORD_INDICES: Record<number, number> = {
  236: 0,
  237: 1,
  427: 2,
  238: 3,
  222: 4,
  240: 5,
  246: 6,
  484: 7,
  398: 8,
  241: 9,
  242: 10,
  243: 11,
  223: 12,
  247: 13,
  244: 14,
  219: 15,
  245: 16,
  221: 17,
  220: 18,
  563: 19,
  38: 20,
  56: 21,
  57: 22,
  64: 23,
  36: 24
};

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
    type: readSaveType(data),
    episode: readSaveEpisode(data),
    checksum: {
      stored: storedChecksum,
      calculated: calculatedChecksum,
      ok: storedChecksum === calculatedChecksum
    },
    money: {
      field: {
        episode4: readMoney(data, "field", "episode4"),
        episode5: readMoney(data, "field", "episode5")
      },
      battle: {
        episode4: readMoney(data, "battle", "episode4"),
        episode5: readMoney(data, "battle", "episode5")
      }
    },
    inventory: {
      field: readInventory(data, "field"),
      battle: readInventory(data, "battle")
    },
    inventorySlots: {
      field: {
        episode4: readInventorySlots(data, "field", "episode4"),
        episode5: readInventorySlots(data, "field", "episode5")
      },
      battle: {
        episode4: readInventorySlots(data, "battle", "episode4"),
        episode5: readInventorySlots(data, "battle", "episode5")
      }
    },
    parties: {
      episode4: readParty(data, "episode4"),
      episode5: readParty(data, "episode5")
    },
    equipment: {
      field: readEquipment(data, "field"),
      battle: readEquipment(data, "battle")
    },
    mercenaries: {
      field: readMercenaries(data, "field"),
      battle: readMercenaries(data, "battle")
    },
    stats: {
      field: readCharacterStatsList(data, "field"),
      battle: readCharacterStatsList(data, "battle")
    },
    abilities: {
      field: readCharacterAbilitiesList(data, "field"),
      battle: readCharacterAbilitiesList(data, "battle")
    }
  };
}

export function applyMoney(data: Uint8Array, scope: SaveDataScope, episode: EpisodeKey, value: number): void {
  const target = getMoneyTarget(data, scope, episode);
  if (!target) {
    return;
  }
  writeInverseUint32(data, target.offset, value);
}

export function applyParty(data: Uint8Array, episode: EpisodeKey, codes: number[]): void {
  if (codes.length > PARTY_MEMBER_LIMIT) {
    throw new Error(`파티는 최대 ${PARTY_MEMBER_LIMIT}명까지 저장합니다.`);
  }

  const target = PARTY_OFFSETS[episode];
  writeInverseUint32(data, target.offset, codes.length);

  for (let index = 0; index < codes.length; index += 1) {
    writeInverseUint32(data, target.offset + 4 + index * 4, codes[index]);
  }

  for (let index = codes.length; index < PARTY_MEMBER_LIMIT; index += 1) {
    writeInverseUint32(data, target.offset + 4 + index * 4, 0);
  }
}

export function applySaveEdits(data: Uint8Array, edits: SaveEditRequest): void {
  applyMoney(data, "field", "episode4", edits.money.field.episode4);
  applyMoney(data, "field", "episode5", edits.money.field.episode5);
  applyMoney(data, "battle", "episode4", edits.money.battle.episode4);
  applyMoney(data, "battle", "episode5", edits.money.battle.episode5);
  applyInventoryEdits(data, edits.inventory ?? {});
  applyInventorySlotEdits(data, edits.inventorySlots ?? {});
  applyParty(data, "episode4", edits.parties.episode4);
  applyParty(data, "episode5", edits.parties.episode5);
  applyEquipmentEdits(data, edits.equipment ?? []);
  applyMercenaryEdits(data, edits.mercenaries ?? []);
  applyCharacterStatsEdits(data, edits.stats ?? []);
  applyCharacterAbilitiesEdits(data, edits.abilities ?? []);
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

function readSaveType(data: Uint8Array): SaveInfo["type"] {
  const code = readInverseUint32(data, 0x0c);
  return {
    code,
    label: getSaveTypeLabel(code),
    sceneId: readInverseUint32(data, 0x08)
  };
}

function readSaveEpisode(data: Uint8Array): SaveInfo["episode"] {
  return { label: getSaveEpisodeLabel(data) };
}

function getSaveEpisodeLabel(data: Uint8Array): SaveEpisodeLabel {
  if (readInverseUint32(data, 0x0c) === 1) {
    if (hasPlausibleInventoryCount(data, BATTLE_INVENTORY_TABLES.episode4)) {
      return "에피소드4";
    }
    if (hasPlausibleInventoryCount(data, BATTLE_INVENTORY_TABLES.episode5)) {
      return "에피소드5";
    }
  }

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

function getSaveTypeLabel(code: number): SaveTypeLabel {
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

function getEpisodeLabel(episode: EpisodeKey): string {
  return episode === "episode5" ? "에피소드5" : "에피소드4";
}

function getMoneyTarget(
  data: Uint8Array,
  scope: SaveDataScope,
  episode: EpisodeKey
): { label: string; offset: number } | null {
  if (scope === "field") {
    return MONEY_OFFSETS[episode];
  }

  const table = getInventoryTable(data, scope, episode);
  if (!table) {
    return null;
  }

  return {
    label: `${getEpisodeLabel(episode)} / 전투`,
    offset: table.countOffset + 4
  };
}

function getInventoryTable(data: Uint8Array, scope: SaveDataScope, episode: EpisodeKey): InventoryTable | null {
  if (scope === "field") {
    return isInventoryTableInRange(data, INVENTORY_TABLES[episode]) ? INVENTORY_TABLES[episode] : null;
  }

  if (readInverseUint32(data, 0x0c) !== 1) {
    return null;
  }

  const activeEpisode = getActiveEpisodeKey(data);
  if (episode === "episode4" && activeEpisode !== "episode4") {
    return null;
  }

  const table =
    episode === "episode4"
      ? BATTLE_INVENTORY_TABLES.episode4
      : activeEpisode === "episode5"
        ? BATTLE_INVENTORY_TABLES.episode5
        : BATTLE_INVENTORY_TABLES.episode5InEpisode4Battle;
  return isInventoryTableInRange(data, table) ? table : null;
}

function isInventoryTableInRange(data: Uint8Array, table: InventoryTable): boolean {
  return table.countOffset + 4 <= data.length && table.startOffset <= data.length;
}

function hasPlausibleInventoryCount(data: Uint8Array, table: InventoryTable): boolean {
  if (!isInventoryTableInRange(data, table)) {
    return false;
  }

  const count = readInverseUint32(data, table.countOffset);
  return count > 0 && count <= getInventoryWritableLimit(data, table);
}

function readMoney(data: Uint8Array, scope: SaveDataScope, episode: EpisodeKey): MoneyInfo {
  const target = getMoneyTarget(data, scope, episode);
  if (!target) {
    return {
      label: `${getEpisodeLabel(episode)} / 전투`,
      offset: 0,
      value: 0,
      raw: "",
      supported: false
    };
  }

  return {
    label: target.label,
    offset: target.offset,
    value: readInverseUint32(data, target.offset),
    raw: readRawHex(data, target.offset, 4),
    supported: true
  };
}

function readInventory(data: Uint8Array, scope: SaveDataScope): Record<EpisodeKey, Record<InventoryItemKey, InventoryItemInfo>> {
  return {
    episode4: {
      lowCapsule: readInventoryItem(data, scope, "episode4", "lowCapsule"),
      fullRecoveryCapsule: readInventoryItem(data, scope, "episode4", "fullRecoveryCapsule"),
      recoveryCapsule: readInventoryItem(data, scope, "episode4", "recoveryCapsule"),
      stabilizer: readInventoryItem(data, scope, "episode4", "stabilizer"),
      goddessHolyWater: readInventoryItem(data, scope, "episode4", "goddessHolyWater"),
      mediumCapsule: readInventoryItem(data, scope, "episode4", "mediumCapsule"),
      highCapsule: readInventoryItem(data, scope, "episode4", "highCapsule"),
      bigCapsule: readInventoryItem(data, scope, "episode4", "bigCapsule"),
      gift: readInventoryItem(data, scope, "episode4", "gift")
    },
    episode5: {
      lowCapsule: readInventoryItem(data, scope, "episode5", "lowCapsule"),
      fullRecoveryCapsule: readInventoryItem(data, scope, "episode5", "fullRecoveryCapsule"),
      recoveryCapsule: readInventoryItem(data, scope, "episode5", "recoveryCapsule"),
      stabilizer: readInventoryItem(data, scope, "episode5", "stabilizer"),
      goddessHolyWater: readInventoryItem(data, scope, "episode5", "goddessHolyWater"),
      mediumCapsule: readInventoryItem(data, scope, "episode5", "mediumCapsule"),
      highCapsule: readInventoryItem(data, scope, "episode5", "highCapsule"),
      bigCapsule: readInventoryItem(data, scope, "episode5", "bigCapsule"),
      gift: readInventoryItem(data, scope, "episode5", "gift")
    }
  };
}

function readInventorySlots(data: Uint8Array, scope: SaveDataScope, episode: EpisodeKey): InventorySlotInfo[] {
  const table = getInventoryTable(data, scope, episode);
  if (!table) {
    return [];
  }

  const count = getInventoryReadableCount(data, table);
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

function readInventoryItem(data: Uint8Array, scope: SaveDataScope, episode: EpisodeKey, key: InventoryItemKey): InventoryItemInfo {
  const item = INVENTORY_ITEM_DEFINITIONS[key];
  const slot = findInventorySlot(data, scope, episode, item.itemCode);
  const supported = Boolean(getInventoryTable(data, scope, episode));
  if (slot === null) {
    return {
      key,
      name: item.name,
      itemCode: item.itemCode,
      codeOffset: 0,
      quantityOffset: 0,
      value: 0,
      raw: "",
      supported
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

function applyInventorySlotEdits(
  data: Uint8Array,
  edits: Partial<Record<SaveDataScope, Partial<Record<EpisodeKey, InventorySlotEdit[]>>>>
): void {
  for (const [scope, scopeEdits] of Object.entries(edits) as Array<
    [SaveDataScope, Partial<Record<EpisodeKey, InventorySlotEdit[]>> | undefined]
  >) {
    if (!scopeEdits) {
      continue;
    }

    for (const [episode, episodeEdits] of Object.entries(scopeEdits) as Array<
      [EpisodeKey, InventorySlotEdit[] | undefined]
    >) {
      if (!episodeEdits) {
        continue;
      }

      const table = getInventoryTable(data, scope, episode);
      if (!table) {
        continue;
      }

      const normalized = episodeEdits.filter((item) => item.quantity > 0);
      const slotLimit = getInventoryWritableLimit(data, table);
      if (normalized.length > slotLimit) {
        throw new Error("인벤토리 데이터가 세이브 파일 범위를 벗어납니다.");
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
}

function applyInventoryEdits(
  data: Uint8Array,
  edits: Partial<Record<SaveDataScope, Partial<Record<EpisodeKey, Partial<Record<InventoryItemKey, number>>>>>>
): void {
  for (const [scope, scopeEdits] of Object.entries(edits) as Array<
    [SaveDataScope, Partial<Record<EpisodeKey, Partial<Record<InventoryItemKey, number>>>> | undefined]
  >) {
    if (!scopeEdits) {
      continue;
    }

    for (const [episode, episodeEdits] of Object.entries(scopeEdits) as Array<
      [EpisodeKey, Partial<Record<InventoryItemKey, number>> | undefined]
    >) {
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
        const existingSlot = findInventorySlot(data, scope, episode, item.itemCode);
        const slot = existingSlot ?? findReusableInventorySlot(data, scope, episode);
        if (slot === null) {
          continue;
        }
        writeInverseUint32(data, slot.codeOffset, item.itemCode);
        writeInverseUint32(data, slot.quantityOffset, value);
        if (existingSlot === null && value > 0) {
          updateInventoryCount(data, scope, episode, slot.index + 1);
        }
      }
    }
  }
}

export function getInventoryCatalogItem(itemCode: number): InventoryCatalogItem | undefined {
  return INVENTORY_CATALOG.find((item) => item.code === itemCode);
}

function findInventorySlot(
  data: Uint8Array,
  scope: SaveDataScope,
  episode: EpisodeKey,
  itemCode: number
): { index: number; codeOffset: number; quantityOffset: number } | null {
  const table = getInventoryTable(data, scope, episode);
  if (!table) {
    return null;
  }
  const scanCount = getInventoryReadableCount(data, table);

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
  scope: SaveDataScope,
  episode: EpisodeKey
): { index: number; codeOffset: number; quantityOffset: number } | null {
  const table = getInventoryTable(data, scope, episode);
  if (!table) {
    return null;
  }

  const currentCount = getInventoryReadableCount(data, table);
  const slotLimit = getInventoryWritableLimit(data, table);
  if (currentCount >= slotLimit) {
    return null;
  }

  const codeOffset = table.startOffset + currentCount * 8;
  const quantityOffset = codeOffset + 4;
  if (quantityOffset + 4 > data.length) {
    return null;
  }

  return { index: currentCount, codeOffset, quantityOffset };
}

function getInventoryReadableCount(data: Uint8Array, table: InventoryTable): number {
  const rawCount = readInverseUint32(data, table.countOffset);
  return Math.min(rawCount, getInventoryWritableLimit(data, table));
}

function getInventoryWritableLimit(data: Uint8Array, table: InventoryTable): number {
  return Math.max(0, Math.floor((data.length - table.startOffset) / 8));
}

function updateInventoryCount(data: Uint8Array, scope: SaveDataScope, episode: EpisodeKey, minimumCount: number): void {
  const table = getInventoryTable(data, scope, episode);
  if (!table) {
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
  const safeCount = Math.min(count, PARTY_MEMBER_LIMIT);
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
  if (scope === "field") {
    return readFieldCharacterCodes(data).map((characterCode) => readCharacterEquipment(data, characterCode, scope));
  }

  const battleCharacterCodes = readBattleCharacterCodes(data);
  if (battleCharacterCodes.length > 0) {
    return battleCharacterCodes.map((characterCode) => readCharacterEquipment(data, characterCode, scope));
  }

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
    face: readCharacterWeaponDetail(data, baseOffset + CHARACTER_FACE_RELATIVE_OFFSET_FROM_EQUIPMENT),
    name: readCharacterWeaponDetail(data, baseOffset + CHARACTER_NAME_RELATIVE_OFFSET_FROM_EQUIPMENT),
    job: readCharacterWeaponDetail(data, baseOffset + CHARACTER_JOB_RELATIVE_OFFSET_FROM_EQUIPMENT),
    voice: readCharacterWeaponDetail(data, baseOffset + CHARACTER_VOICE_RELATIVE_OFFSET_FROM_EQUIPMENT),
    body: readCharacterWeaponDetail(data, baseOffset + CHARACTER_BODY_RELATIVE_OFFSET_FROM_EQUIPMENT),
    weaponAttackType: readCharacterWeaponDetail(data, baseOffset + WEAPON_ATTACK_TYPE_RELATIVE_OFFSET_FROM_EQUIPMENT),
    weaponPicType: readCharacterWeaponDetail(data, baseOffset + WEAPON_PIC_RELATIVE_OFFSET_FROM_EQUIPMENT),
    weaponType: readCharacterWeaponDetail(data, baseOffset + WEAPON_TYPE_RELATIVE_OFFSET_FROM_EQUIPMENT),
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

    if (typeof edit.face === "number") {
      writeInverseUint16(data, baseOffset + CHARACTER_FACE_RELATIVE_OFFSET_FROM_EQUIPMENT, edit.face);
    }
    if (typeof edit.name === "number") {
      writeInverseUint16(data, baseOffset + CHARACTER_NAME_RELATIVE_OFFSET_FROM_EQUIPMENT, edit.name);
      writeInverseUint16(data, baseOffset + CHARACTER_SECOND_NAME_RELATIVE_OFFSET_FROM_EQUIPMENT, edit.name);
    }
    if (typeof edit.job === "number") {
      writeInverseUint16(data, baseOffset + CHARACTER_JOB_RELATIVE_OFFSET_FROM_EQUIPMENT, edit.job);
    }
    if (typeof edit.voice === "number") {
      writeInverseUint16(data, baseOffset + CHARACTER_VOICE_RELATIVE_OFFSET_FROM_EQUIPMENT, edit.voice);
    }
    if (typeof edit.body === "number") {
      writeInverseUint16(data, baseOffset + CHARACTER_BODY_RELATIVE_OFFSET_FROM_EQUIPMENT, edit.body);
    }
    if (typeof edit.weaponAttackType === "number") {
      writeInverseUint16(data, baseOffset + WEAPON_ATTACK_TYPE_RELATIVE_OFFSET_FROM_EQUIPMENT, edit.weaponAttackType);
    }
    if (typeof edit.weaponPicType === "number") {
      writeInverseUint16(data, baseOffset + WEAPON_PIC_RELATIVE_OFFSET_FROM_EQUIPMENT, edit.weaponPicType);
    }
    if (typeof edit.weaponType === "number") {
      writeInverseUint16(data, baseOffset + WEAPON_TYPE_RELATIVE_OFFSET_FROM_EQUIPMENT, edit.weaponType);
    }

    for (const slot of EQUIPMENT_SLOT_DEFINITIONS) {
      writeInverseUint16(data, baseOffset + slot.relativeOffset, edit.slots[slot.key] ?? 0);
    }
  }
}

function readCharacterWeaponDetail(data: Uint8Array, offset: number): CharacterWeaponDetailInfo | undefined {
  if (offset < 0 || offset + 2 > data.length) {
    return undefined;
  }

  return {
    offset,
    value: readInverseUint16(data, offset),
    raw: readRawHex(data, offset, 2)
  };
}

function getEquipmentBaseOffset(data: Uint8Array, characterCode: number, scope: EquipmentScope): number | null {
  const locationCode = readInverseUint32(data, 0x0c);

  if (scope === "field") {
    return getFieldEquipmentBaseOffset(data, characterCode);
  }

  if (scope === "battle" && locationCode !== 1) {
    return null;
  }

  const baseOffset = BATTLE_EQUIPMENT_BASE_OFFSETS[characterCode];

  if (
    typeof baseOffset === "number" &&
    baseOffset + 12 <= data.length &&
    baseOffset >= EQUIPMENT_RELATIVE_OFFSET_FROM_CHARACTER &&
    readInverseUint16(data, baseOffset - EQUIPMENT_RELATIVE_OFFSET_FROM_CHARACTER) === characterCode &&
    looksLikeEquipmentBlock(data, baseOffset)
  ) {
    return baseOffset;
  }

  return findCharacterEquipmentBaseOffset(data, characterCode, scope === "battle");
}

function getFieldEquipmentBaseOffset(data: Uint8Array, characterCode: number): number | null {
  const recordBaseOffset = findFieldCharacterRecordBaseOffset(data, characterCode);
  if (recordBaseOffset === null) {
    return null;
  }

  const equipmentOffset = recordBaseOffset + FIELD_EQUIPMENT_RELATIVE_OFFSET;
  if (equipmentOffset + 12 > data.length || !looksLikeEquipmentBlock(data, equipmentOffset)) {
    return null;
  }

  return equipmentOffset;
}

function findFieldCharacterRecordBaseOffset(data: Uint8Array, characterCode: number): number | null {
  const index = FIELD_CHARACTER_RECORD_INDICES[characterCode];
  if (typeof index !== "number") {
    return null;
  }

  const recordBaseOffset = FIELD_CHARACTER_RECORD_START_OFFSET + index * FIELD_CHARACTER_RECORD_STRIDE;
  const codeOffset = recordBaseOffset + FIELD_CHARACTER_CODE_RELATIVE_OFFSET;
  if (codeOffset + 2 > data.length || readInverseUint16(data, codeOffset) !== characterCode) {
    return null;
  }

  return recordBaseOffset;
}

function readFieldCharacterCodes(data: Uint8Array): number[] {
  return Object.entries(FIELD_CHARACTER_RECORD_INDICES)
    .map(([characterCode, index]) => ({ characterCode: Number(characterCode), index }))
    .sort((a, b) => a.index - b.index)
    .filter(({ characterCode, index }) => {
      if (index < 0 || index >= FIELD_CHARACTER_RECORD_COUNT) {
        return false;
      }
      const recordBaseOffset = FIELD_CHARACTER_RECORD_START_OFFSET + index * FIELD_CHARACTER_RECORD_STRIDE;
      const codeOffset = recordBaseOffset + FIELD_CHARACTER_CODE_RELATIVE_OFFSET;
      return codeOffset + 2 <= data.length && readInverseUint16(data, codeOffset) === characterCode;
    })
    .map(({ characterCode }) => characterCode);
}

function readBattleCharacterCodes(data: Uint8Array): number[] {
  if (readInverseUint32(data, 0x0c) !== 1) {
    return [];
  }

  const result: number[] = [];
  const seen = new Set<number>();
  const startOffset = Math.min(BATTLE_UNIT_SCAN_START_OFFSET, data.length);
  for (let offset = startOffset; offset + EQUIPMENT_RELATIVE_OFFSET_FROM_CHARACTER + 12 <= data.length; offset += 1) {
    const characterCode = readInverseUint16(data, offset);
    if (!CHARACTER_NAMES.has(characterCode) || seen.has(characterCode)) {
      continue;
    }

    const equipmentOffset = offset + EQUIPMENT_RELATIVE_OFFSET_FROM_CHARACTER;
    if (!isPlausibleBattleEquipmentBlock(data, equipmentOffset)) {
      continue;
    }

    seen.add(characterCode);
    result.push(characterCode);
  }

  return result;
}

function findCharacterEquipmentBaseOffset(data: Uint8Array, characterCode: number, preferLast: boolean): number | null {
  let fallbackOffset: number | null = null;

  for (let offset = 0; offset + 2 <= data.length; offset += 1) {
    if (readInverseUint16(data, offset) !== characterCode) {
      continue;
    }

    const equipmentOffset = offset + EQUIPMENT_RELATIVE_OFFSET_FROM_CHARACTER;
    if (
      equipmentOffset + 12 > data.length ||
      !(preferLast ? isPlausibleBattleEquipmentBlock(data, equipmentOffset) : looksLikeEquipmentBlock(data, equipmentOffset))
    ) {
      continue;
    }

    if (!preferLast) {
      return equipmentOffset;
    }
    fallbackOffset = equipmentOffset;
  }

  return fallbackOffset;
}

function looksLikeEquipmentBlock(data: Uint8Array, offset: number): boolean {
  return EQUIPMENT_SLOT_DEFINITIONS.every((slot) => {
    const value = readInverseUint16(data, offset + slot.relativeOffset);
    return value >= 0 && value <= 1000;
  });
}

function isPlausibleBattleEquipmentBlock(data: Uint8Array, offset: number): boolean {
  if (!looksLikeEquipmentBlock(data, offset)) {
    return false;
  }
  if (!looksLikeKnownEquipmentBlock(data, offset)) {
    return false;
  }

  const weaponAttackTypeOffset = offset + WEAPON_ATTACK_TYPE_RELATIVE_OFFSET_FROM_EQUIPMENT;
  if (weaponAttackTypeOffset < 0 || weaponAttackTypeOffset + 2 > data.length) {
    return false;
  }

  const weaponAttackType = readInverseUint16(data, weaponAttackTypeOffset);
  if (weaponAttackType !== 1 && weaponAttackType !== 6 && weaponAttackType !== 1479) {
    return false;
  }

  return EQUIPMENT_SLOT_DEFINITIONS.some((slot) => readInverseUint16(data, offset + slot.relativeOffset) !== 0);
}

function looksLikeKnownEquipmentBlock(data: Uint8Array, offset: number): boolean {
  return EQUIPMENT_SLOT_DEFINITIONS.every((slot) => {
    const value = readInverseUint16(data, offset + slot.relativeOffset);
    return value === 0 || EQUIPMENT_OPTIONS[slot.key].some((option) => option.code === value);
  });
}

function readMercenaries(data: Uint8Array, scope: EquipmentScope): CharacterMercenaryInfo[] {
  if (scope === "field") {
    return readFieldCharacterCodes(data).map((characterCode) => readCharacterMercenary(data, characterCode, scope));
  }

  const locationCode = readInverseUint32(data, 0x0c);
  if (locationCode !== 1) {
    return [];
  }

  const battleCharacterCodes = readBattleCharacterCodes(data);
  if (battleCharacterCodes.length > 0) {
    return battleCharacterCodes.map((characterCode) => readCharacterMercenary(data, characterCode, scope));
  }

  const activeParty = readParty(data, getActiveEpisodeKey(data));
  return activeParty.members.map((member) => readCharacterMercenary(data, member.code, scope));
}

function readCharacterMercenary(data: Uint8Array, characterCode: number, scope: EquipmentScope): CharacterMercenaryInfo {
  const characterName = CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`;
  const offset = getMercenaryOffset(data, characterCode, scope);
  const byteLength = scope === "field" ? 4 : 2;

  if (offset === null || offset + byteLength > data.length) {
    return {
      characterCode,
      characterName,
      scope,
      supported: false,
      note: isArenaCharacterName(characterName)
        ? "아레나 캐릭터의 정보는 세이브 파일에 기록되지 않습니다."
        : "아직 군단 위치가 확인되지 않은 캐릭터입니다."
    };
  }

  return {
    characterCode,
    characterName,
    scope,
    supported: true,
    offset,
    value: scope === "field" ? readInverseUint32(data, offset) : readInverseUint16(data, offset),
    raw: readRawHex(data, offset, byteLength)
  };
}

function applyMercenaryEdits(data: Uint8Array, edits: CharacterMercenaryEdit[]): void {
  for (const edit of edits) {
    const offset = getMercenaryOffset(data, edit.characterCode, edit.scope);
    const byteLength = edit.scope === "field" ? 4 : 2;
    if (offset === null || offset + byteLength > data.length) {
      continue;
    }
    if (edit.scope === "field") {
      writeInverseUint32(data, offset, edit.value);
    } else {
      writeInverseUint16(data, offset, edit.value);
    }
  }
}

function getMercenaryOffset(data: Uint8Array, characterCode: number, scope: EquipmentScope): number | null {
  if (scope === "battle") {
    const equipmentOffset = getEquipmentBaseOffset(data, characterCode, "battle");
    if (equipmentOffset === null) {
      return null;
    }
    const mercenaryOffset =
      equipmentOffset - EQUIPMENT_RELATIVE_OFFSET_FROM_CHARACTER + BATTLE_MERCENARY_RELATIVE_OFFSET_FROM_CHARACTER;
    return mercenaryOffset + 2 <= data.length ? mercenaryOffset : null;
  }

  const recordBaseOffset = findFieldCharacterRecordBaseOffset(data, characterCode);
  if (recordBaseOffset === null) {
    return null;
  }

  const mercenaryOffset = recordBaseOffset + FIELD_MERCENARY_RELATIVE_OFFSET;
  return mercenaryOffset + 4 <= data.length ? mercenaryOffset : null;
}

function readCharacterAbilitiesList(data: Uint8Array, scope: EquipmentScope): CharacterAbilitiesInfo[] {
  if (scope === "field") {
    return readFieldCharacterCodes(data).map((characterCode) => readCharacterAbilities(data, characterCode, scope));
  }

  const locationCode = readInverseUint32(data, 0x0c);
  if (locationCode !== 1) {
    return [];
  }

  const battleCharacterCodes = readBattleCharacterCodes(data);
  if (battleCharacterCodes.length > 0) {
    return battleCharacterCodes.map((characterCode) => readCharacterAbilities(data, characterCode, scope));
  }

  const activeParty = readParty(data, getActiveEpisodeKey(data));
  return activeParty.members.map((member) => readCharacterAbilities(data, member.code, scope));
}

function readCharacterAbilities(data: Uint8Array, characterCode: number, scope: EquipmentScope): CharacterAbilitiesInfo {
  const characterName = CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`;
  const baseOffset = getCharacterDataBaseOffset(data, characterCode, scope);

  if (baseOffset === null) {
    return {
      characterCode,
      characterName,
      scope,
      supported: false,
      note:
        scope === "battle"
          ? "전투 어빌리티 위치가 확인되지 않았거나 전투 세이브가 아닙니다."
          : "아직 어빌리티 위치가 확인되지 않은 캐릭터입니다.",
      abilities: []
    };
  }

  const abilityBaseOffset = baseOffset + CHARACTER_ABILITY_RELATIVE_OFFSET;
  const knownAbilityCodes = new Set(ABILITY_OPTIONS.map((ability) => ability.code));
  const unknownStoredAbilities: AbilityOption[] = [];

  for (let code = 0; code <= 0xff; code += 1) {
    const offset = abilityBaseOffset + code;
    if (offset >= data.length) {
      break;
    }
    if (!knownAbilityCodes.has(code) && data[offset] !== 0xff) {
      unknownStoredAbilities.push({ code, name: `알 수 없음 (${code})` });
    }
  }

  const abilityOptions = [...ABILITY_OPTIONS, ...unknownStoredAbilities].sort((a, b) => a.code - b.code);
  return {
    characterCode,
    characterName,
    scope,
    supported: true,
    abilities: abilityOptions.filter((ability) => abilityBaseOffset + ability.code < data.length).map((ability) => {
      const offset = abilityBaseOffset + ability.code;
      const raw = data[offset];
      return {
        ...ability,
        offset,
        value: raw === 0xff ? 0xff : 0xff - raw,
        raw: raw.toString(16).padStart(2, "0").toUpperCase()
      };
    })
  };
}

function applyCharacterAbilitiesEdits(data: Uint8Array, edits: CharacterAbilitiesEdit[]): void {
  for (const edit of edits) {
    const baseOffset = getCharacterDataBaseOffset(data, edit.characterCode, edit.scope);
    if (baseOffset === null) {
      continue;
    }

    const abilityBaseOffset = baseOffset + CHARACTER_ABILITY_RELATIVE_OFFSET;
    for (const [codeText, value] of Object.entries(edit.values)) {
      const code = Number(codeText);
      const offset = abilityBaseOffset + code;
      if (!Number.isInteger(code) || offset < 0 || offset >= data.length) {
        continue;
      }
      writeAbilityValue(data, offset, value);
    }
  }
}

function writeAbilityValue(data: Uint8Array, offset: number, value: number): void {
  if (!Number.isInteger(value) || !((value >= 1 && value <= 20) || value === 0xff)) {
    throw new Error("어빌리티 값은 1~20 또는 255여야 합니다.");
  }
  data[offset] = value === 0xff ? 0xff : 0xff - value;
}

function readCharacterStatsList(data: Uint8Array, scope: EquipmentScope): CharacterStatsInfo[] {
  if (scope === "field") {
    return readFieldCharacterCodes(data).map((characterCode) => readCharacterStats(data, characterCode, scope));
  }

  const locationCode = readInverseUint32(data, 0x0c);
  if (locationCode !== 1) {
    return [];
  }

  const battleCharacterCodes = readBattleCharacterCodes(data);
  if (battleCharacterCodes.length > 0) {
    return battleCharacterCodes.map((characterCode) => readCharacterStats(data, characterCode, scope));
  }

  const activeParty = readParty(data, getActiveEpisodeKey(data));
  return activeParty.members.map((member) => readCharacterStats(data, member.code, scope));
}

function readCharacterStats(data: Uint8Array, characterCode: number, scope: EquipmentScope): CharacterStatsInfo {
  const characterName = CHARACTER_NAMES.get(characterCode) ?? `알 수 없음 (${characterCode})`;
  const baseOffset = getCharacterStatsBaseOffset(data, characterCode, scope);

  if (baseOffset === null) {
    return {
      characterCode,
      characterName,
      scope,
      supported: false,
      note:
        scope === "battle"
          ? "전투 스탯 위치가 확인되지 않았거나 전투 세이브가 아닙니다."
          : "아직 스탯 위치가 확인되지 않은 캐릭터입니다.",
      fields: buildUnsupportedStatFields(scope)
    };
  }

  return {
    characterCode,
    characterName,
    scope,
    supported: true,
    fields: CHARACTER_STAT_DEFINITIONS.map((field) => {
      if (field.battleOnly && scope === "field") {
        return {
          key: field.key,
          label: field.label,
          editable: false,
          note: "전투 데이터에서만 확인된 항목입니다."
        };
      }

      const offset = baseOffset + field.relativeOffset;
      const inRange = offset >= 0 && offset + 2 <= data.length;
      const value = inRange ? readInverseUint16(data, offset) : undefined;
      return {
        key: field.key,
        label: field.label,
        offset: inRange ? offset : undefined,
        value: typeof value === "number" && field.signed ? toSignedUint16(value) : value,
        raw: inRange ? readRawHex(data, offset, 2) : undefined,
        editable: inRange,
        note: inRange ? undefined : "오프셋이 세이브 파일 범위를 벗어납니다."
      };
    })
  };
}

function buildUnsupportedStatFields(scope: EquipmentScope): CharacterStatFieldInfo[] {
  return CHARACTER_STAT_DEFINITIONS.map((field) => ({
    key: field.key,
    label: field.label,
    editable: false,
    note: field.battleOnly && scope === "field" ? "전투 데이터에서만 확인된 항목입니다." : undefined
  }));
}

function applyCharacterStatsEdits(data: Uint8Array, edits: CharacterStatsEdit[]): void {
  for (const edit of edits) {
    const baseOffset = getCharacterStatsBaseOffset(data, edit.characterCode, edit.scope);
    if (baseOffset === null) {
      continue;
    }

    for (const field of CHARACTER_STAT_DEFINITIONS) {
      if (field.battleOnly && edit.scope === "field") {
        continue;
      }
      const value = edit.values[field.key];
      if (typeof value !== "number") {
        continue;
      }
      writeInverseUint16(data, baseOffset + field.relativeOffset, field.signed ? fromSignedUint16(value) : value);
    }
  }
}

function getCharacterStatsBaseOffset(data: Uint8Array, characterCode: number, scope: EquipmentScope): number | null {
  return getCharacterDataBaseOffset(data, characterCode, scope);
}

function getCharacterDataBaseOffset(data: Uint8Array, characterCode: number, scope: EquipmentScope): number | null {
  if (scope === "field") {
    const recordBaseOffset = findFieldCharacterRecordBaseOffset(data, characterCode);
    return recordBaseOffset === null ? null : recordBaseOffset + FIELD_CHARACTER_CODE_RELATIVE_OFFSET;
  }

  const equipmentOffset = getEquipmentBaseOffset(data, characterCode, "battle");
  if (equipmentOffset === null) {
    return null;
  }

  const baseOffset = equipmentOffset - EQUIPMENT_RELATIVE_OFFSET_FROM_CHARACTER;
  return baseOffset >= 0 && baseOffset + 0x44 <= data.length ? baseOffset : null;
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

function toSignedUint16(value: number): number {
  return value > 0x7fff ? value - 0x10000 : value;
}

function fromSignedUint16(value: number): number {
  if (!Number.isInteger(value) || value < -0x8000 || value > 0x7fff) {
    throw new Error("signed 2바이트 값은 -32768 이상 32767 이하여야 합니다.");
  }
  return value < 0 ? value + 0x10000 : value;
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
