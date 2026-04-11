import argparse
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TERRARIA_DIR = ROOT / "supported" / "Terraria"
STRICT_ITEM_CATEGORIES = {"weapon", "armor", "accessory", "buff", "other"}
ITEM_LIKE_KINDS = {"item", "material", "ore", "other"}
BOSS_LIKE_KINDS = {"boss", "miniboss"}
VALID_BOSS_COLUMNS = {"miniboss", "prehardmode", "hardmode", "postmoonlord"}
TOOL_HINTS = ("pickaxe", "drill", "hammer", "hamaxe", "axe", "fishingpole")
ACCESSORY_CONTAMINATION_HINTS = (
    "helmet",
    "breastplate",
    "chestplate",
    "greaves",
    "leggings",
    "robe",
    "hood",
    "mask",
    "ore",
    "bar",
    "brick",
    "banner",
    "bookcase",
    "statue",
    "wall",
)
BUFF_CONTAMINATION_HINTS = (
    "helmet",
    "breastplate",
    "chestplate",
    "greaves",
    "leggings",
    "robe",
    "hood",
    "mask",
    "ore",
    "bar",
    "brick",
    "banner",
    "bookcase",
    "statue",
    "wall",
)
ARMOR_HEAD_SUFFIXES = (
    "Helmet",
    "Helm",
    "Headgear",
    "Headpiece",
    "Mask",
    "Hood",
    "Visage",
    "Cowl",
    "Crown",
    "Cap",
    "Hat",
)
ARMOR_BODY_SUFFIXES = (
    "Breastplate",
    "Chestplate",
    "Chainmail",
    "Platemail",
    "Robe",
    "Shirt",
    "Tunic",
    "BodyArmor",
)
ARMOR_LEG_SUFFIXES = (
    "Greaves",
    "Leggings",
    "Cuisses",
    "Pants",
    "Kilt",
)
RUSSIAN_HEAD_SUFFIXES = (
    "шлем",
    "маска",
    "капюшон",
    "корона",
    "шляпа",
    "шапка",
    "головной убор",
    "вуаль",
)
TERRARIA_BOSS_WIKI_ICON_OVERRIDES = {
    "Terraria/KingSlime": "assets/icons/terraria/bosses/king-slime-wiki.png",
    "Terraria/QueenSlimeBoss": "assets/icons/terraria/bosses/queen-slime-wiki.png",
    "Terraria/MoonLordCore": "assets/icons/terraria/bosses/moon-lord-wiki.png",
    "Terraria/Deerclops": "assets/icons/terraria/bosses/deerclops-wiki.png",
    "Terraria/DD2DarkMageT1": "assets/icons/terraria/bosses/dark-mage-wiki.png",
    "Terraria/DD2OgreT2": "assets/icons/terraria/bosses/ogre-wiki.png",
    "Terraria/DD2Betsy": "assets/icons/terraria/bosses/betsy-wiki.png",
}
TERRARIA_MINIBOSSES = {
    "Terraria/DD2DarkMageT1",
    "Terraria/DD2OgreT2",
    "Terraria/DD2Betsy",
    "Terraria/PirateShip",
    "Terraria/MourningWood",
    "Terraria/Pumpking",
    "Terraria/Everscream",
    "Terraria/SantaNK1",
    "Terraria/IceQueen",
    "Terraria/MartianSaucerCore",
}
TERRARIA_BOSS_COLUMNS = {
    "Terraria/KingSlime": "prehardmode",
    "Terraria/EyeofCthulhu": "prehardmode",
    "Terraria/EaterofWorldsHead": "prehardmode",
    "Terraria/BrainofCthulhu": "prehardmode",
    "Terraria/QueenBee": "prehardmode",
    "Terraria/SkeletronHead": "prehardmode",
    "Terraria/Deerclops": "prehardmode",
    "Terraria/WallofFlesh": "prehardmode",
    "Terraria/QueenSlimeBoss": "hardmode",
    "Terraria/TheDestroyer": "hardmode",
    "Terraria/Retinazer": "hardmode",
    "Terraria/SkeletronPrime": "hardmode",
    "Terraria/Plantera": "hardmode",
    "Terraria/Golem": "hardmode",
    "Terraria/DukeFishron": "hardmode",
    "Terraria/HallowBoss": "hardmode",
    "Terraria/CultistBoss": "hardmode",
    "Terraria/LunarTowerSolar": "hardmode",
    "Terraria/LunarTowerNebula": "hardmode",
    "Terraria/LunarTowerVortex": "hardmode",
    "Terraria/LunarTowerStardust": "hardmode",
    "Terraria/MoonLordCore": "postmoonlord",
}


def read_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def assert_same(path: Path, expected: dict) -> None:
    if not path.exists():
        raise SystemExit(f"{path.relative_to(ROOT)} is missing. Run python tools/build_terraria_support.py")
    if read_json(path) != expected:
        raise SystemExit(f"{path.relative_to(ROOT)} is out of date. Run python tools/build_terraria_support.py")


def merge_tags(*tag_sets: list[str]) -> list[str]:
    merged: list[str] = []
    for tags in tag_sets:
        for tag in tags or []:
            if tag and tag not in merged:
                merged.append(tag)
    return merged


def humanize_identifier(value: str) -> str:
    buffer: list[str] = []
    for index, character in enumerate(value):
        if index > 0 and character.isupper() and value[index - 1].isalnum() and not value[index - 1].isupper():
            buffer.append(" ")
        if character in {"_", "-"}:
            buffer.append(" ")
            continue
        buffer.append(character)
    return "".join(buffer).strip()


def slugify(value: str) -> str:
    lowered = value.strip().lower()
    chars = [character if character.isalnum() else "-" for character in lowered]
    return "-".join(filter(None, "".join(chars).split("-"))) or "entry"


def infer_armor_set_key(internal_name: str) -> str | None:
    name = str(internal_name or "")
    for suffix in ARMOR_HEAD_SUFFIXES + ARMOR_BODY_SUFFIXES + ARMOR_LEG_SUFFIXES:
        if name.endswith(suffix) and len(name) > len(suffix):
            return name[: -len(suffix)]
    return None


def infer_armor_piece_slot(internal_name: str) -> str:
    name = str(internal_name or "")
    if any(name.endswith(suffix) for suffix in ARMOR_HEAD_SUFFIXES):
        return "head"
    if any(name.endswith(suffix) for suffix in ARMOR_BODY_SUFFIXES):
        return "body"
    if any(name.endswith(suffix) for suffix in ARMOR_LEG_SUFFIXES):
        return "legs"
    return "other"


def strip_ending(source: str, endings: tuple[str, ...]) -> str:
    lowered = source.lower().strip()
    for ending in endings:
        if lowered.endswith(ending.lower()):
            return source[: len(source) - len(ending)].strip()
    return source.strip()


def normalize_item_category(entry: dict) -> str:
    category = str(entry.get("category") or "").strip().lower()
    if category == "ammo":
        category = "buff"
    elif category in {"material", "ore", "tool", "furniture", "mount", "pet"}:
        category = "other"
    elif category not in STRICT_ITEM_CATEGORIES:
        category = "other"

    haystack = " ".join(
        str(value).strip().lower()
        for value in (
            entry.get("displayName"),
            entry.get("displayNameRu"),
            entry.get("internalName"),
        )
        if str(value or "").strip()
    )

    if category == "weapon" and any(hint in haystack for hint in TOOL_HINTS):
        return "other"
    if category == "accessory" and any(hint in haystack for hint in ACCESSORY_CONTAMINATION_HINTS):
        return "other"
    if category == "buff" and any(hint in haystack for hint in BUFF_CONTAMINATION_HINTS):
        return "other"

    return category


def apply_armor_selection_metadata(items_by_id: dict[str, dict]) -> None:
    armor_groups: dict[str, list[str]] = {}

    for content_id, entry in items_by_id.items():
        if entry.get("category") != "armor":
            continue
        set_key = infer_armor_set_key(str(entry.get("internalName") or "")) or str(entry.get("internalName") or content_id.split("/")[-1])
        armor_groups.setdefault(set_key, []).append(content_id)

    for set_key, content_ids in armor_groups.items():
        members = [items_by_id[content_id] for content_id in content_ids if content_id in items_by_id]
        if not members:
            continue

        members.sort(key=lambda entry: str(entry.get("internalName") or ""))
        slots = [infer_armor_piece_slot(str(entry.get("internalName") or "")) for entry in members]
        has_head = any(slot == "head" for slot in slots)
        has_body = any(slot == "body" for slot in slots)
        has_legs = any(slot == "legs" for slot in slots)
        unique_head_count = sum(1 for slot in slots if slot == "head")
        set_mode = len(members) >= 3 and has_head and has_body and has_legs and unique_head_count == 1

        representative = next((entry for entry in members if infer_armor_piece_slot(str(entry.get("internalName") or "")) == "head"), members[0])
        representative_id = str(representative.get("id"))
        group_slug = slugify(set_key)

        for entry in members:
            content_id = str(entry.get("id"))
            normalized = dict(items_by_id[content_id])
            normalized["armorGroupKey"] = set_key

            if set_mode and content_id == representative_id:
                source_name = str(normalized.get("displayName") or humanize_identifier(set_key))
                base_name = strip_ending(source_name, ARMOR_HEAD_SUFFIXES)
                if not base_name:
                    base_name = humanize_identifier(set_key)
                source_name_ru = str(normalized.get("displayNameRu") or source_name)
                base_name_ru = strip_ending(source_name_ru, RUSSIAN_HEAD_SUFFIXES)
                if not base_name_ru:
                    base_name_ru = source_name_ru

                normalized["displayName"] = f"{base_name} armor set"
                normalized["displayNameRu"] = f"{base_name_ru} комплект брони"
                normalized["armorMode"] = "set"
                normalized.pop("pickerHidden", None)
                normalized["tags"] = merge_tags(normalized.get("tags", []), ["armor", "armor-set", group_slug])
            elif set_mode:
                normalized["armorMode"] = "piece"
                normalized["pickerHidden"] = True
                normalized["tags"] = merge_tags(normalized.get("tags", []), ["armor", "armor-piece", group_slug])
            else:
                normalized["armorMode"] = "piece"
                normalized.pop("pickerHidden", None)
                normalized["tags"] = merge_tags(normalized.get("tags", []), ["armor", "armor-piece", group_slug])

            items_by_id[content_id] = normalized


def build_items() -> dict[str, dict]:
    search_items = read_json(TERRARIA_DIR / "search-items.json").get("items", [])
    items_by_id: dict[str, dict] = {}

    for row in search_items:
        content_id = row.get("id")
        if not content_id:
            continue

        normalized = dict(row)
        normalized["kind"] = str(normalized.get("kind") or "item")
        normalized["category"] = normalize_item_category(normalized)
        normalized["tags"] = merge_tags(normalized.get("tags", []), [normalized["category"]])
        if not normalized.get("icon") and normalized.get("internalName"):
            normalized["icon"] = f"assets/icons/terraria/search-items/{str(normalized['internalName']).lower()}.png"
        items_by_id[str(content_id)] = normalized

    apply_armor_selection_metadata(items_by_id)

    for content_id, entry in list(items_by_id.items()):
        if entry.get("category") == "armor":
            normalized = dict(entry)
            normalized["armorMode"] = normalized.get("armorMode") or "piece"
            normalized["armorGroupKey"] = normalized.get("armorGroupKey") or str(normalized.get("internalName") or content_id.split("/")[-1])
            items_by_id[content_id] = normalized

    return items_by_id


def build_bosses() -> dict[str, dict]:
    bosses_json = read_json(TERRARIA_DIR / "bosses.json").get("bosses", [])
    bosses_by_id: dict[str, dict] = {}

    for row in bosses_json:
        content_id = row.get("id")
        if not content_id:
            continue
        content_id = str(content_id)
        kind = "miniboss" if content_id in TERRARIA_MINIBOSSES else "boss"
        boss_column = TERRARIA_BOSS_COLUMNS.get(content_id, "miniboss" if kind == "miniboss" else "hardmode")
        icon = TERRARIA_BOSS_WIKI_ICON_OVERRIDES.get(content_id) or row.get("icon")
        entry = {
            "id": content_id,
            "internalName": row.get("internalName") or content_id.split("/")[-1],
            "displayName": row.get("displayName") or content_id.split("/")[-1],
            "displayNameRu": row.get("displayNameRu") or row.get("displayName") or content_id.split("/")[-1],
            "icon": icon,
            "kind": kind,
            "bossPickerEligible": True,
            "canonicalBossId": content_id,
            "bossColumn": boss_column,
            "tags": merge_tags(row.get("tags", []), [kind, boss_column]),
        }
        bosses_by_id[content_id] = entry

    return bosses_by_id


def validate_entries(items_by_id: dict[str, dict], bosses_by_id: dict[str, dict]) -> None:
    missing_icons = [content_id for content_id, entry in bosses_by_id.items() if not entry.get("icon")]
    if missing_icons:
        raise SystemExit(f"Terraria bosses without icons: {', '.join(sorted(missing_icons)[:20])}")

    bad_boss_columns = [
        content_id
        for content_id, entry in bosses_by_id.items()
        if entry.get("bossColumn") not in VALID_BOSS_COLUMNS
    ]
    if bad_boss_columns:
        raise SystemExit(f"Terraria bosses with invalid bossColumn: {', '.join(sorted(bad_boss_columns)[:20])}")

    bad_categories = [
        content_id
        for content_id, entry in items_by_id.items()
        if entry.get("category") not in STRICT_ITEM_CATEGORIES
    ]
    if bad_categories:
        raise SystemExit(f"Terraria items with invalid category: {', '.join(sorted(bad_categories)[:20])}")

    armor_missing_metadata = [
        content_id
        for content_id, entry in items_by_id.items()
        if entry.get("category") == "armor" and (entry.get("armorMode") not in {"set", "piece"} or not entry.get("armorGroupKey"))
    ]
    if armor_missing_metadata:
        raise SystemExit(f"Terraria armor entries missing armor metadata: {', '.join(sorted(armor_missing_metadata)[:20])}")


def build_payloads() -> tuple[dict, dict, dict]:
    items_by_id = build_items()
    bosses_by_id = build_bosses()
    validate_entries(items_by_id, bosses_by_id)

    combined_entries = [*items_by_id.values(), *bosses_by_id.values()]
    combined_entries.sort(
        key=lambda entry: (
            str(entry.get("kind") or ""),
            str(entry.get("displayName") or entry.get("internalName") or entry.get("id") or "").lower(),
        )
    )

    search_content = {
        "mod": "Terraria",
        "contentType": "search-content",
        "entries": combined_entries,
    }

    items = {
        "mod": "Terraria",
        "contentType": "items",
        "items": [
            {
                key: value
                for key, value in entry.items()
                if key
                in {
                    "id",
                    "internalName",
                    "displayName",
                    "displayNameRu",
                    "category",
                    "icon",
                    "kind",
                    "tags",
                    "pickerHidden",
                    "armorMode",
                    "armorGroupKey",
                }
            }
            for entry in items_by_id.values()
        ],
    }

    bosses = {
        "mod": "Terraria",
        "contentType": "bosses",
        "bosses": [
            {
                key: value
                for key, value in entry.items()
                if key
                in {
                    "id",
                    "internalName",
                    "displayName",
                    "displayNameRu",
                    "icon",
                    "kind",
                    "tags",
                    "bossPickerEligible",
                    "canonicalBossId",
                    "bossColumn",
                }
            }
            for entry in bosses_by_id.values()
        ],
    }

    return search_content, items, bosses


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail if generated Terraria files are outdated")
    args = parser.parse_args()

    search_content, items, bosses = build_payloads()

    if args.check:
        assert_same(TERRARIA_DIR / "search-content.json", search_content)
        assert_same(TERRARIA_DIR / "items.json", items)
        assert_same(TERRARIA_DIR / "bosses.json", bosses)
        print("Terraria support files are up to date.")
        return 0

    write_json(TERRARIA_DIR / "search-content.json", search_content)
    write_json(TERRARIA_DIR / "items.json", items)
    write_json(TERRARIA_DIR / "bosses.json", bosses)
    print(f"Built Terraria support with {len(search_content['entries'])} searchable entries.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
