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

export type SaveInfo = {
  filePath: string;
  fileName: string;
  size: number;
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
  parties: Record<EpisodeKey, PartyInfo>;
};

export type SaveLocationLabel = "연대표" | "챕터" | "전투" | "알 수 없음";
export type SaveEpisodeLabel = "미선택" | "에피소드4" | "에피소드5";

export type SaveEditRequest = {
  money: Record<EpisodeKey, number>;
  parties: Record<EpisodeKey, number[]>;
};

export const MONEY_OFFSETS: Record<EpisodeKey, { label: string; offset: number }> = {
  episode4: { label: "에피소드4 / 영혼의 검", offset: 0x63f8 },
  episode5: { label: "에피소드5 / 뫼비우스의 우주", offset: 0x74a8 }
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

export const CHARACTER_OPTIONS = Array.from(CHARACTER_NAMES, ([code, name]) => ({ code, name }))
  .sort((a, b) => a.code - b.code);

const CHECKSUM_WEIGHTS = [3, 5, 7, 9] as const;

export function parseSave(data: Uint8Array, filePath: string): SaveInfo {
  const fileName = filePath.split(/[\\/]/).pop() ?? filePath;
  const storedChecksum = readUint16(data, data.length - 2);
  const calculatedChecksum = calculateChecksum(data);

  return {
    filePath,
    fileName,
    size: data.length,
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
    parties: {
      episode4: readParty(data, "episode4"),
      episode5: readParty(data, "episode5")
    }
  };
}

function readSaveLocation(data: Uint8Array): SaveInfo["location"] {
  const code = readInverseUint32(data, 0x0c);
  const label = getSaveLocationLabel(code);
  const sceneId = readInverseUint32(data, 0x08);

  return { code, label, sceneId };
}

function readSaveEpisode(data: Uint8Array): SaveInfo["episode"] {
  const episode4PartyCount = readInverseUint32(data, PARTY_OFFSETS.episode4.offset);
  const episode5PartyCount = readInverseUint32(data, PARTY_OFFSETS.episode5.offset);

  if (episode5PartyCount > 0) {
    return { label: "에피소드5" };
  }

  if (episode4PartyCount > 0) {
    return { label: "에피소드4" };
  }

  return { label: "미선택" };
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
  applyParty(data, "episode4", edits.parties.episode4);
  applyParty(data, "episode5", edits.parties.episode5);
  writeUint16(data, data.length - 2, calculateChecksum(data));
}

export function calculateChecksum(data: Uint8Array): number {
  let checksum = 0;
  for (let index = 0; index < data.length - 2; index += 1) {
    checksum += data[index] * CHECKSUM_WEIGHTS[index % CHECKSUM_WEIGHTS.length];
  }
  return checksum % 0x7d00;
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
