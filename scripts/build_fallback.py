import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

BASE = "https://raw.githubusercontent.com/semarketir/quranjson/master/source"
OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "data" / "quran-fallback.json"

SURAH_META_URL = f"{BASE}/surah.json"
ARABIC_TEMPLATE = f"{BASE}/surah/surah_%d.json"
EN_TRANSLATION_TEMPLATE = f"{BASE}/translation/en/en_translation_%d.json"

HEADERS = {"User-Agent": "Mozilla/5.0 (AlfawzQuran fallback builder)"}


def fetch_json(url):
    request = Request(url, headers=HEADERS)
    with urlopen(request, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError(f"Failed to fetch {url}: HTTP {response.status}")
        data = response.read()
    return json.loads(data.decode("utf-8"))


def build_juz_lookup(meta):
    lookup = {}
    for block in meta.get("juz", []) or []:
        try:
            juz_index = int(block.get("index", "0"))
        except ValueError:
            continue
        verse_range = block.get("verse") or {}
        start_raw = verse_range.get("start", "")
        end_raw = verse_range.get("end", "")
        try:
            start = int(start_raw.split("_")[1])
            end = int(end_raw.split("_")[1])
        except (IndexError, ValueError):
            continue
        for verse_num in range(start, end + 1):
            lookup[verse_num] = juz_index
    return lookup


def main():
    os.makedirs(OUTPUT.parent, exist_ok=True)
    metadata = fetch_json(SURAH_META_URL)
    result = {
        "source": "semarketir/quranjson",
        "translation": "en.pickthall",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "surahs": [],
    }

    for entry in metadata:
        index_str = entry.get("index") or "0"
        try:
            surah_id = int(index_str)
        except ValueError:
            continue
        print(f"Fetching surah {surah_id}")
        arabic_url = ARABIC_TEMPLATE % surah_id
        translation_url = EN_TRANSLATION_TEMPLATE % surah_id
        arabic_payload = fetch_json(arabic_url)
        translation_payload = fetch_json(translation_url)
        arabic_verses = arabic_payload.get("verse", {})
        translation_verses = translation_payload.get("verse", {})
        verse_keys = sorted(arabic_verses.keys(), key=lambda k: int(k.split("_")[1]))
        total = len(verse_keys)
        juz_lookup = build_juz_lookup(entry)

        verses = []
        for key in verse_keys:
            try:
                verse_number = int(key.split("_")[1])
            except (IndexError, ValueError):
                continue
            verses.append({
                "surah_id": surah_id,
                "verse_id": verse_number,
                "verse_key": f"{surah_id}:{verse_number}",
                "surah_name": entry.get("title", ""),
                "surah_name_ar": arabic_payload.get("name", ""),
                "total_verses": total,
                "juz": juz_lookup.get(verse_number),
                "arabic": arabic_verses.get(key, ""),
                "translation": translation_verses.get(key, ""),
                "transliteration": "",
            })

        result["surahs"].append({
            "id": surah_id,
            "english_name": entry.get("title", ""),
            "arabic_name": arabic_payload.get("name", ""),
            "verses": verses,
        })

    with open(OUTPUT, "w", encoding="utf-8") as handle:
        json.dump(result, handle, ensure_ascii=False)
        handle.write("\n")
    print(f"Wrote fallback dataset to {OUTPUT}")


if __name__ == "__main__":
    main()
