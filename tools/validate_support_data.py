import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from build_calamity_support import BOSS_WIKI_ICON_OVERRIDES, COMBAT_CLASS_TAGS, STRICT_ITEM_CATEGORIES, VALID_BOSS_COLUMNS
from build_terraria_support import TERRARIA_BOSS_WIKI_ICON_OVERRIDES


def read_json(relative_path: str) -> dict:
    with (ROOT / relative_path).open("r", encoding="utf-8") as file:
        return json.load(file)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def validate_item_categories(relative_path: str) -> None:
    rows = read_json(relative_path)["items"]
    weapon_tool_pattern = re.compile(r"pickaxe|drill|hammer|hamaxe|chainsaw|fishingpole|axe", re.IGNORECASE)
    accessory_contamination_pattern = re.compile(
        r"bookcase|banner|statue|brick$|wall$|bar$|pickaxe|drill|hammer|hamaxe|axe|helmet|"
        r"breastplate|chestplate|greaves|leggings|robe|hood|mask",
        re.IGNORECASE,
    )
    buff_contamination_pattern = re.compile(
        r"bookcase|banner|brick$|wall$|bar$|pickaxe|drill|hammer|hamaxe|axe|helmet|"
        r"breastplate|chestplate|greaves|leggings|robe|hood|mask",
        re.IGNORECASE,
    )
    armor_contamination_pattern = re.compile(
        r"bookcase|banner|brick$|wall$|pickaxe|drill|hammer|hamaxe|axe",
        re.IGNORECASE,
    )

    weapon_tools = [
        row["id"]
        for row in rows
        if row.get("category") == "weapon" and weapon_tool_pattern.search(row.get("internalName", ""))
    ]
    contaminated_accessories = [
        row["id"]
        for row in rows
        if row.get("category") == "accessory"
        and accessory_contamination_pattern.search(row.get("internalName", ""))
    ]
    contaminated_buffs = [
        row["id"]
        for row in rows
        if row.get("category") == "buff"
        and buff_contamination_pattern.search(row.get("internalName", ""))
        and row.get("internalName") not in {"WarTable"}
    ]
    buffs_with_combat_tags = [
        row["id"]
        for row in rows
        if row.get("category") == "buff"
        and COMBAT_CLASS_TAGS & {str(tag).strip().lower() for tag in row.get("tags", []) if str(tag).strip()}
    ]
    contaminated_armor = [
        row["id"]
        for row in rows
        if row.get("category") == "armor"
        and armor_contamination_pattern.search(row.get("internalName", ""))
    ]

    require(
        not weapon_tools,
        f"{relative_path} has tools in the weapon picker: {', '.join(weapon_tools[:20])}",
    )
    require(
        not contaminated_accessories,
        f"{relative_path} has non-accessory entries in the accessory picker: {', '.join(contaminated_accessories[:20])}",
    )
    require(
        not contaminated_buffs,
        f"{relative_path} has non-buff entries in the buff picker: {', '.join(contaminated_buffs[:20])}",
    )
    require(
        not buffs_with_combat_tags,
        f"{relative_path} has combat-class entries in the buff picker: {', '.join(buffs_with_combat_tags[:20])}",
    )
    require(
        not contaminated_armor,
        f"{relative_path} has non-armor entries in the armor picker: {', '.join(contaminated_armor[:20])}",
    )


def validate_terraria_boss_icons() -> None:
    rows = {row["id"]: row for row in read_json("supported/Terraria/bosses.json")["bosses"]}
    expected_icons = TERRARIA_BOSS_WIKI_ICON_OVERRIDES

    for content_id, icon in expected_icons.items():
        row = rows.get(content_id)
        require(row is not None, f"Missing Terraria boss entry: {content_id}")
        require(row.get("icon") == icon, f"{content_id} must use {icon}, got {row.get('icon')}")
        require((ROOT / "docs" / icon).exists(), f"Missing boss icon file: {icon}")


def validate_calamity_boss_picker() -> None:
    boss_rows = read_json("supported/CalamityMod/bosses.json")["bosses"]
    boss_ids = {row["id"] for row in boss_rows}
    forbidden = {
        "CalamityMod/StormWeaverBody",
        "CalamityMod/StormWeaverTail",
        "CalamityMod/ThanatosBody1",
        "CalamityMod/ThanatosBody2",
        "CalamityMod/ThanatosTail",
        "CalamityMod/AresGaussNuke",
        "CalamityMod/AresLaserCannon",
        "CalamityMod/AresPlasmaFlamethrower",
        "CalamityMod/AresTeslaCannon",
        "CalamityMod/Apollo",
        "CalamityMod/Artemis",
        "CalamityMod/AquaticScourgeBody",
        "CalamityMod/AquaticScourgeBodyAlt",
        "CalamityMod/AquaticScourgeTail",
    }

    leaked = sorted(boss_ids & forbidden)
    require(not leaked, f"Calamity boss picker contains technical segments: {', '.join(leaked)}")

    require("CalamityMod/AquaticScourgeHead" in boss_ids, "Calamity boss picker is missing Aquatic Scourge")

    boss_rows_by_id = {row["id"]: row for row in boss_rows}
    for content_id, icon in BOSS_WIKI_ICON_OVERRIDES.items():
        if content_id not in boss_rows_by_id:
            continue
        row = boss_rows_by_id[content_id]
        require(row.get("icon") == icon, f"{content_id} must use {icon}, got {row.get('icon')}")
        require((ROOT / "docs" / icon).exists(), f"Missing Calamity boss wiki icon file: {icon}")


def validate_search_content(relative_path: str, mod_name: str) -> None:
    payload = read_json(relative_path)
    entries = payload.get("entries", [])
    require(entries, f"{relative_path} has no entries")

    rows_by_id: dict[str, list[dict]] = {}
    for row in entries:
        content_id = row.get("id")
        if not content_id:
            continue
        rows_by_id.setdefault(str(content_id), []).append(row)

    for row in entries:
        content_id = row.get("id")
        kind = str(row.get("kind") or "").lower()
        category = row.get("category")
        icon = row.get("icon")

        if category is not None:
            require(
                category in STRICT_ITEM_CATEGORIES,
                f"{relative_path} contains invalid category '{category}' for {content_id}",
            )
            if category == "armor":
                require(
                    row.get("armorMode") in {"set", "piece"},
                    f"{relative_path} armor entry is missing armorMode metadata: {content_id}",
                )
                require(
                    bool(row.get("armorGroupKey")),
                    f"{relative_path} armor entry is missing armorGroupKey metadata: {content_id}",
                )

        if kind in {"boss", "miniboss"}:
            require(
                row.get("bossColumn") in VALID_BOSS_COLUMNS,
                f"{relative_path} boss entry has invalid bossColumn: {content_id}",
            )
            if row.get("bossPickerEligible"):
                require(bool(icon), f"{relative_path} selectable boss entry is missing icon: {content_id}")
                require(
                    (ROOT / "docs" / str(icon)).exists(),
                    f"{relative_path} selectable boss icon is missing on disk: {icon}",
                )
                canonical = row.get("canonicalBossId")
                require(
                    canonical == content_id,
                    f"{relative_path} selectable boss entry must be canonical: {content_id} -> {canonical}",
                )

    if mod_name == "Terraria":
        boss_subset = read_json("supported/Terraria/bosses.json").get("bosses", [])
    elif mod_name == "CalamityMod":
        boss_subset = read_json("supported/CalamityMod/bosses.json").get("bosses", [])
    else:
        boss_subset = []

    for boss in boss_subset:
        content_id = boss.get("id")
        rows = rows_by_id.get(str(content_id)) or []
        row = next(
            (
                candidate
                for candidate in rows
                if str(candidate.get("kind") or "").lower() in {"boss", "miniboss"}
            ),
            None,
        )
        require(row is not None, f"{relative_path} is missing boss subset row: {content_id}")
        require(
            row.get("bossPickerEligible"),
            f"{relative_path} boss subset row is not picker-eligible: {content_id}",
        )


def main() -> int:
    validate_item_categories("supported/Terraria/items.json")
    validate_item_categories("supported/CalamityMod/items.json")
    validate_search_content("supported/Terraria/search-content.json", "Terraria")
    validate_search_content("supported/CalamityMod/search-content.json", "CalamityMod")
    validate_terraria_boss_icons()
    validate_calamity_boss_picker()
    print("Support data validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
