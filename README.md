# TerraPath Hub

TerraPath Hub is the public home for TerraPath guides.

It hosts the published guide catalog, the web editor, submission and moderation
automation, the guide schema, and the curated Terraria data used by the site.
This is where authors build guides, moderators review them, and visitors browse
what has already been published.

`Build guide -> Submit -> Review -> Publish -> Browse`

## Quick Links

- Published site: https://vizeore7.github.io/terrapath-hub/
- Browse guides: https://vizeore7.github.io/terrapath-hub/browse.html
- Open the editor: https://vizeore7.github.io/terrapath-hub/editor.html
- Submit a guide: https://github.com/Vizeore7/terrapath-hub/issues/new?template=guide_submission.yml
- Guide schema: [schema/guide.schema.json](schema/guide.schema.json)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Moderation: [MODERATION.md](MODERATION.md)
- Supported content: [SUPPORTED_MODS.md](SUPPORTED_MODS.md)

## What This Repo Contains

- A GitHub Pages site with the guide catalog and guide editor.
- Public guide JSON files in `guides/`.
- Generated catalog data in `catalog/`.
- The guide schema in `schema/`.
- Curated support data and extracted web icons in `supported/`.
- Submission and moderation automation in `.github/` and `tools/`.

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
tools/      Validation, catalog build, export, and moderation helper scripts
```

## How To Use This Repo

| Role | Start here | What to do |
| --- | --- | --- |
| Author | Published editor + [CONTRIBUTING.md](CONTRIBUTING.md) | Build a guide, export `guide.json`, open a submission issue, and respond to review feedback. |
| Moderator | [MODERATION.md](MODERATION.md) | Review validated issues, apply `approved`, and merge the generated publication pull request. |
| Visitor | Published site | Browse published guides, open guide pages, and inspect raw JSON when needed. |

## Current Status

- The public editor, guide browser, and issue-based moderation flow are live.
- The web editor is vanilla-first and uses curated Terraria content data.
- Calamity Mod and Thorium Mod are currently metadata-only on the web side.
- The TerraPath tModLoader mod source lives separately from this public hub.

## Important Notes

- This repository is public by design. It contains the site code, schemas,
  support data, and automation openly.
- This is not a private backend or a hidden source drop.
- TerraPath Hub is for structured guides, not for general-purpose wiki pages.
- The web editor only knows curated supported content. The in-game mod can
  eventually resolve more from installed mods than the website can show today.
