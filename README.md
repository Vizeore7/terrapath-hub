# TerraPath Hub

TerraPath Hub is the public guide catalog and authoring workspace for TerraPath.

This repository hosts the published guide catalog, the web editor, the guide
schema, curated Terraria support data, and the GitHub issue flows used to submit
new guides and report project feedback.

`Build guide -> Submit -> Review -> Publish -> Browse`

## Quick Links

- Published site: https://vizeore7.github.io/terrapath-hub/
- Browse guides: https://vizeore7.github.io/terrapath-hub/browse.html
- Open the editor: https://vizeore7.github.io/terrapath-hub/editor.html
- Submit a guide: https://github.com/Vizeore7/terrapath-hub/issues/new?template=guide_submission.yml
- Report a bug: https://github.com/Vizeore7/terrapath-hub/issues/new?template=bug_report.yml
- UI feedback: https://github.com/Vizeore7/terrapath-hub/issues/new?template=ui_feedback.yml
- Request supported mod data: https://github.com/Vizeore7/terrapath-hub/issues/new?template=supported_mod_request.yml
- Guide schema: [schema/guide.schema.json](schema/guide.schema.json)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Supported content: [SUPPORTED_MODS.md](SUPPORTED_MODS.md)

## What This Repo Contains

- A GitHub Pages site with the guide catalog and guide editor.
- Public guide JSON files in `guides/`.
- Generated catalog data in `catalog/`.
- The guide schema in `schema/`.
- Curated support data and extracted web icons in `supported/`.
- Submission and publication automation in `.github/` and `tools/`.

Guides are stored as structured JSON on purpose, not as free-form wiki pages.
That keeps them searchable, validatable, sortable, and usable inside the
TerraPath mod later.

## Repo Map

```text
docs/       GitHub Pages site: home page, guide browser, editor, guide reader
guides/     Published guide JSON files grouped by locale and guide id
catalog/    Built indexes used by the site and future in-game loading
schema/     JSON schema for guide validation
supported/  Curated Terraria content data and web-ready icon assets
tools/      Validation, catalog build, export, and publication helper scripts
```

## How To Use This Repo

### For guide authors

1. Open the published editor.
2. Build your guide and check the preview.
3. Export `guide.json`.
4. Open one `Guide submission` issue per guide.
5. Paste the exported JSON and submit it.
6. Update the same issue if edits are requested before publication.

### For visitors

- Open the published site to browse guides.
- Use the guide browser filters to narrow by class, language, or required mods.
- Open any guide page to read the structured stages and item sections.
- Use the raw JSON link if you want to inspect the stored guide data directly.

## Where To Write

- Use `Bug report` issues for broken pages, wrong data, submission problems, or site regressions.
- Use `UI feedback` issues for usability complaints, layout ideas, or missing workflow improvements.
- Use `Supported mod request` issues when you want TerraPath Hub to index a new mod for the web editor.
- Use `Guide submission` issues only for one exported `guide.json`.

## Current Status

- The public editor, guide browser, and issue-based submission flow are live.
- The web editor is vanilla-first and uses curated Terraria content data.
- Calamity Mod and Thorium Mod are currently metadata-only on the web side.
- Published guides are reviewed before they are added to the public catalog.
- The TerraPath tModLoader mod source lives separately from this public hub.

## Important Notes

- This repository is public by design. It contains the site code, schemas,
  support data, and automation openly.
- This is not a private backend or a hidden source drop.
- TerraPath Hub is for structured guides, not for general-purpose wiki pages.
- The web editor only knows curated supported content. The in-game mod can
  eventually resolve more from installed mods than the website can show today.
