import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GUIDES_DIR = ROOT / "guides"
CONTENT_ID = re.compile(r"^[A-Za-z][A-Za-z0-9_]*/[A-Za-z][A-Za-z0-9_]*$")
GUIDE_ID = re.compile(r"^[a-z0-9][a-z0-9-]{2,79}$")
STAGE_ERAS = {"prehardmode", "hardmode", "postmoonlord"}


def fail(path: Path, message: str) -> None:
    relative = path.relative_to(ROOT)
    raise SystemExit(f"{relative}: {message}")


def require_string(path: Path, guide: dict, field: str, min_length: int = 1) -> str:
    value = guide.get(field)
    if not isinstance(value, str) or len(value.strip()) < min_length:
        fail(path, f"'{field}' must be a string with at least {min_length} character(s)")
    return value


def require_string_list(path: Path, guide: dict, field: str) -> list[str]:
    value = guide.get(field)
    if not isinstance(value, list) or not value:
        fail(path, f"'{field}' must be a non-empty array")
    if not all(isinstance(item, str) and item.strip() for item in value):
        fail(path, f"'{field}' must contain only non-empty strings")
    if len(value) != len(set(value)):
        fail(path, f"'{field}' must not contain duplicates")
    return value


def validate_content_id(path: Path, value: str, field: str) -> None:
    if not isinstance(value, str) or not CONTENT_ID.match(value):
        fail(path, f"'{field}' must look like ModName/InternalName")


def validate_guide(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as file:
        guide = json.load(file)

    if guide.get("schemaVersion") != 1:
        fail(path, "'schemaVersion' must be 1")

    guide_id = require_string(path, guide, "id", 3)
    if not GUIDE_ID.match(guide_id):
        fail(path, "'id' must be a lowercase kebab-case identifier")

    require_string(path, guide, "title", 3)
    require_string(path, guide, "author", 2)
    require_string(path, guide, "language", 2)
    require_string(path, guide, "summary", 10)
    require_string(path, guide, "createdAt", 10)
    require_string(path, guide, "updatedAt", 10)
    require_string_list(path, guide, "requiredMods")
    require_string_list(path, guide, "classTags")

    stages = guide.get("stages")
    if not isinstance(stages, list) or not stages:
        fail(path, "'stages' must be a non-empty array")

    for stage in stages:
        if not isinstance(stage, dict):
            fail(path, "stage entries must be objects")
        if stage.get("era") not in STAGE_ERAS:
            fail(path, "stage 'era' must be one of: prehardmode, hardmode, postmoonlord")
        if "progressionMarkers" in stage:
            markers = stage["progressionMarkers"]
            if not isinstance(markers, list):
                fail(path, "stage 'progressionMarkers' must be an array")
            if len(markers) != len(set(markers)):
                fail(path, "stage 'progressionMarkers' must not contain duplicates")
        if "subStages" in stage:
            sub_stages = stage["subStages"]
            if not isinstance(sub_stages, list):
                fail(path, "stage 'subStages' must be an array")
            for sub_stage in sub_stages:
                if not isinstance(sub_stage, dict):
                    fail(path, "stage 'subStages' entries must be objects")
                if not isinstance(sub_stage.get("title"), str) or not sub_stage["title"].strip():
                    fail(path, "stage 'subStages[].title' must be a non-empty string")
                if "description" in sub_stage and not isinstance(sub_stage.get("description"), str):
                    fail(path, "stage 'subStages[].description' must be a string")
        if not isinstance(stage.get("items"), list):
            fail(path, "stage 'items' must be an array")
        for boss_ref in stage.get("bossRefs", []):
            validate_content_id(path, boss_ref, "bossRefs[]")
        for item in stage["items"]:
            if not isinstance(item, dict):
                fail(path, "stage item entries must be objects")
            validate_content_id(path, item.get("itemId"), "itemId")
            if "subgroup" in item and not isinstance(item.get("subgroup"), str):
                fail(path, "stage 'items[].subgroup' must be a string")
            for alternative in item.get("alternatives", []):
                validate_content_id(path, alternative, "alternatives[]")

    return guide


def main() -> int:
    paths = sorted(GUIDES_DIR.glob("**/guide.json"))
    if not paths:
        raise SystemExit("No guide files found")

    seen_ids = set()
    for path in paths:
        guide = validate_guide(path)
        guide_id = guide["id"]
        if guide_id in seen_ids:
            fail(path, f"duplicate guide id '{guide_id}'")
        seen_ids.add(guide_id)

    print(f"Validated {len(paths)} guide(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
