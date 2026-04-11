# Supported Content

TerraPath Hub uses curated content indexes for web search, validation, and icon
display. The website only guarantees the entries listed here.

The in-game mod can eventually resolve more content from installed mods than the
website can display, but the public editor stays limited to supported web data.

## Support Matrix

| Source | Internal name | Web support | Notes |
| --- | --- | --- | --- |
| Terraria | `Terraria` | Official | Search, validation, and curated vanilla icons are available. |
| Calamity Mod | `CalamityMod` | Official pipeline | Searchable web support is generated from a maintainer export of the installed mod plus supplement entries for non-item progression content. |
| Thorium Mod | `ThoriumMod` | Metadata-only | Required-mod metadata works; richer web pickers are planned later. |

## Asset Policy

- Third-party icons should only be published here when redistribution is allowed.
- Until then, unsupported or partially supported web content may use placeholders.
- TerraPath should prefer local installed mod assets in-game over republishing
  third-party web assets when permission is unclear.

## Maintainer Rebuild Flow

1. Load TerraPath and Calamity Mod together in `tModLoader`.
2. Run `/terrapath export calamity` in-game.
3. Run `python tools/build_calamity_support.py` in this repository.
4. Commit the regenerated files in `supported/CalamityMod/` and `docs/assets/icons/calamity/`.
