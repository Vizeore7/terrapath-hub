import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from build_calamity_support import BOSS_WIKI_ICON_OVERRIDES


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
        r"bookcase|banner|statue|brick|wall|ore|bar|pickaxe|drill|hammer|hamaxe|axe|helmet|"
        r"breastplate|chestplate|greaves|leggings|robe|hood|mask",
        re.IGNORECASE,
    )
    buff_contamination_pattern = re.compile(
        r"bookcase|banner|brick|wall|ore|bar|pickaxe|drill|hammer|hamaxe|axe|helmet|"
        r"breastplate|chestplate|greaves|leggings|robe|hood|mask",
        re.IGNORECASE,
    )
    armor_contamination_pattern = re.compile(
        r"bookcase|banner|brick|wall|ore|pickaxe|drill|hammer|hamaxe|axe",
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
        not contaminated_armor,
        f"{relative_path} has non-armor entries in the armor picker: {', '.join(contaminated_armor[:20])}",
    )


def validate_terraria_boss_icons() -> None:
    rows = {row["id"]: row for row in read_json("supported/Terraria/bosses.json")["bosses"]}
    expected_icons = {
        "Terraria/KingSlime": "assets/icons/terraria/bosses/king-slime-wiki.png",
        "Terraria/QueenSlimeBoss": "assets/icons/terraria/bosses/queen-slime-wiki.png",
        "Terraria/MoonLordCore": "assets/icons/terraria/bosses/moon-lord-wiki.png",
        "Terraria/Deerclops": "assets/icons/terraria/bosses/deerclops-wiki.png",
        "Terraria/DD2DarkMageT1": "assets/icons/terraria/bosses/dark-mage-wiki.png",
        "Terraria/DD2OgreT2": "assets/icons/terraria/bosses/ogre-wiki.png",
        "Terraria/DD2Betsy": "assets/icons/terraria/bosses/betsy-wiki.png",
    }

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


def main() -> int:
    validate_item_categories("supported/Terraria/search-items.json")
    validate_item_categories("supported/CalamityMod/items.json")
    validate_terraria_boss_icons()
    validate_calamity_boss_picker()
    print("Support data validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
