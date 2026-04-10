import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from validate_guides import ROOT, validate_guide


def write_output(name: str, value: str) -> None:
    output_path = os.environ.get("GITHUB_OUTPUT")
    if not output_path:
        return
    with open(output_path, "a", encoding="utf-8") as handle:
        handle.write(f"{name}={value}\n")


def load_issue_body(path: str | None) -> str:
    if path:
        return Path(path).read_text(encoding="utf-8")
    body = os.environ.get("ISSUE_BODY", "")
    if not body.strip():
        raise SystemExit("Issue body is empty")
    return body


def extract_json_text(body: str) -> str:
    fences = body.split("```")
    for index in range(1, len(fences), 2):
        candidate = fences[index]
        candidate = candidate.removeprefix("json").strip()
        if candidate.startswith("{") and candidate.endswith("}"):
            return candidate

    start = body.find("{")
    if start == -1:
        raise SystemExit("No JSON object was found in the issue body")

    decoder = json.JSONDecoder()
    try:
        payload, _ = decoder.raw_decode(body[start:])
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse JSON from issue body: {exc}") from exc
    return json.dumps(payload, ensure_ascii=False, indent=2)


def parse_issue_guide(body: str) -> dict:
    json_text = extract_json_text(body)
    try:
        guide = json.loads(json_text)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Guide JSON is invalid: {exc}") from exc

    temp_dir = ROOT / ".tmp"
    temp_dir.mkdir(exist_ok=True)
    temp_path = temp_dir / "issue-validation-guide.json"
    try:
        temp_path.write_text(json.dumps(guide, ensure_ascii=False, indent=2), encoding="utf-8")
        validated = validate_guide(temp_path)
    finally:
        if temp_path.exists():
            temp_path.unlink()
    return validated


def guide_repo_path(guide: dict) -> Path:
    return ROOT / "guides" / guide["language"] / guide["id"] / "guide.json"


def publication_map_path() -> Path:
    return ROOT / "catalog" / "publication-map.json"


def load_publication_map() -> dict:
    path = publication_map_path()
    if not path.exists():
        return {"schemaVersion": 1, "issues": {}}
    return json.loads(path.read_text(encoding="utf-8"))


def write_publication_map(data: dict) -> None:
    path = publication_map_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")


def remove_empty_guide_dirs(path: Path) -> None:
    guides_root = ROOT / "guides"
    current = path.parent
    while current != guides_root and current.is_relative_to(guides_root):
        try:
            current.rmdir()
        except OSError:
            break
        current = current.parent


def stamp_guide_dates(guide: dict, target_path: Path) -> dict:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    stamped = dict(guide)
    if target_path.exists():
        existing = json.loads(target_path.read_text(encoding="utf-8"))
        stamped["createdAt"] = existing.get("createdAt", stamped.get("createdAt", now))
    else:
        stamped["createdAt"] = stamped.get("createdAt", now)
    stamped["updatedAt"] = now
    return stamped


def validate_issue(args: argparse.Namespace) -> int:
    body = load_issue_body(args.issue_body_file)
    try:
        guide = parse_issue_guide(body)
    except SystemExit as exc:
        write_output("valid", "false")
        write_output("error", str(exc))
        print(str(exc), file=sys.stderr)
        return 1

    target_path = guide_repo_path(guide)
    write_output("valid", "true")
    write_output("guide_id", guide["id"])
    write_output("guide_language", guide["language"])
    write_output("guide_path", target_path.relative_to(ROOT).as_posix())
    write_output("guide_title", guide["title"])
    print(f"Guide submission is valid: {guide['id']} -> {target_path.relative_to(ROOT).as_posix()}")
    return 0


def export_issue(args: argparse.Namespace) -> int:
    body = load_issue_body(args.issue_body_file)
    guide = parse_issue_guide(body)
    target_path = guide_repo_path(guide)
    issue_number = os.environ.get("ISSUE_NUMBER", "").strip()

    if issue_number:
        publication_map = load_publication_map()
        previous = publication_map.get("issues", {}).get(issue_number)
        previous_path_value = previous.get("path") if isinstance(previous, dict) else None
        if previous_path_value:
            previous_path = ROOT / previous_path_value
            if previous_path != target_path and previous_path.exists():
                previous_path.unlink()
                remove_empty_guide_dirs(previous_path)

    target_path.parent.mkdir(parents=True, exist_ok=True)
    stamped = stamp_guide_dates(guide, target_path)
    target_path.write_text(json.dumps(stamped, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if issue_number:
        publication_map = load_publication_map()
        publication_map.setdefault("issues", {})[issue_number] = {
            "guideId": stamped["id"],
            "language": stamped["language"],
            "path": target_path.relative_to(ROOT).as_posix(),
            "updatedAt": stamped["updatedAt"]
        }
        write_publication_map(publication_map)

    write_output("guide_id", stamped["id"])
    write_output("guide_language", stamped["language"])
    write_output("guide_path", target_path.relative_to(ROOT).as_posix())
    print(f"Exported guide to {target_path.relative_to(ROOT).as_posix()}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate or export TerraPath guide submissions from issue bodies.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    validate_parser = subparsers.add_parser("validate-issue", help="Validate guide JSON from an issue body.")
    validate_parser.add_argument("--issue-body-file", help="Optional path to a text file containing the issue body.")
    validate_parser.set_defaults(func=validate_issue)

    export_parser = subparsers.add_parser("export-issue", help="Export guide JSON from an issue body into guides/.")
    export_parser.add_argument("--issue-body-file", help="Optional path to a text file containing the issue body.")
    export_parser.set_defaults(func=export_issue)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
