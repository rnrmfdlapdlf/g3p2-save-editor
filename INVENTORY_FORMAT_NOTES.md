# Inventory Format Notes

This document records the currently verified save inventory behavior for G3P_II*.sav files.

## Confirmed Layout

Inventory data is stored as a count plus contiguous 8-byte slots.

### Episode 4

- Count offset: `0x63F4`
- Slot start: `0x63FC`
- Slot size: `8` bytes

### Episode 5

- Count offset: `0x74A4`
- Slot start: `0x74AC`
- Slot size: `8` bytes

### Slot Format

Each slot is:

```text
4 bytes: item code = 0xFFFFFFFF - code, little endian
4 bytes: quantity  = 0xFFFFFFFF - quantity, little endian
```

Example:

```text
code 209, quantity 1
2E FF FF FF FE FF FF FF
```

## Important Finding

There is no confirmed special 1-byte or 4-byte marker immediately after the last active item.

The active inventory length is determined by the count field. Bytes after the active count can contain:

- Old item-like slot data with quantity 0.
- Residual bytes from unrelated state.
- Data that later becomes valid inventory if the game increases the count and writes new slots there.

Therefore the editor must not use a fixed arbitrary slot limit such as 12, 17, 20, or 26 to decide how many existing slots to preserve.

The editor should:

- Read the actual count stored in the save file.
- Clamp only to the file boundary to avoid out-of-file reads.
- Write the edited active list contiguously.
- Update the count to the edited active list length.
- Leave bytes after the new active count untouched.

If the user deletes an item or sets quantity to 0, reducing the count is intentional. Otherwise, truncation is a bug.

## Verified Purchase Sequence: 07.sav to 16.sav

The user started from `G3P_II07.sav` and bought one item per save through `G3P_II16.sav`.

`G3P_II07.sav` starts with Episode 4 inventory count `11`.

Each new save increases the Episode 4 count by exactly 1:

```text
G3P_II08.sav count 12: code 15  글래스 렌즈      camera-lens
G3P_II09.sav count 13: code 16  옵틱 써클        camera-lens
G3P_II10.sav count 14: code 17  프라임 렌즈      camera-lens
G3P_II11.sav count 15: code 18  언터처블 렌즈    camera-lens
G3P_II12.sav count 16: code 1   옐로 리본        ribbon
G3P_II13.sav count 17: code 10  베이직 휠        yoyo
G3P_II14.sav count 18: code 20  베이직 크로      claw
G3P_II15.sav count 19: code 208 네리사의 마음    ribbon
G3P_II16.sav count 20: code 209 레인보우리본     ribbon
```

`G3P_II16.sav` and `G3P_II19.sav` have matching Episode 4 inventory count and slot bytes for the first 20 active slots.

## Verified Purchase Sequence: 19.sav to 18.sav

The user started from `G3P_II19.sav`, bought six more items, and saved to `G3P_II18.sav`.

`G3P_II18.sav` has Episode 4 inventory count `26`.

New slots:

```text
slot 21: code 21 세라믹 크로      claw
slot 22: code 22 아이언 크로      claw
slot 23: code 23 크리스탈 크로    claw
slot 24: code 11 체리오트         yoyo
slot 25: code 86 파워드 슈즈      shoes
slot 26: code 88 라이트닝 슈즈    shoes
```

The bytes starting at `0x649C`, previously thought to be a possible boundary, are actually reused by the game as slot 21 in `G3P_II18.sav`.

## Editor Reproduction Comparison

The editor's in-memory save logic was used to simulate:

- `G3P_II07.sav + 9 items` compared with actual `G3P_II19.sav`
- `G3P_II19.sav + 6 items` compared with actual `G3P_II18.sav`

When money is matched to the target save, the inventory count and slot bytes match the game-created saves.

Remaining differences are outside inventory:

- `0x04..0x06`: play time
- `0x63F8..0x63FB`: Episode 4 money, if money is not matched
- `0x964E..0x9B7D`: game-updated state block, not inventory slots
- final 2 bytes: checksum

Conclusion: the inventory slot format used by the editor is correct. The earlier corruption came from reading and re-saving with an arbitrary count cap, which truncated valid active slots.

