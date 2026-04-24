# Navigation Location Notes

This document records in-progress research about navigation, star system, and planet location fields.

These findings are not yet confirmed enough for `AGENTS.md`. Move only stable, verified facts into `AGENTS.md` after additional validation.

## Current Working Hypothesis

The existing save location fields used by the editor do not distinguish the tested star system or planet states:

```text
0x08 inverse uint32 = scene id
0x0C inverse uint32 = broad location code
```

For the compared navigation saves, both fields stayed unchanged while the star system or planet state changed.

## Candidate Navigation Fields

Values below are interpreted as inverse 16-bit integers:

```text
value = 0xFFFF - raw16
```

Candidate offsets:

```text
0x95CA inverse16 = navigation/planet-state flag
0x95CC inverse16 = star system code
0x95CE inverse16 = planet code within the current star system
```

Observed values:

| State | `0x95CA` | `0x95CC` | `0x95CE` |
| --- | ---: | ---: | ---: |
| Rich star system, before planet movement | 1 | 0 | 0 |
| Rich star system, Rich planet | 2 | 0 | 2 |
| Rich star system, Baedal planet | 2 | 0 | 0 |
| Rich star system, Ka planet | 2 | 0 | 1 |
| Rich star system, Elphant planet | 2 | 0 | 3 |
| Rich star system, Jina planet | 2 | 0 | 4 |
| Philipe star system, before planet movement | 1 | 1 | 0 |
| Philipe star system, Payos planet | 2 | 1 | 9 |
| Philipe star system, Trukal planet | 2 | 1 | 8 |
| Philipe star system, Philipe planet | 2 | 1 | 7 |
| Philipe star system, Pacha planet | 2 | 1 | 5 |
| Philipe star system, Laplace planet | 2 | 1 | 6 |

## Interpretation

- `0x95CC` is a strong candidate for star system code.
  - `0` may mean Rich.
  - `1` may mean Philipe.
- `0x95CA` may distinguish broad navigation state.
  - `1` may mean space/before planet movement.
  - `2` may mean entered or selected a planet location.
- `0x95CE` may be the planet code inside the current star system.
  - In the Rich system, observed planet codes are `0`, `1`, `2`, `3`, and `4`.
  - In the Philipe system, observed planet codes are `5`, `6`, `7`, `8`, and `9`.

## Related Candidate Block

Changing star systems also changes a larger block around:

```text
0x9648..0x9B7C
```

This block appears to contain navigation map state or object/coordinate data. It changes heavily when comparing different star systems, but it stayed unchanged in the currently compared same-system planet samples except for the smaller candidate fields above.

## Validation Needed

- Compare additional star systems to confirm whether `0x95CC` increments by star system.
- Compare more planet states in the same star system to confirm the `0x95CE` planet code table.
- Test whether editing only `0x95CA`, `0x95CC`, and `0x95CE` is sufficient, or whether the larger `0x9648..0x9B7C` block must also be changed for safe navigation relocation.
