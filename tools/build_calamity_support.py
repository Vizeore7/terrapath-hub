import argparse
import json
import shutil
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CALAMITY_DIR = ROOT / "supported" / "CalamityMod"
DOC_ICON_ROOT = ROOT / "docs" / "assets" / "icons" / "calamity"
ITEM_ICON_ROOT = DOC_ICON_ROOT / "items"
BOSS_ICON_ROOT = DOC_ICON_ROOT / "bosses"
NPC_ICON_ROOT = DOC_ICON_ROOT / "npcs"

ITEM_LIKE_KINDS = {"item", "material", "ore", "other"}
BOSS_LIKE_KINDS = {"boss", "miniboss"}
ARMOR_SUFFIXES = [
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
]
ARMOR_REPRESENTATIVE_ORDER = {"Helmet": 0, "Helm": 0, "Headgear": 0, "Headpiece": 0, "Mask": 0, "Hood": 0, "Visage": 0, "Cowl": 0, "Crown": 0, "Cap": 0, "Hat": 0}


def default_export_dirs() -> list[Path]:
    directories: list[Path] = []
    for root in (Path.home() / "OneDrive", Path.home()):
        for documents_dir in ("Documents", "Документы"):
            directories.append(
                root / documents_dir / "My Games" / "Terraria" / "tModLoader" / "Mods" / "Cache" / "TerraPath" / "Exports" / "CalamityMod"
            )
    return directories


def read_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def find_export_dir(explicit: str | None) -> Path | None:
    if explicit:
        candidate = Path(explicit).expanduser()
        return candidate if candidate.exists() else None

    for candidate in default_export_dirs():
        if candidate.exists():
            return candidate

    return None


def slugify(value: str) -> str:
    lowered = value.strip().lower()
    chars = [character if character.isalnum() else "-" for character in lowered]
    return "-".join(filter(None, "".join(chars).split("-"))) or "entry"


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


def infer_armor_set_key(raw: dict) -> str | None:
    explicit = raw.get("armorSetKey")
    if explicit:
        return str(explicit)

    internal_name = str(raw.get("internalName") or "").strip()
    for suffix in ARMOR_SUFFIXES:
        if internal_name.endswith(suffix) and len(internal_name) > len(suffix):
            return internal_name[: -len(suffix)]
    return None


def infer_armor_piece_rank(raw: dict) -> int:
    internal_name = str(raw.get("internalName") or "")
    for suffix, rank in ARMOR_REPRESENTATIVE_ORDER.items():
        if internal_name.endswith(suffix):
            return rank
    return 10


def load_raw_export(export_dir: Path | None) -> tuple[list[dict], list[dict]]:
    if export_dir is None:
        return [], []

    items_path = export_dir / "items.json"
    npcs_path = export_dir / "npcs.json"
    if not items_path.exists() or not npcs_path.exists():
        return [], []

    items = read_json(items_path).get("items", [])
    npcs = read_json(npcs_path).get("npcs", [])
    return items, npcs


def load_supplement() -> list[dict]:
    supplement_path = CALAMITY_DIR / "supplement.json"
    if not supplement_path.exists():
        return []

    return read_json(supplement_path).get("entries", [])


def copy_icon(source_path: Path, target_root: Path, slug: str) -> str:
    target_root.mkdir(parents=True, exist_ok=True)
    target_path = target_root / f"{slug}.png"
    shutil.copyfile(source_path, target_path)
    return target_path.relative_to(ROOT / "docs").as_posix()


def merge_tags(*tag_sets: list[str]) -> list[str]:
    merged: list[str] = []
    for tags in tag_sets:
        for tag in tags or []:
            if tag and tag not in merged:
                merged.append(tag)
    return merged


def build_raw_item_entry(export_dir: Path, raw: dict) -> dict:
    source_icon = export_dir / str(raw.get("iconFile") or "")
    slug = slugify(raw.get("internalName") or raw.get("id") or "item")
    icon = copy_icon(source_icon, ITEM_ICON_ROOT, slug) if source_icon.exists() else None

    entry = {
        "id": raw["id"],
        "kind": raw.get("kind") or "item",
        "internalName": raw.get("internalName") or raw["id"].split("/")[-1],
        "displayName": raw.get("displayName") or raw.get("internalName") or raw["id"],
        "displayNameRu": raw.get("displayNameRu") or raw.get("displayName") or raw.get("internalName") or raw["id"],
        "category": raw.get("category") or "other",
        "tags": merge_tags(raw.get("tags", []), [raw.get("category") or "other"]),
    }

    if icon:
        entry["icon"] = icon

    armor_set_key = infer_armor_set_key(raw)
    if armor_set_key:
        entry["armorSetKey"] = armor_set_key

    return entry


def build_raw_npc_entry(export_dir: Path, raw: dict) -> dict:
    source_icon = export_dir / str(raw.get("iconFile") or "")
    bucket = BOSS_ICON_ROOT if raw.get("kind") in BOSS_LIKE_KINDS or raw.get("isBoss") else NPC_ICON_ROOT
    slug = slugify(raw.get("internalName") or raw.get("id") or "npc")
    icon = copy_icon(source_icon, bucket, slug) if source_icon.exists() else None

    kind = raw.get("kind") or ("boss" if raw.get("isBoss") else "npc")
    entry = {
        "id": raw["id"],
        "kind": kind,
        "internalName": raw.get("internalName") or raw["id"].split("/")[-1],
        "displayName": raw.get("displayName") or raw.get("internalName") or raw["id"],
        "displayNameRu": raw.get("displayNameRu") or raw.get("displayName") or raw.get("internalName") or raw["id"],
        "tags": merge_tags(raw.get("tags", []), [kind]),
    }

    if icon:
        entry["icon"] = icon

    return entry


def apply_armor_set_aliases(raw_items: list[dict], entries_by_id: dict[str, dict]) -> None:
    groups: dict[str, list[dict]] = {}
    for raw in raw_items:
        key = infer_armor_set_key(raw)
        if not key:
            continue
        groups.setdefault(key, []).append(raw)

    for set_key, members in groups.items():
        members.sort(key=lambda raw: (infer_armor_piece_rank(raw), str(raw.get("internalName") or "")))
        representative = members[0]
        representative_id = representative.get("id")
        if not representative_id or representative_id not in entries_by_id:
            continue

        representative_entry = dict(entries_by_id[representative_id])
        set_name = representative.get("armorSetName") or f"{humanize_identifier(set_key)} armor set"
        set_name_ru = representative.get("armorSetNameRu") or representative_entry.get("displayNameRu") or set_name
        representative_entry["displayName"] = set_name
        representative_entry["displayNameRu"] = set_name_ru
        representative_entry["category"] = "armor"
        representative_entry["tags"] = merge_tags(representative_entry.get("tags", []), ["armor", "armor-set", slugify(set_key)])
        representative_entry.pop("pickerHidden", None)
        entries_by_id[representative_id] = representative_entry

        for member in members[1:]:
            member_id = member.get("id")
            if not member_id or member_id not in entries_by_id:
                continue

            member_entry = dict(entries_by_id[member_id])
            member_entry["category"] = "armor"
            member_entry["pickerHidden"] = True
            member_entry["tags"] = merge_tags(member_entry.get("tags", []), ["armor", "armor-piece", slugify(set_key)])
            entries_by_id[member_id] = member_entry


def apply_supplement(entries_by_id: dict[str, dict], supplement_entries: list[dict]) -> None:
    for supplement in supplement_entries:
        content_id = supplement.get("id")
        if not content_id:
            continue

        current = entries_by_id.get(content_id, {})
        merged = {
            **current,
            **{key: value for key, value in supplement.items() if key not in {"tags"}},
        }
        merged["tags"] = merge_tags(current.get("tags", []), supplement.get("tags", []))

        icon_source_id = supplement.get("iconSourceId")
        if not merged.get("icon") and icon_source_id and icon_source_id in entries_by_id:
            merged["icon"] = entries_by_id[icon_source_id].get("icon")

        entries_by_id[content_id] = merged


def validate_coverage(raw_items: list[dict], raw_npcs: list[dict], entries_by_id: dict[str, dict]) -> None:
    missing_entries: list[str] = []
    missing_icons: list[str] = []

    for raw in [*raw_items, *raw_npcs]:
        content_id = raw.get("id")
        if not content_id:
            continue

        entry = entries_by_id.get(content_id)
        if entry is None:
            missing_entries.append(content_id)
            continue

        if not entry.get("icon"):
            missing_icons.append(content_id)

    if missing_entries:
        raise SystemExit(f"Missing Calamity entries in final pack: {', '.join(sorted(missing_entries)[:20])}")

    if missing_icons:
        raise SystemExit(f"Missing Calamity icons in final pack: {', '.join(sorted(missing_icons)[:20])}")


def build_pack(export_dir: Path) -> tuple[dict, dict, dict]:
    raw_items, raw_npcs = load_raw_export(export_dir)
    if not raw_items and not raw_npcs:
        raise SystemExit(f"No Calamity export found in {export_dir}. Run /terrapath export calamity first.")

    supplement_entries = load_supplement()
    entries_by_id: dict[str, dict] = {}

    for raw in raw_items:
        if raw.get("id"):
            entries_by_id[raw["id"]] = build_raw_item_entry(export_dir, raw)

    for raw in raw_npcs:
        if raw.get("id"):
            entries_by_id[raw["id"]] = build_raw_npc_entry(export_dir, raw)

    apply_armor_set_aliases(raw_items, entries_by_id)
    apply_supplement(entries_by_id, supplement_entries)
    validate_coverage(raw_items, raw_npcs, entries_by_id)

    entries = sorted(
        entries_by_id.values(),
        key=lambda entry: (
            str(entry.get("kind") or ""),
            str(entry.get("displayName") or entry.get("internalName") or entry.get("id") or "").lower(),
        ),
    )

    search_content = {
        "mod": "CalamityMod",
        "contentType": "search-content",
        "entries": entries,
    }

    items = {
        "mod": "CalamityMod",
        "contentType": "items",
        "items": [
            {
                key: value
                for key, value in entry.items()
                if key in {"id", "internalName", "displayName", "displayNameRu", "category", "icon", "kind", "tags", "pickerHidden"}
            }
            for entry in entries
            if entry.get("category") or entry.get("kind") in ITEM_LIKE_KINDS
        ],
    }

    bosses = {
        "mod": "CalamityMod",
        "contentType": "bosses",
        "bosses": [
            {
                key: value
                for key, value in entry.items()
                if key in {"id", "internalName", "displayName", "displayNameRu", "icon", "kind", "tags"}
            }
            for entry in entries
            if entry.get("kind") in BOSS_LIKE_KINDS
        ],
    }

    return search_content, items, bosses


def assert_same(path: Path, expected: dict) -> None:
    if not path.exists():
        raise SystemExit(f"{path.relative_to(ROOT)} is missing. Run python tools/build_calamity_support.py")
    actual = read_json(path)
    if actual != expected:
        raise SystemExit(f"{path.relative_to(ROOT)} is out of date. Run python tools/build_calamity_support.py")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail if generated Calamity files are outdated")
    parser.add_argument("--export-dir", help="path to a TerraPath Calamity export directory")
    args = parser.parse_args()

    export_dir = find_export_dir(args.export_dir)
    if export_dir is None:
        raise SystemExit("No Calamity export directory found. Run /terrapath export calamity first or pass --export-dir.")

    search_content, items, bosses = build_pack(export_dir)

    if args.check:
        assert_same(CALAMITY_DIR / "search-content.json", search_content)
        assert_same(CALAMITY_DIR / "items.json", items)
        assert_same(CALAMITY_DIR / "bosses.json", bosses)
        print("Calamity support files are up to date.")
        return 0

    write_json(CALAMITY_DIR / "search-content.json", search_content)
    write_json(CALAMITY_DIR / "items.json", items)
    write_json(CALAMITY_DIR / "bosses.json", bosses)
    print(f"Built Calamity support with {len(search_content['entries'])} searchable entries.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
