import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from build_calamity_support import BOSS_WIKI_ICON_OVERRIDES, ROOT


API_URL = "https://calamitymod.wiki.gg/api.php"
USER_AGENT = "TerraPathHub/0.1 maintainer data import"

WIKI_FILE_TITLES = {
    "CalamityMod/Anahita": "File:Anahita map.png",
    "CalamityMod/AquaticScourgeHead": "File:Aquatic Scourge map.png",
    "CalamityMod/AresBody": "File:Exo Mechs.png",
    "CalamityMod/AstrumAureus": "File:Astrum Aureus map.png",
    "CalamityMod/AstrumDeusHead": "File:Astrum Deus map.png",
    "CalamityMod/BrimstoneElemental": "File:Brimstone Elemental map.png",
    "CalamityMod/CalamitasClone": "File:Calamitas Clone map.png",
    "CalamityMod/CeaselessVoid": "File:Ceaseless Void map.png",
    "CalamityMod/Crabulon": "File:Crabulon map.png",
    "CalamityMod/Cryogen": "File:Cryogen map.png",
    "CalamityMod/DesertScourgeHead": "File:Desert Scourge map.png",
    "CalamityMod/Dragonfolly": "File:Dragonfolly map.png",
    "CalamityMod/HiveMind": "File:Hive Mind map.png",
    "CalamityMod/Leviathan": "File:Leviathan map.png",
    "CalamityMod/OldDuke": "File:The Old Duke map.png",
    "CalamityMod/PerforatorHive": "File:Perforator Hive map.png",
    "CalamityMod/PlaguebringerGoliath": "File:Plaguebringer Goliath map.png",
    "CalamityMod/Polterghast": "File:Polterghast map.png",
    "CalamityMod/PrimordialWyrmHead": "File:Primordial Wyrm map.png",
    "CalamityMod/ProfanedGuardianCommander": "File:Guardian Defender map.png",
    "CalamityMod/Providence": "File:Providence map.png",
    "CalamityMod/RavagerBody": "File:Ravager map.png",
    "CalamityMod/Signus": "File:Signus map.png",
    "CalamityMod/SlimeGodCore": "File:Slime God Core map.png",
    "CalamityMod/StormWeaverHead": "File:Storm Weaver map.png",
    "CalamityMod/SupremeCalamitas": "File:Calamitas map.png",
    "CalamityMod/ThanatosHead": "File:XM-05 Thanatos Head.png",
    "CalamityMod/DevourerofGodsHead": "File:Devourer of Gods map.png",
    "CalamityMod/THELORDE": "File:THE LORDE map.png",
    "CalamityMod/Yharon": "File:Yharon map.png",
    "CalamityMod/CloudElemental": "File:Cloud Elemental.png",
    "CalamityMod/CragmawMire": "File:Cragmaw Mire map.png",
    "CalamityMod/EarthElemental": "File:Earth Elemental.png",
    "CalamityMod/GiantClam": "File:Giant Clam map.png",
    "CalamityMod/GreatSandShark": "File:Great Sand Shark map.png",
    "CalamityMod/Mauler": "File:Mauler map.png",
    "CalamityMod/NuclearTerror": "File:Nuclear Terror map.png",
}


def fetch_json(url: str) -> dict:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def fetch_bytes(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                return response.read()
        except Exception as error:
            last_error = error
            if attempt < 2:
                time.sleep(1.5 * (attempt + 1))
    raise last_error or RuntimeError(f"Could not download {url}")


def resolve_image_urls() -> dict[str, str]:
    missing_mapping = sorted(set(BOSS_WIKI_ICON_OVERRIDES) - set(WIKI_FILE_TITLES))
    if missing_mapping:
        raise SystemExit(f"Missing wiki file mapping for: {', '.join(missing_mapping)}")

    title_to_id = {title: content_id for content_id, title in WIKI_FILE_TITLES.items()}
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "titles": "|".join(title_to_id),
            "prop": "imageinfo",
            "iiprop": "url",
            "format": "json",
        }
    )
    data = fetch_json(f"{API_URL}?{params}")
    resolved: dict[str, str] = {}
    missing: list[str] = []

    for page in data.get("query", {}).get("pages", {}).values():
        title = page.get("title")
        content_id = title_to_id.get(title)
        if not content_id:
            continue
        image_info = page.get("imageinfo") or []
        image_url = image_info[0].get("url") if image_info else None
        if image_url:
            resolved[content_id] = image_url
        else:
            missing.append(f"{content_id} ({title})")

    missing.extend(
        f"{content_id} ({title})"
        for title, content_id in title_to_id.items()
        if content_id not in resolved and f"{content_id} ({title})" not in missing
    )
    if missing:
        raise SystemExit(f"Could not resolve wiki icons: {', '.join(missing)}")

    return resolved


def main() -> int:
    resolved = resolve_image_urls()
    for content_id, image_url in sorted(resolved.items()):
        relative_icon = BOSS_WIKI_ICON_OVERRIDES[content_id]
        target = ROOT / "docs" / relative_icon
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() and target.stat().st_size > 0:
            print(f"{content_id}: {relative_icon} (cached)")
            continue
        target.write_bytes(fetch_bytes(image_url))
        print(f"{content_id}: {relative_icon}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
