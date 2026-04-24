# Battle Equipment Notes

This document records in-progress research about battle equipment offsets.

These findings are not yet confirmed enough for `AGENTS.md`. Move only stable, verified facts into `AGENTS.md` after additional validation.

## Current Working Hypothesis

Battle equipment appears to be stored in battle-unit records, not in the fixed 25 field character records.

The currently useful relationship is:

```text
battle equipment start = battle character code offset + 0x48
```

Character detail weapon fields are stored in the same character record:

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

## Episode Split Hypothesis

Episode 4 and Episode 5 battle saves may use different battle-unit regions or record sets.

Do not assume that a battle equipment offset found in one episode applies to the other episode. Earlier battle-offset observations from a different save state should be treated as episode/context-specific until verified.

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

## Caution

- Party list membership alone is not enough to identify active battle equipment.
- Known character codes can appear in multiple places in a battle save, including party data, field data, lookup tables, or unrelated state.
- A candidate should be treated as battle equipment only when a known character code appears in a plausible battle-unit region and the `+0x48` block forms six valid equipment slots.
- All-zero or unrelated-looking `+0x48` blocks can be false positives.

## Validation Needed

- Compare multiple Episode 4 battle saves and multiple Episode 5 battle saves.
- Determine whether battle-unit records have a stable start offset, stride, or per-episode table.
- Confirm whether arena characters follow the same battle-unit record rule.
- Confirm whether only active sortie members have valid battle equipment blocks, or whether reserve party members can also have battle-unit records in some battle contexts.
