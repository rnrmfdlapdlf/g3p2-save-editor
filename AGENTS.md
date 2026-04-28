# Agent Notes

## Save Research Notes

- Do not record specific save file names such as `G3P_II08.sav` in project notes or handoff summaries. Save files change often, so those names are usually not helpful to the next agent.
- Prefer stable facts that remain valid across save files: character codes, field record indices, base offsets, relative offsets, value encoding, and verified formulas.
- Field character records use this layout:
  - `record_base = 0x0748 + index * 0x03A4`
  - character code offset: `record_base + 0x0A4`
  - mercenary offset: `record_base + 0x0BC`
  - chapter equipment start offset: `record_base + 0x0EC`
- Character codes and equipment/mercenary values in these records are stored with inverse integer encoding. Use `0xFFFF - raw16` for 16-bit values and `0xFFFFFFFF - raw32` for 32-bit values.
- Only the verified 25 field character record indices should be used for chapter equipment and mercenary editing. Other party character codes may be saved in the party list, but should not be assumed to have field equipment or mercenary offsets.

## Inventory Format Notes

- Inventory data is stored as a count plus contiguous 8-byte slots.
- Episode 4 inventory:
  - count offset: `0x63F4`
  - slot start: `0x63FC`
  - slot size: `8` bytes
- Episode 5 inventory:
  - count offset: `0x74A4`
  - slot start: `0x74AC`
  - slot size: `8` bytes
- Each inventory slot uses inverse 32-bit little-endian values:
  - item code: `0xFFFFFFFF - code`
  - quantity: `0xFFFFFFFF - quantity`
- The active inventory length is determined by the count field. Do not infer the active length from bytes after the last item.
- Bytes after the active count can contain old item-like data, quantity-zero remnants, unrelated state, or future slots that the game may later activate.
- The editor should read the stored count, clamp only to the file boundary, write the edited active list contiguously, update the count to the edited active list length, and leave bytes after the active count untouched.
- Do not use arbitrary fixed slot caps such as 12, 17, 20, or 26. Truncating valid active slots is a corruption bug.

## Field Character Mapping

- Current verified field character mapping:

| Index | Character Code | Character |
| ---: | ---: | --- |
| 0 | 236 | 네리사 |
| 1 | 237 | 데미안 (에피소드4) |
| 2 | 427 | 데미안 (에피소드5) |
| 3 | 238 | 디에네 (에피소드4) |
| 4 | 222 | 란 |
| 5 | 240 | 루시엔 |
| 6 | 246 | 루크랜서드 (에피소드4) |
| 7 | 484 | 루크랜서드 (에피소드5) |
| 8 | 398 | 리엔 |
| 9 | 241 | 리차드 |
| 10 | 242 | 디에네 (에피소드5) |
| 11 | 243 | 마리아 |
| 12 | 223 | 베라모드 |
| 13 | 247 | 엠블라 |
| 14 | 244 | 유진 |
| 15 | 219 | 살라딘 |
| 16 | 245 | 샤크바리 |
| 17 | 221 | 죠안 |
| 18 | 220 | 크리스티앙 |
| 19 | 563 | 나야트레이 |
| 20 | 38 | 레드헤드 |
| 21 | 56 | 아셀라스 |
| 22 | 57 | 젠 (아슈레이) |
| 23 | 64 | 카를로스 |
| 24 | 36 | 슈로 위장한 진 |
