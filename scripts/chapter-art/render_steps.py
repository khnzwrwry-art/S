"""Render the step pictures.

  public/images/<biz>/<chapter>.jpg      4 steps of each chapter (from steps.py)
  public/images/<biz>/how-it-works.jpg   how the business works (from FLOWS in js/data.js)

Usage: python3 scripts/chapter-art/render_steps.py [out_dir] [biz,...]
"""
import sys, io, json, re, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
from steps import STEPS, FLOW_EXTRA, FLOW_ICONS  # noqa: E402

out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1] else ROOT / "public" / "images"
only = sys.argv[2].split(",") if len(sys.argv) > 2 and sys.argv[2] else None

data_js = (ROOT / "js" / "data.js").read_text()
NAMES = dict(re.findall(r"\{id:'(\w+)',name:'([^']+)'", data_js))
FLOWS = {k: re.findall(r"'([^']+)'", v) for k, v in re.findall(r"^ (\w+):\{nodes:\[([^\]]+)\]", data_js, re.M)}
FLOWS.update({k: v for k, v in FLOW_EXTRA.items() if k not in FLOWS})

# Sanity check: every chapter has exactly 4 labels matching its 4 checklist items.
for biz, chs in STEPS.items():
    d = json.loads((ROOT / "public" / "data" / f"{biz}.json").read_text())
    ids = [c["id"] for c in d["chapters"]]
    assert sorted(ids) == sorted(chs), (biz, set(ids) ^ set(chs))
    for c in d["chapters"]:
        assert len(chs[c["id"]]) == len(c["checklist"]) == 4, (biz, c["id"])

def save(pg, path):
    png = pg.locator("#card").screenshot(type="png")
    Image.open(io.BytesIO(png)).convert("RGB").resize((1280, 720), Image.LANCZOS).save(
        path, "JPEG", quality=86, optimize=True, progressive=True)

with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width": 1600, "height": 900})
    pg.goto((HERE / "steps.html").as_uri())
    for biz in only or STEPS:
        (out / biz).mkdir(parents=True, exist_ok=True)
        for ch, steps in STEPS[biz].items():
            pg.evaluate("([b,s])=>render(b,s,'')", [biz, [list(x) for x in steps]])
            save(pg, out / biz / f"{ch}.jpg")
        nodes = FLOWS[biz]
        steps = [[n, FLOW_ICONS[biz][i]] for i, n in enumerate(nodes)]
        pg.evaluate("([b,s,t])=>render(b,s,t)", [biz, steps, f"How {NAMES[biz]} works"])
        save(pg, out / biz / "how-it-works.jpg")
    b.close()
print("done", out)
