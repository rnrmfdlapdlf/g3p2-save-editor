# Agent Notes

## Purpose

- Keep this file limited to common working rules for this project.
- Put save format details, offsets, code tables, presets, and verification notes in `docs/` instead of duplicating them here.
- Start with `docs/README.md` for the document map, then use the focused files below when needed:
  - `docs/save-structure.md`
  - `docs/character-equipment.md`
  - `docs/code-tables-and-presets.md`
  - `docs/BATTLE_EQUIPMENT_NOTES.md`
  - `docs/NAVIGATION_LOCATION_NOTES.md`

## Change Discipline

- Do not change behavior, labels, spacing, spelling, or data values that were not requested.
- Project text is the source of truth for item, ability, character, and UI names. Do not "correct" spacing or spelling to match external sources or personal judgement unless explicitly asked.
- If a typo, suspicious value, or unrelated bug is found, report it to the user first instead of fixing it silently.
- Keep edits scoped to the current request. Avoid cleanup refactors unless they are required for the requested change.

## Save Safety

- Before adding or changing editor features that write save data, check whether loading a save and saving it unchanged can alter bytes.
- Treat unknown or padding-like bytes as unsafe to rewrite until their meaning is verified.
- Any automated correction of existing save data must be opt-in, clearly explained, and protected by a backup.

## UI Safety

- After layout changes, review neighboring tabs, popups, and repeated list items for unintended size, margin, wrapping, or overflow changes.
- When adding popups or list cards, keep item height and spacing stable across filters and long text.

## Research Notes

- Do not rely on specific save filenames as stable documentation. Save files are useful for verification, but docs should record stable facts such as offsets, encodings, formulas, and verified structure rules.
- When new save structure findings are confirmed, update the relevant file in `docs/` instead of expanding this file.
