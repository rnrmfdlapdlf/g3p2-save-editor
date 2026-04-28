# Battle Equipment Notes

This document records in-progress research about battle equipment offsets, battle-unit records, and battle-time money/inventory copies.

These findings are not yet confirmed enough for `AGENTS.md`. Move only stable, verified facts into `AGENTS.md` after additional validation.

## Current Working Hypothesis

Battle equipment appears to be stored in battle-unit records, not in the fixed 25 field character records.

The currently useful relationship is:

```text
battle equipment start = battle character code offset + 0x48
```

Character detail weapon fields are stored in the same character/battle-unit record:

```text
+0x16 = weapon attack type, defined by attype.txt
+0x44 = weapon picture type, defined by wpPic.txt
+0x46 = weapon type, defined by wptype.txt
+0x48 = equipment slot start
```

Character codes and equipment slot values appear to use the same inverse 16-bit encoding:

```text
value = 0xFFFF - raw16
```

Money, inventory count, item code, and item quantity values use inverse 32-bit little-endian encoding:

```text
value = 0xFFFFFFFF - raw32
```

## Episode Split / Context Hypothesis

Episode 4 and Episode 5 battle saves can use different battle-time regions or record sets.

Do not assume that a battle equipment offset found in one episode applies to the other episode. Earlier battle-offset observations from a different save state should be treated as episode/context-specific until verified.

Battle save size and appended battle data also vary by battle type and sortie composition:

- Smaller/NPC/event-style Episode 4 battle sample: `0x11807` bytes.
- Episode 4 party battle sample with only Episode 4 characters: `0x1D4C8` bytes.
- Episode 4 party battle sample with forced Episode 5 characters in the party: `0x1DE7A` bytes.
- Episode 5 party battle sample: `0x18EE3` bytes.

File size alone is not enough to infer whether money/inventory copies exist. Check the actual copied blocks.

## Confirmed Current Episode 5 Battle Sample

The currently checked Episode 5 battle save has:

```text
location code = 1
episode4 party count = 0
episode5 party count = 2
episode5 party members = 223, 222
```

The battle equipment candidates that match the active Episode 5 party are:

| Character Code | Character | Character Code Offset | Battle Equipment Start | Observed Equipment |
| ---: | --- | ---: | ---: | --- |
| 222 | 란 | `0xF7DF` | `0xF827` | weapon `56`, armor `70`, others `0` |
| 223 | 베라모드 | `0xFCB4` | `0xFCFC` | weapon `45`, armor `177`, others `0` |

No valid Saladin battle equipment block was confirmed in this current Episode 5 battle sample.

## Character Detail Weapon Fields

The same relative offsets were observed in both chapter/field character records and battle-unit records.

For Ran (`character code 222`) in the Episode 5 battle sample:

```text
field character code offset  = 0x167C
battle character code offset = 0xF7DF

field +0x16 = 0x1692
field +0x44 = 0x16C0
field +0x46 = 0x16C2
field +0x48 = 0x16C4

battle +0x16 = 0xF7F5
battle +0x44 = 0xF823
battle +0x46 = 0xF825
battle +0x48 = 0xF827
```

Changing only Ran's weapon picture from Sword to Booster changed the battle `+0x44` value and left the chapter/field value unchanged:

```text
0xF823: 56 -> 53
wpPic.txt: 56 = Sword, 53 = Booster
```

Changing only Ran's weapon type from Sword to Asura changed the battle `+0x46` value and left the chapter/field value unchanged:

```text
0xF825: 14 -> 16
wptype.txt: 14 = Sword, 16 = Asura
```

Changing only Ran's weapon attack type from melee to ranged changed the battle `+0x16` value and left the chapter/field value unchanged:

```text
0xF7F5: 1 -> 6
attype.txt: 1 = melee attack, 6 = ranged attack, 1479 = booster
```

In all checks, the actual weapon equipment slot at `+0x48` did not change. This confirms that weapon picture/type/attack type are character detail fields, not the equipped weapon item itself.

## Battle-Time Money and Inventory Copies

### Field Money/Inventory Baselines

Known field money/inventory locations from the editor notes:

| Episode | Field Count | Field Money | Field Slot Start | Slot Size |
| --- | ---: | ---: | ---: | ---: |
| Episode 4 | `0x63F4` | `0x63F8` | `0x63FC` | 8 bytes |
| Episode 5 | `0x74A4` | `0x74A8` | `0x74AC` | 8 bytes |

Each inventory slot is:

```text
+0x00 inverse32 item code
+0x04 inverse32 quantity
```

### Episode 5 Battle Sample

The checked Episode 5 battle sample copies the Episode 5 field money/inventory block into a battle-time region.

Known value in this sample:

```text
episode5 money = 570900
encoded raw32 = 0xFFF749EB
stored little-endian bytes = EB 49 F7 FF
```

Confirmed offsets:

| Field | Field Offset | Battle Offset | Value |
| --- | ---: | ---: | ---: |
| Episode 5 inventory count | `0x74A4` | `0xBE41` | `4` |
| Episode 5 money | `0x74A8` | `0xBE45` | `570900` |
| Episode 5 inventory slot start | `0x74AC` | `0xBE49` | first item `122`, quantity `10` |

The field Episode 5 block starting at `0x74A4` matched the battle block starting at `0xBE41` for at least `0x2058` bytes in the checked battle sample.

```text
episode5 battle inventory count = 0xBE41
episode5 battle money           = 0xBE45
episode5 battle inventory start = 0xBE49
episode5 field-to-battle delta  = 0x499D
```

### Episode 5 Battle Money Gain Check

A later Episode 5 battle save with money gained during battle showed that gained money is written directly to the battle money copy, not to a separate “money gained” accumulator.

| Save State | Field Episode 5 Money `0x74A8` | Battle Episode 5 Money `0xBE45` |
| --- | ---: | ---: |
| Before gain / earlier battle sample | `570900` | `570900` |
| After battle money gain | `570900` | `571230` |

Observed gain:

```text
571230 - 570900 = 330
571230 encoded raw32 = 0xFFF748A1
stored little-endian bytes = A1 48 F7 FF
```

In the checked money-gain save, `571230` was found at the battle money offset and the field money remained unchanged. This suggests that battle rewards modify the battle-time money copy and the game later writes it back to the field money when the battle ends.

### Episode 4 Battle Samples

The checked Episode 4 battle saves copy Episode 4 money/inventory from the field block into a battle-time block.

Known value in these samples:

```text
episode4 money = 307869
encoded raw32 = 0xFFFB4D62
stored little-endian bytes = 62 4D FB FF
```

Confirmed Episode 4 battle copy offsets:

| Field | Field Offset | Battle Offset | Value |
| --- | ---: | ---: | ---: |
| Episode 4 inventory count | `0x63F4` | `0xAD9B` | `59` |
| Episode 4 money | `0x63F8` | `0xAD9F` | `307869` |
| Episode 4 inventory slot start | `0x63FC` | `0xADA3` | first item `122`, quantity `7` |

The field Episode 4 block starting at `0x63F4` is copied to the battle block starting at `0xAD9B`. In the checked Episode 4 battle samples, the copied bytes match for `0x3109` bytes.

```text
episode4 battle inventory count = 0xAD9B
episode4 battle money           = 0xAD9F
episode4 battle inventory start = 0xADA3
episode4 field-to-battle delta  = 0x49A7
```

The known money value appears twice in the Episode 4 battle save:

```text
0x63F8 = field Episode 4 money
0xAD9F = battle Episode 4 money copy
```

### Episode 5 Copy Inside Episode 4 Battle Saves

Important: Episode 4 battle saves also contain a copied Episode 5 money/inventory block.

This was confirmed in both:

- An Episode 4 party battle save that had Episode 5 characters forcibly added to the party.
- An Episode 4 party battle save with only three Episode 4 characters.

Therefore, the Episode 5 copy appears to be created by the Episode 4 battle-save structure itself, not merely because Episode 5 characters are present in the party.

Confirmed Episode 5 copy offsets inside checked Episode 4 battle saves:

| Field | Field Offset | Battle Copy Offset | Value |
| --- | ---: | ---: | ---: |
| Episode 5 inventory count | `0x74A4` | `0xBE4B` | `3` |
| Episode 5 money | `0x74A8` | `0xBE4F` | `571230` |
| Episode 5 inventory slot start | `0x74AC` | `0xBE53` | first item `122`, quantity `10` |

The field Episode 5 block starting at `0x74A4` matched the copied block starting at `0xBE4B` for `0x2059` bytes in the checked Episode 4 party battle sample.

```text
episode5 copy inside episode4 battle inventory count = 0xBE4B
episode5 copy inside episode4 battle money           = 0xBE4F
episode5 copy inside episode4 battle inventory start = 0xBE53
episode5 field-to-battle delta inside ep4 battle     = 0x49A7
```

Do not confuse these with the Episode 5 battle sample offsets:

```text
Episode 5 battle sample:
  count = 0xBE41
  money = 0xBE45
  slots = 0xBE49

Episode 5 copy inside Episode 4 battle samples:
  count = 0xBE4B
  money = 0xBE4F
  slots = 0xBE53
```

The difference is likely caused by the Episode 4 battle save copying the larger combined Episode 4/5 field region using a shared `+0x49A7` relocation, while the checked Episode 5 battle sample uses a slightly different relocation for the Episode 5 field block.

### Summary of Known Battle Money/Inventory Offsets

| Context | Count | Money | Slot Start | Notes |
| --- | ---: | ---: | ---: | --- |
| Episode 4 field | `0x63F4` | `0x63F8` | `0x63FC` | original field data |
| Episode 5 field | `0x74A4` | `0x74A8` | `0x74AC` | original field data |
| Episode 4 battle copy of Episode 4 data | `0xAD9B` | `0xAD9F` | `0xADA3` | confirmed in checked EP4 battle samples |
| Episode 4 battle copy of Episode 5 data | `0xBE4B` | `0xBE4F` | `0xBE53` | confirmed even when party has only EP4 characters |
| Episode 5 battle copy of Episode 5 data | `0xBE41` | `0xBE45` | `0xBE49` | confirmed in checked EP5 battle sample |

## Episode 4 Battle Save Size / Composition Notes

Checked sizes:

| Sample Type | Size | Notes |
| --- | ---: | --- |
| Episode 4 field/navigation sample | `0xAAFF` / 43,775 bytes | no battle append |
| Episode 4 smaller/NPC/event-style battle sample | `0x11807` / 71,687 bytes | contains money/inventory copies, less appended unit data |
| Episode 4 party battle, only Episode 4 characters | `0x1D4C8` / 120,008 bytes | contains Episode 4 and Episode 5 money/inventory copies |
| Episode 4 party battle, forced Episode 5 characters included | `0x1DE7A` / 122,490 bytes | larger by `0x09B2` / 2,482 bytes than the EP4-only party sample |
| Episode 5 field sample | `0xAAF5` / 43,765 bytes | no battle append |
| Episode 5 party battle sample | `0x18EE3` / 102,115 bytes | contains Episode 5 battle money/inventory copy |

The Episode 4 party battle sample with forced Episode 5 characters is larger than the Episode 4-only party battle sample, but both contain the Episode 5 money/inventory copy. The size difference is therefore more likely related to battle-unit/character data, not to the presence or absence of the Episode 5 inventory/money copy.

## Episode 4 Party Battle Unit Candidates

In the Episode 4 party battle sample with forced Episode 5 characters, a later appended region contained plausible active battle-unit records.

Observed candidates:

| Character Code | Character | Character Code Offset | Battle Equipment Start | Observed Equipment |
| ---: | --- | ---: | ---: | --- |
| 221 | 죠안 | `0x18904` | `0x1894C` | `57`, `177`, `0`, `99`, `0`, `88` |
| 220 | 크리스티앙 | `0x18DD9` | `0x18E21` | `26`, `177`, `0`, `99`, `0`, `88` |
| 222 | 란 | `0x192AE` | `0x192F6` | `226`, `161`, `165`, `98`, `163`, `162` |

The character-code offsets above are spaced by `0x4D5`:

```text
0x18DD9 - 0x18904 = 0x4D5
0x192AE - 0x18DD9 = 0x4D5
```

This suggests a possible Episode 4 party battle-unit stride of `0x4D5` in this sample. Treat this as tentative until more Episode 4 battle saves are compared.

## Caution

- Party list membership alone is not enough to identify active battle equipment.
- Known character codes can appear in multiple places in a battle save, including party data, field data, copied field blocks, lookup tables, or unrelated state.
- A candidate should be treated as battle equipment only when a known character code appears in a plausible battle-unit region and the `+0x48` block forms six valid equipment slots.
- All-zero or unrelated-looking `+0x48` blocks can be false positives.
- Do not use the Episode 5 battle money offset `0xBE45` for the Episode 5 copy inside Episode 4 battle saves. In checked Episode 4 battle saves, that copy's money offset is `0xBE4F`.
- Episode, chapter, battle type, NPC-only/event battles, and sortie composition can change appended battle data size and battle-unit record locations.

## Validation Needed

- Compare multiple Episode 4 battle saves and multiple Episode 5 battle saves.
- Determine whether battle-unit records have a stable start offset, stride, or per-episode table.
- Confirm whether the Episode 4 party battle-unit stride `0x4D5` holds across more Episode 4 party battles.
- Confirm whether the Episode 4-only party battle sample has the same battle-unit candidate offsets/stride or a shifted record region.
- Confirm whether arena characters follow the same battle-unit record rule.
- Confirm whether only active sortie members have valid battle equipment blocks, or whether reserve party members can also have battle-unit records in some battle contexts.
- Test whether editing only the battle-time money/inventory copies is sufficient during battle, and whether the game writes them back to the field offsets at battle end.
