# Contributing to TerraPath Hub

Use this document if you want to submit a guide, report a content problem, or
request support for a new content source.

## For Guide Authors

1. Open the published editor on GitHub Pages.
2. Build your guide and check the preview carefully.
3. Export `guide.json`.
4. Open one `Guide submission` issue per guide.
5. Paste the exported JSON exactly as the editor generated it.
6. Update the same issue if edits are requested before publication.

## Guide Rules

- The guide must validate against `schema/guide.schema.json`.
- Each guide must use a unique `id`.
- Use stable content IDs, not display names, for items, bosses, ores, and other references.
- Modded references must use `ModName/InternalName`.
- Do not include executable code, HTML, remote images, or tracking content.
- Keep the title and catalog summary concise and useful in the guide list.

## Language Policy

- Repository documentation, issue templates, and schema keys are English-only.
- Guides themselves can be written in any supported locale.
- Published guides are grouped by locale under `guides/`.

## Review Expectations

- TerraPath only publishes guides that are valid, readable, and useful to players.
- Guide submissions may need naming, structure, or progression changes before approval.
- Approved submission issues become pull requests automatically.
