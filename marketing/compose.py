"""
Zarfım store görsel üretici.
Ham ekran görüntülerini (marketing/raw/<platform>/<lang>/NN.png) canlı
pazarlama görsellerine çevirir (marketing/out/...). Chrome headless kullanır.

Kullanım: python3 marketing/compose.py [lang ...]
"""
import json, os, subprocess, sys, base64, tempfile, html

ROOT = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
COPY = json.load(open(os.path.join(ROOT, "copy.json"), encoding="utf-8"))

# Slayt temaları: (gradyan başlangıç, bitiş, vurgu)
THEMES = [
    ("#0F2A4A", "#1F6B52", "#F5C24B"),
    ("#E2563A", "#F29A3B", "#FFF3D6"),
    ("#123C33", "#2E8B6A", "#FFD36B"),
    ("#3B1F6B", "#7A3FB0", "#FFC6E6"),
    ("#0E3B5C", "#1E88B5", "#FFE07A"),
    ("#7A1F2B", "#D2453A", "#FFE1B0"),
    ("#1C2541", "#3A506B", "#F5C24B"),
    ("#0B5D4B", "#16A085", "#FFF3B0"),
    ("#2A1A05", "#C9973A", "#FFF7E0"),
    ("#1C2541", "#C1442D", "#F5C24B"),
]

TARGETS = {
    # ad: (genişlik, yükseklik, ham klasör)
    "ios_69": (1320, 2868, "iphone"),
    "ios_65": (1284, 2778, "iphone"),
    "ipad_13": (2064, 2752, "ipad"),
    "ios_duo": (2007, 2853, "ipad"),
    "play_phone": (1080, 1920, "iphone"),
    "play_tab10": (1600, 2560, "ipad"),
    "play_tab7": (1200, 1920, "ipad"),
}


def b64(path):
    with open(path, "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()


def phone(img, w, tablet=False, tilt=0, extra=""):
    radius = 0.075 * w if tablet else 0.135 * w
    bezel = 0.022 * w if tablet else 0.032 * w
    return f"""<div class="dev {extra}" style="width:{w}px;border-radius:{radius}px;padding:{bezel}px;transform:rotate({tilt}deg)">
      <img src="{img}" style="border-radius:{radius - bezel}px"></div>"""


def slide_html(lang, idx, W, H, raw_dir, kind):
    c = COPY[lang]["slides"][idx]
    g1, g2, acc = THEMES[idx % len(THEMES)]
    rtl = lang == "ar"
    tablet = kind == "ipad"
    font_h = "'Cairo'" if rtl else "'Fraunces'"
    font_b = "'Cairo'" if rtl else "'Manrope'"
    s = W / 1320  # ölçek
    if tablet:
        s = W / 2064 * 1.75
    land = H / W < 1.5  # tablet oranı

    shots = c.get("shots", [c.get("shot")])
    if len(shots) > 1:
        # Çoklu telefon kolajı (dil slaytı)
        pw = W * (0.36 if not tablet else 0.38)
        devs = ""
        for i, (sl, sh) in enumerate(shots):
            p = os.path.join(ROOT, "raw", raw_dir, sl, f"{sh}.png")
            off = (i - 1)
            devs += f"""<div class="multi" style="left:{W/2 - pw/2 + off*pw*0.78}px;top:{H*(0.36 if off==0 else 0.42)}px;z-index:{3 if off==0 else 1};">
                {phone(b64(p), pw, tablet, off*6)}</div>"""
        device = devs
    else:
        p = os.path.join(ROOT, "raw", raw_dir, lang, f"{shots[0]}.png")
        pw = W * (0.80 if not tablet else 0.74)
        if land:
            pw = W * 0.76
        device = f"""<div class="single" style="left:{(W-pw)/2}px;top:{H*(0.30 if not land else 0.37)}px">
            {phone(b64(p), pw, tablet)}</div>"""

    chips = ""
    for i, ch in enumerate(c.get("chips", [])):
        side = ("right" if i % 2 == 0 else "left") if not rtl else ("left" if i % 2 == 0 else "right")
        top = H * (0.47 + i * 0.17)
        chips += f"""<div class="chip" style="{side}:{W*0.035}px;top:{top}px;animation-delay:{i}s">
          <span class="ci">{html.escape(ch[0])}</span><span>{html.escape(ch[1])}</span></div>"""

    eyebrow = html.escape(c.get("eyebrow", ""))
    title = c["title"].replace("*", "")
    # *vurgulu* kelimeler
    parts = c["title"].split("*")
    title_html = "".join(f'<em>{html.escape(t)}</em>' if i % 2 else html.escape(t) for i, t in enumerate(parts))
    sub = html.escape(c.get("sub", ""))

    return f"""<!doctype html><html dir="{'rtl' if rtl else 'ltr'}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800;9..144,900&family=Manrope:wght@500;700;800&family=Cairo:wght@600;800;900&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px;overflow:hidden}}
body{{background:radial-gradient(120% 80% at {'0%' if not rtl else '100%'} 0%, {g2} 0%, {g1} 60%, #0a0f1f 140%);font-family:{font_b},sans-serif;color:#fff;position:relative}}
.glow{{position:absolute;border-radius:50%;filter:blur({90*s}px);opacity:.55}}
.stamp{{position:absolute;border:{6*s}px dashed rgba(255,255,255,.14);border-radius:{40*s}px}}
.head{{position:absolute;left:{W*0.07}px;right:{W*0.07}px;top:{H*(0.05 if not land else 0.045)}px;text-align:{'right' if rtl else 'left'}}}
.eyebrow{{display:inline-block;font-weight:800;letter-spacing:{0 if rtl else 6*s}px;text-transform:uppercase;font-size:{34*s}px;color:#1b1b1b;background:{acc};padding:{12*s}px {28*s}px;border-radius:{60*s}px;margin-bottom:{30*s}px;box-shadow:0 {10*s}px {30*s}px rgba(0,0,0,.25)}}
h1{{font-family:{font_h},serif;font-weight:900;font-size:{(118 if not rtl else 104)*s}px;line-height:{1.04 if not rtl else 1.35};letter-spacing:{0 if rtl else -2*s}px;text-shadow:0 {6*s}px {30*s}px rgba(0,0,0,.3)}}
h1 em{{font-style:{'normal' if rtl else 'italic'};color:{acc}}}
.sub{{margin-top:{28*s}px;font-size:{44*s}px;line-height:1.4;font-weight:500;opacity:.92;max-width:{W*0.86}px}}
.dev{{background:linear-gradient(145deg,#2b2f3a,#0d0f14);box-shadow:0 {60*s}px {120*s}px rgba(0,0,0,.55),0 0 0 {3*s}px rgba(255,255,255,.18) inset}}
.dev img{{width:100%;display:block}}
.single,.multi{{position:absolute}}
.chip{{position:absolute;z-index:9;display:flex;align-items:center;gap:{18*s}px;background:rgba(255,255,255,.96);color:#1C2541;font-weight:800;font-size:{38*s}px;padding:{22*s}px {34*s}px;border-radius:{34*s}px;box-shadow:0 {24*s}px {60*s}px rgba(0,0,0,.35)}}
.chip .ci{{font-size:{50*s}px}}
.brand{{position:absolute;bottom:{H*0.025}px;width:100%;text-align:center;font-family:'Fraunces',serif;font-weight:800;font-size:{40*s}px;opacity:.85;z-index:10}}
</style></head><body>
<div class="glow" style="width:{W*0.9}px;height:{W*0.9}px;background:{acc};{'right' if not rtl else 'left'}:{-W*0.45}px;top:{H*0.38}px"></div>
<div class="glow" style="width:{W*0.7}px;height:{W*0.7}px;background:{g2};{'left' if not rtl else 'right'}:{-W*0.3}px;bottom:{-H*0.05}px"></div>
<div class="stamp" style="width:{W*0.5}px;height:{W*0.36}px;{'right' if not rtl else 'left'}:{-W*0.12}px;top:{H*0.03}px;transform:rotate(12deg)"></div>
<div class="head">{'<div class="eyebrow">'+eyebrow+'</div>' if eyebrow else ''}<h1>{title_html}</h1>{'<div class="sub">'+sub+'</div>' if sub else ''}</div>
{device}{chips}
</body></html>"""


def render(html_str, W, H, out):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html_str)
        tmp = f.name
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    f"--window-size={W},{H}", "--force-device-scale-factor=1",
                    "--virtual-time-budget=6000", f"--screenshot={out}", "file://" + tmp],
                   check=True, capture_output=True)
    os.unlink(tmp)
    # alfa kanalını kaldır (App Store şartı)
    subprocess.run(["python3", "-c", f"from PIL import Image;Image.open('{out}').convert('RGB').save('{out}')"], check=True)


def main():
    langs = sys.argv[1:] or ["tr", "en", "ar"]
    targets = os.environ.get("TARGETS", ",".join(TARGETS)).split(",")
    for lang in langs:
        n = len(COPY[lang]["slides"])
        for t in targets:
            W, H, raw = TARGETS[t]
            limit = 8 if t.startswith("play") else 10
            for i in range(min(n, limit)):
                out = os.path.join(ROOT, "out", t, lang, f"{i+1:02d}.png")
                render(slide_html(lang, i, W, H, raw, raw), W, H, out)
                print(out)


if __name__ == "__main__":
    main()
