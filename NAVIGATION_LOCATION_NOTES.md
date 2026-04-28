# Navigation Location Notes

This document records in-progress research about navigation, star system, and planet location fields.

These findings are not yet confirmed enough for `AGENTS.md`. Move only stable, verified facts into `AGENTS.md` after additional validation.

## Scope and Caution

- All observations in this note are currently from **Episode 4** save data.
- Episode 5 navigation may use different values or different regions. Episode 5 has not yet reached a freely navigable state in the currently checked saves, so do not apply these findings to Episode 5 without separate validation.
- Earlier observations were made in **Chapter 2**. The later Perso/Philipe observations were made in **Chapter 3**.
- Values may be reused across chapters or navigation contexts. In particular, the currently checked Chapter 3 state indicates that the Rich star system is not freely movable, so some codes that looked like star-system IDs in Chapter 2 may be reused in Chapter 3.

## Current Working Hypothesis

The existing save location fields used by the editor do not distinguish the tested star system or planet states:

```text
0x08 inverse uint32 = scene id
0x0C inverse uint32 = broad location code
```

For the compared navigation saves, both fields stayed unchanged while the star system or planet state changed.

The more useful candidate fields are still around `0x95CA..0x95CE`, but the interpretation has been revised after Chapter 3 samples.

## Candidate Navigation Fields

Values below are interpreted as inverse 16-bit integers:

```text
value = 0xFFFF - raw16
```

Candidate offsets:

```text
0x95CA inverse16 = navigation/planet-state flag
0x95CC inverse16 = navigation context/map-set/group candidate, not a confirmed unique star-system id
0x95CE inverse16 = local planet code or no-planet sentinel inside the current navigation context
```

## Observed Values - Episode 4 / Chapter 2

The initial navigation samples were from Episode 4 Chapter 2.

| Chapter | State | `0x95CA` | `0x95CC` | `0x95CE` |
| --- | --- | ---: | ---: | ---: |
| Ch.2 | Rich star system, before planet movement | 1 | 0 | 0 |
| Ch.2 | Rich star system, Rich planet | 2 | 0 | 2 |
| Ch.2 | Rich star system, Baedal planet | 2 | 0 | 0 |
| Ch.2 | Rich star system, Ka planet | 2 | 0 | 1 |
| Ch.2 | Rich star system, Elphant planet | 2 | 0 | 3 |
| Ch.2 | Rich star system, Jina planet | 2 | 0 | 4 |
| Ch.2 | Philipe star system, before planet movement | 1 | 1 | 0 |
| Ch.2 | Philipe star system, Payos planet | 2 | 1 | 9 |
| Ch.2 | Philipe star system, Trukal planet | 2 | 1 | 8 |
| Ch.2 | Philipe star system, Philipe planet | 2 | 1 | 7 |
| Ch.2 | Philipe star system, Pacha planet | 2 | 1 | 5 |
| Ch.2 | Philipe star system, Laplace planet | 2 | 1 | 6 |

## Observed Values - Episode 4 / Chapter 3

The later navigation samples were from Episode 4 Chapter 3.

| Chapter | State | `0x95CA` | `0x95CC` | `0x95CE` |
| --- | --- | ---: | ---: | ---: |
| Ch.3 | Philipe star system, before planet entry | 1 | 0 | 0 |
| Ch.3 | Perso star system, before planet movement | 1 | 1 | 65535 |
| Ch.3 | Perso star system, Perso planet | 2 | 1 | 0 |
| Ch.3 | Perso star system, Clarice planet | 2 | 1 | 1 |
| Ch.3 | Perso star system, Lupalman planet | 2 | 1 | 2 |
| Ch.3 | Perso star system, Elorin planet | 2 | 1 | 3 |

## Revised Interpretation

- `0x95CA` remains a strong candidate for broad navigation state.
  - `1` appears to mean space navigation / before planet entry or movement.
  - `2` appears to mean planet selected, entered, or planet-local navigation state.
- `0x95CC` should no longer be treated as a unique star-system id.
  - In Chapter 2, `0` matched the Rich samples and `1` matched the Philipe samples.
  - In Chapter 3, Philipe before planet entry used `0`, while Perso used `1`.
  - This suggests `0x95CC` may be a navigation context, map-set, route group, chapter-state group, or reused system selector rather than a stable global star-system code.
- `0x95CE` remains a strong candidate for a planet code, but likely a **local code within the current navigation context**, not a global planet id.
  - Chapter 2 Rich planets used local-looking values `0..4`.
  - Chapter 2 Philipe planets used values `5..9`, but this may have been context-specific rather than globally assigned.
  - Chapter 3 Perso planets use `0..3`, which confirms that planet codes can restart in a later navigation context.
  - Before planet movement/entry, `0x95CE` may be `0` or `65535`. Treat `65535` as a likely no-planet / unselected sentinel, but do not assume all pre-entry states use it.

## Related Candidate Block

Changing star systems also changes a larger block around:

```text
0x9648..0x9B7C
```

This block appears to contain navigation map state or object/coordinate data. It changes heavily when comparing different star systems, but it stayed unchanged in the currently compared same-system planet samples except for the smaller candidate fields above.

Because `0x95CC` appears to be reused across chapters, this larger block may be required to safely relocate between different navigation contexts or star systems.

## Editor Guidance

- Do not expose `0x95CC` as a simple fixed star-system enum yet.
- If adding navigation editing, label these fields as experimental and episode/chapter-specific.
- For Episode 4 Chapter 3 Perso planet selection, the currently observed local planet codes are:

| Planet | `0x95CA` | `0x95CC` | `0x95CE` |
| --- | ---: | ---: | ---: |
| Perso | 2 | 1 | 0 |
| Clarice | 2 | 1 | 1 |
| Lupalman | 2 | 1 | 2 |
| Elorin | 2 | 1 | 3 |

- For Episode 4 Chapter 3 Perso before planet movement, the currently observed value is:

```text
0x95CA = 1
0x95CC = 1
0x95CE = 65535
```

- For Episode 4 Chapter 3 Philipe before planet entry, the currently observed value is:

```text
0x95CA = 1
0x95CC = 0
0x95CE = 0
```

## Validation Needed

- Compare additional Chapter 3 Philipe planet-entry samples, not just the before-entry state.
- Compare Chapter 3 Rich state if it later becomes freely movable, or confirm that it remains locked/unavailable and reuses navigation values.
- Compare Episode 5 once navigation becomes available; do not assume Episode 4 offsets or values apply.
- Determine whether editing only `0x95CA`, `0x95CC`, and `0x95CE` is sufficient, or whether the larger `0x9648..0x9B7C` block must also be changed for safe navigation relocation.
- Determine whether `0x95CE = 65535` is a general no-planet sentinel or specific to the Chapter 3 Perso before-movement state.
