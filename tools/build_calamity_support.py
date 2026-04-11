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
STRICT_ITEM_CATEGORIES = {"weapon", "armor", "accessory", "buff", "other"}
COMBAT_CLASS_TAGS = {"weapon", "melee", "ranged", "magic", "summoner", "rogue"}
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
VALID_BOSS_COLUMNS = {"miniboss", "prehardmode", "hardmode", "postmoonlord"}
WEAPON_HINTS = (
    "blade", "blaster", "boomerang", "bow", "cannon", "chakram", "gun", "knife", "lance",
    "launcher", "pistol", "rifle", "scythe", "shotgun", "spear", "staff", "sword", "tome",
    "trident", "wand", "whip", "yoyo"
)
BUFF_HINTS = (
    "potion", "elixir", "flask", "food", "meal", "stew", "soup", "tea", "coffee",
    "beer", "wine", "sake", "ammo", "arrow", "bullet", "rocket", "dart", "solution",
    "bait", "fed", "feast"
)
TOOL_HINTS = ("pickaxe", "drill", "hammer", "hamaxe", "axe", "fishing pole")
ACCESSORY_HINTS = (
    "amulet", "anklet", "badge", "balloon", "band", "bezoar", "boots", "booster", "bracelet",
    "bracer", "bundle", "charm", "cloak", "cuffs", "emblem", "fins", "flipper", "gauntlet",
    "glove", "horseshoe", "insignia", "magiluminescence", "mitten", "necklace", "pendant",
    "quiver", "ring", "scarf", "scope", "shackle", "shield", "shell", "sigil", "skates",
    "spurs", "talisman", "veil", "wings"
)
ARMOR_PIECE_HINTS = (
    "helmet", "helm", "headgear", "headpiece", "mask", "hood", "visage", "cowl", "crown",
    "cap", "hat", "breastplate", "chestplate", "chainmail", "platemail", "robe", "greaves",
    "leggings", "cuisses"
)
BUFF_SUPPORT_HINTS = (
    "ammo box", "bewitching table", "campfire", "crystal ball", "heart lantern",
    "peace candle", "sharpening station", "slice of cake", "sunflower", "water candle",
    "war table"
)
DECORATIVE_OR_MATERIAL_HINTS = (
    "banner", "bar", "bookcase", "brick", "cage", "chair", "chandelier", "chest",
    "clock", "door", "dresser", "fence", "lamp", "ore", "painting", "piano",
    "platform", "sink", "sofa", "statue", "table", "tile", "toilet", "torch",
    "wall", "work bench", "workbench"
)
BOSS_WIKI_ICON_OVERRIDES = {
    "CalamityMod/Anahita": "assets/icons/calamity/bosses/anahita-wiki.png",
    "CalamityMod/AquaticScourgeHead": "assets/icons/calamity/bosses/aquatic-scourge-wiki.png",
    "CalamityMod/AresBody": "assets/icons/calamity/bosses/exo-mechs-wiki.png",
    "CalamityMod/AstrumAureus": "assets/icons/calamity/bosses/astrum-aureus-wiki.png",
    "CalamityMod/AstrumDeusHead": "assets/icons/calamity/bosses/astrum-deus-wiki.png",
    "CalamityMod/BrimstoneElemental": "assets/icons/calamity/bosses/brimstone-elemental-wiki.png",
    "CalamityMod/CalamitasClone": "assets/icons/calamity/bosses/calamitas-clone-wiki.png",
    "CalamityMod/CeaselessVoid": "assets/icons/calamity/bosses/ceaseless-void-wiki.png",
    "CalamityMod/Crabulon": "assets/icons/calamity/bosses/crabulon-wiki.png",
    "CalamityMod/Cryogen": "assets/icons/calamity/bosses/cryogen-wiki.png",
    "CalamityMod/DesertScourgeHead": "assets/icons/calamity/bosses/desert-scourge-wiki.png",
    "CalamityMod/Dragonfolly": "assets/icons/calamity/bosses/dragonfolly-wiki.png",
    "CalamityMod/HiveMind": "assets/icons/calamity/bosses/hive-mind-wiki.png",
    "CalamityMod/Leviathan": "assets/icons/calamity/bosses/leviathan-wiki.png",
    "CalamityMod/OldDuke": "assets/icons/calamity/bosses/old-duke-wiki.png",
    "CalamityMod/PerforatorHive": "assets/icons/calamity/bosses/perforatorhive-wiki.png",
    "CalamityMod/PlaguebringerGoliath": "assets/icons/calamity/bosses/plaguebringer-goliath-wiki.png",
    "CalamityMod/Polterghast": "assets/icons/calamity/bosses/polterghast-wiki.png",
    "CalamityMod/PrimordialWyrmHead": "assets/icons/calamity/bosses/primordial-wyrm-wiki.png",
    "CalamityMod/ProfanedGuardianCommander": "assets/icons/calamity/bosses/profaned-guardians-wiki.png",
    "CalamityMod/Providence": "assets/icons/calamity/bosses/providence-wiki.png",
    "CalamityMod/RavagerBody": "assets/icons/calamity/bosses/ravager-wiki.png",
    "CalamityMod/Signus": "assets/icons/calamity/bosses/signus-wiki.png",
    "CalamityMod/SlimeGodCore": "assets/icons/calamity/bosses/slime-god-wiki.png",
    "CalamityMod/StormWeaverHead": "assets/icons/calamity/bosses/storm-weaver-wiki.png",
    "CalamityMod/SupremeCalamitas": "assets/icons/calamity/bosses/supreme-calamitas-wiki.png",
    "CalamityMod/ThanatosHead": "assets/icons/calamity/bosses/thanatos-wiki.png",
    "CalamityMod/DevourerofGodsHead": "assets/icons/calamity/bosses/devourer-of-gods-wiki.png",
    "CalamityMod/THELORDE": "assets/icons/calamity/bosses/the-lorde-wiki.png",
    "CalamityMod/Yharon": "assets/icons/calamity/bosses/yharon-wiki.png",
    "CalamityMod/CloudElemental": "assets/icons/calamity/bosses/cloud-elemental-wiki.png",
    "CalamityMod/CragmawMire": "assets/icons/calamity/bosses/cragmaw-mire-wiki.png",
    "CalamityMod/EarthElemental": "assets/icons/calamity/bosses/earth-elemental-wiki.png",
    "CalamityMod/GiantClam": "assets/icons/calamity/bosses/giant-clam-wiki.png",
    "CalamityMod/GreatSandShark": "assets/icons/calamity/bosses/great-sand-shark-wiki.png",
    "CalamityMod/Mauler": "assets/icons/calamity/bosses/mauler-wiki.png",
    "CalamityMod/NuclearTerror": "assets/icons/calamity/bosses/nuclear-terror-wiki.png",
}


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


def load_previous_entries() -> dict[str, dict]:
    previous_path = CALAMITY_DIR / "search-content.json"
    if not previous_path.exists():
        return {}

    previous = read_json(previous_path)
    return {
        str(entry.get("id")): entry
        for entry in previous.get("entries", [])
        if entry.get("id")
    }


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


def infer_armor_piece_slot(raw: dict) -> str:
    internal_name = str(raw.get("internalName") or "")
    if any(internal_name.endswith(suffix) for suffix in ARMOR_HEAD_SUFFIXES):
        return "head"
    if any(internal_name.endswith(suffix) for suffix in ARMOR_BODY_SUFFIXES):
        return "body"
    if any(internal_name.endswith(suffix) for suffix in ARMOR_LEG_SUFFIXES):
        return "legs"
    return "other"


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


def load_supplement() -> dict:
    supplement_path = CALAMITY_DIR / "supplement.json"
    if not supplement_path.exists():
        return {}

    return read_json(supplement_path)


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


def normalize_item_category(raw: dict, entry: dict) -> str:
    current = str(entry.get("category") or raw.get("category") or "").strip().lower()
    tags = {str(tag).strip().lower() for tag in (entry.get("tags") or raw.get("tags") or []) if str(tag).strip()}
    haystack = " ".join(
        str(value).strip().lower()
        for value in (
            entry.get("displayName"),
            entry.get("displayNameRu"),
            entry.get("internalName"),
            raw.get("displayName"),
            raw.get("displayNameRu"),
            raw.get("internalName"),
        )
        if str(value or "").strip()
    )

    # Deterministic pipeline: trust curated/exported categories first.
    if current == "ammo":
        current = "buff"
    elif current in {"material", "ore", "mount", "pet", "tool", "furniture"}:
        current = "other"
    elif current not in STRICT_ITEM_CATEGORIES:
        current = ""

    # Safety rails for known contamination cases.
    if current in {"buff", "other"} and COMBAT_CLASS_TAGS & tags:
        current = "weapon"

    if current == "weapon" and any(hint in haystack for hint in TOOL_HINTS):
        return "other"
    if current == "accessory" and any(hint in haystack for hint in ARMOR_PIECE_HINTS + DECORATIVE_OR_MATERIAL_HINTS):
        return "other"
    if current == "buff" and any(hint in haystack for hint in ARMOR_PIECE_HINTS):
        return "other"

    if current:
        return current

    if entry.get("armorSetKey") or raw.get("armorSetKey"):
        return "armor"
    if "accessory" in tags:
        return "accessory"
    if COMBAT_CLASS_TAGS & tags:
        return "weapon"
    if "buff" in tags:
        return "buff"

    return "other"


def apply_armor_selection_metadata(raw_items: list[dict], entries_by_id: dict[str, dict]) -> None:
    raw_items_by_id = {
        str(raw.get("id")): raw
        for raw in raw_items
        if raw.get("id")
    }
    armor_groups: dict[str, list[dict]] = {}

    for content_id, entry in entries_by_id.items():
        if entry.get("category") != "armor":
            continue

        raw = raw_items_by_id.get(content_id, {})
        set_key = infer_armor_set_key(raw) or infer_armor_set_key(entry) or str(entry.get("internalName") or content_id.split("/")[-1])
        armor_groups.setdefault(set_key, []).append(raw or {"id": content_id, "internalName": entry.get("internalName", "")})

    for set_key, members in armor_groups.items():
        members = [member for member in members if member.get("id") in entries_by_id]
        if not members:
            continue

        members.sort(key=lambda raw: (infer_armor_piece_rank(raw), str(raw.get("internalName") or "")))
        piece_slots = [infer_armor_piece_slot(raw) for raw in members]
        unique_head_count = sum(1 for slot in piece_slots if slot == "head")
        has_body = any(slot == "body" for slot in piece_slots)
        has_legs = any(slot == "legs" for slot in piece_slots)
        set_mode = len(members) >= 3 and unique_head_count == 1 and has_body and has_legs

        representative = next((member for member in members if infer_armor_piece_slot(member) == "head"), members[0])
        representative_id = str(representative.get("id"))
        representative_slug = slugify(set_key)

        for member in members:
            member_id = str(member.get("id"))
            entry = dict(entries_by_id[member_id])
            entry["category"] = "armor"
            entry["armorGroupKey"] = set_key

            if set_mode and member_id == representative_id:
                set_name = representative.get("armorSetName") or f"{humanize_identifier(set_key)} armor set"
                set_name_ru = representative.get("armorSetNameRu") or entry.get("displayNameRu") or set_name
                entry["displayName"] = set_name
                entry["displayNameRu"] = set_name_ru
                entry["armorMode"] = "set"
                entry.pop("pickerHidden", None)
                entry["tags"] = merge_tags(entry.get("tags", []), ["armor", "armor-set", representative_slug])
            elif set_mode:
                entry["armorMode"] = "piece"
                entry["pickerHidden"] = True
                entry["tags"] = merge_tags(entry.get("tags", []), ["armor", "armor-piece", representative_slug])
            else:
                entry["armorMode"] = "piece"
                entry.pop("pickerHidden", None)
                entry["tags"] = merge_tags(entry.get("tags", []), ["armor", "armor-piece", representative_slug])

            entries_by_id[member_id] = entry


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


def preserve_previous_localizations(entries_by_id: dict[str, dict], previous_entries: dict[str, dict]) -> None:
    for content_id, entry in list(entries_by_id.items()):
        previous = previous_entries.get(content_id)
        if not previous:
            continue

        current_name = str(entry.get("displayName") or "")
        current_name_ru = str(entry.get("displayNameRu") or "")
        previous_name = str(previous.get("displayName") or "")
        previous_name_ru = str(previous.get("displayNameRu") or "")

        if previous_name_ru and previous_name_ru != previous_name and (not current_name_ru or current_name_ru == current_name):
            normalized = dict(entry)
            normalized["displayNameRu"] = previous_name_ru
            entries_by_id[content_id] = normalized


def normalize_item_entries(raw_items: list[dict], entries_by_id: dict[str, dict]) -> None:
    raw_items_by_id = {raw.get("id"): raw for raw in raw_items if raw.get("id")}

    for content_id, entry in list(entries_by_id.items()):
        if content_id not in raw_items_by_id:
            continue

        normalized = dict(entry)
        normalized["category"] = normalize_item_category(raw_items_by_id[content_id], normalized)
        if normalized["category"] == "armor":
            normalized["tags"] = merge_tags(normalized.get("tags", []), ["armor"])
        entries_by_id[content_id] = normalized


def apply_boss_normalization(entries_by_id: dict[str, dict], supplement: dict) -> None:
    rules = supplement.get("bossNormalization", {}) if isinstance(supplement, dict) else {}
    alias_map = {
        str(source): str(target)
        for source, target in (rules.get("aliasMap") or {}).items()
        if source and target
    }
    hidden_bosses = {str(entry) for entry in (rules.get("hiddenBosses") or []) if entry}
    eligible_minibosses = {str(entry) for entry in (rules.get("eligibleMinibosses") or []) if entry}
    display_overrides = rules.get("displayOverrides") or {}
    column_map = {
        str(content_id): str(column).strip().lower()
        for content_id, column in (rules.get("columnMap") or {}).items()
        if content_id and str(column).strip().lower() in VALID_BOSS_COLUMNS
    }

    for content_id, entry in list(entries_by_id.items()):
        if entry.get("kind") not in BOSS_LIKE_KINDS:
            continue

        normalized = dict(entry)
        canonical_id = alias_map.get(content_id, content_id)
        if canonical_id != content_id:
            normalized["canonicalBossId"] = canonical_id
            normalized["bossPickerEligible"] = False
        elif content_id in hidden_bosses:
            normalized["bossPickerEligible"] = False
        elif normalized.get("kind") == "miniboss":
            normalized["bossPickerEligible"] = content_id in eligible_minibosses
            if normalized["bossPickerEligible"]:
                normalized["canonicalBossId"] = content_id
        else:
            normalized["bossPickerEligible"] = True
            normalized["canonicalBossId"] = content_id

        boss_column = column_map.get(content_id) or column_map.get(canonical_id)
        if not boss_column:
            boss_column = "miniboss" if normalized.get("kind") == "miniboss" else "hardmode"
        normalized["bossColumn"] = boss_column

        override = display_overrides.get(content_id) or {}
        if override.get("displayName"):
            normalized["displayName"] = override["displayName"]
        if override.get("displayNameRu"):
            normalized["displayNameRu"] = override["displayNameRu"]
        if override.get("iconOverride"):
            normalized["icon"] = override["iconOverride"]
        if content_id in BOSS_WIKI_ICON_OVERRIDES:
            normalized["icon"] = BOSS_WIKI_ICON_OVERRIDES[content_id]
        if override.get("tags"):
            normalized["tags"] = merge_tags(normalized.get("tags", []), override.get("tags", []))

        entries_by_id[content_id] = normalized


def validate_coverage(raw_items: list[dict], raw_npcs: list[dict], entries_by_id: dict[str, dict], bosses: dict, supplement: dict) -> None:
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

    rules = supplement.get("bossNormalization", {}) if isinstance(supplement, dict) else {}
    alias_map = {
        str(source): str(target)
        for source, target in (rules.get("aliasMap") or {}).items()
        if source and target
    }
    hidden_bosses = {str(entry) for entry in (rules.get("hiddenBosses") or []) if entry}

    boss_ids = {entry["id"] for entry in bosses.get("bosses", [])}
    illegal_picker_entries = sorted(boss_ids & (set(alias_map) | hidden_bosses))
    if illegal_picker_entries:
        raise SystemExit(
            f"Boss picker contains segmented or hidden entries: {', '.join(illegal_picker_entries[:20])}"
        )

    missing_canonical_targets = sorted(target for target in alias_map.values() if target not in entries_by_id)
    if missing_canonical_targets:
        raise SystemExit(
            f"Boss normalization refers to missing canonical targets: {', '.join(missing_canonical_targets[:20])}"
        )

    missing_boss_columns = [
        row.get("id")
        for row in bosses.get("bosses", [])
        if row.get("bossColumn") not in VALID_BOSS_COLUMNS
    ]
    if missing_boss_columns:
        raise SystemExit(
            f"Boss picker entries missing bossColumn metadata: {', '.join(sorted(str(entry) for entry in missing_boss_columns)[:20])}"
        )


def build_pack(export_dir: Path) -> tuple[dict, dict, dict]:
    raw_items, raw_npcs = load_raw_export(export_dir)
    if not raw_items and not raw_npcs:
        raise SystemExit(f"No Calamity export found in {export_dir}. Run /terrapath export calamity first.")

    supplement = load_supplement()
    previous_entries = load_previous_entries()
    supplement_entries = supplement.get("entries", []) if isinstance(supplement, dict) else []
    entries_by_id: dict[str, dict] = {}

    for raw in raw_items:
        if raw.get("id"):
            entries_by_id[raw["id"]] = build_raw_item_entry(export_dir, raw)

    for raw in raw_npcs:
        if raw.get("id"):
            entries_by_id[raw["id"]] = build_raw_npc_entry(export_dir, raw)

    apply_supplement(entries_by_id, supplement_entries)
    preserve_previous_localizations(entries_by_id, previous_entries)
    normalize_item_entries(raw_items, entries_by_id)
    apply_armor_selection_metadata(raw_items, entries_by_id)
    apply_boss_normalization(entries_by_id, supplement)

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
                if key in {
                    "id",
                    "internalName",
                    "displayName",
                    "displayNameRu",
                    "category",
                    "icon",
                    "kind",
                    "tags",
                    "pickerHidden",
                    "canonicalBossId",
                    "armorMode",
                    "armorGroupKey",
                    "bossColumn",
                }
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
                if key in {
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
            for entry in entries
            if entry.get("kind") in BOSS_LIKE_KINDS and entry.get("bossPickerEligible")
        ],
    }

    validate_coverage(raw_items, raw_npcs, entries_by_id, bosses, supplement)

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
