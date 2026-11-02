"""App Preview videoları: raw ekranlardan hareketli, başlıklı 27 sn video.
Kullanım: python3 marketing/preview.py  -> marketing/out/preview/<cihaz>/<dil>.mp4
"""
import json, os, subprocess, tempfile

ROOT = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
COPY = json.load(open(os.path.join(ROOT, "copy.json"), encoding="utf-8"))
SCENES = [0, 1, 2, 3, 4, 5, 6, 7]  # slayt indeksleri (premium/fiyat ekranı hariç)
DUR = 3.375  # 8 * 3.375 = 27 sn
DEV = {"iphone": (886, 1920), "ipad": (1200, 1600)}
COLORS = ["#1F6B52", "#E2563A", "#2E8B6A", "#7A3FB0", "#1E88B5", "#D2453A", "#3A506B", "#C9973A"]


def caption_png(text, eyebrow, W, h, color, rtl, out):
    font = "'Cairo'" if rtl else "'Fraunces'"
    t = text.replace("*", "")
    html = f"""<!doctype html><html dir="{'rtl' if rtl else 'ltr'}"><head><meta charset=utf-8>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@800&family=Manrope:wght@800&family=Cairo:wght@800&display=swap" rel=stylesheet>
<style>*{{margin:0}}body{{width:{W}px;height:{h}px;background:{color};color:#fff;display:flex;flex-direction:column;justify-content:center;padding:0 {W*0.06}px;box-sizing:border-box}}
small{{font:800 {W*0.03}px 'Manrope',{font};letter-spacing:{0 if rtl else 3}px;color:#FFE07A}}
b{{font:800 {W*0.07}px {font},serif;line-height:1.15}}</style></head>
<body><small>{eyebrow}</small><b>{t}</b></body></html>"""
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html)
    subprocess.run([CHROME, "--headless=new", "--hide-scrollbars", f"--window-size={W},{h}",
                    "--force-device-scale-factor=1", "--virtual-time-budget=5000",
                    f"--screenshot={out}", "file://" + f.name], check=True, capture_output=True)


def build(kind, lang):
    W, H = DEV[kind]
    cap_h = int(H * 0.2)
    rtl = lang == "ar"
    tmp = tempfile.mkdtemp()
    clips = []
    for n, i in enumerate(SCENES):
        s = COPY[lang]["slides"][i]
        raw = os.path.join(ROOT, "raw", kind, lang, s["shot"] + ".png")
        cap = os.path.join(tmp, f"c{n}.png")
        caption_png(s["title"], s["eyebrow"], W, cap_h, COLORS[n], rtl, cap)
        clip = os.path.join(tmp, f"v{n}.mp4")
        fr = int(DUR * 30)
        area_h = H - cap_h
        # ekran görüntüsünü alan genişliğine ölçekle, yavaşça aşağı kaydır + hafif zoom
        vf = (f"[0:v]scale={W}:-2,zoompan=z='1+0.0006*on':x='iw/2-(iw/zoom/2)':"
              f"y='(ih-{area_h})*on/{fr}*0.35':d={fr}:s={W}x{area_h}:fps=30[s];"
              f"[1:v][s]vstack=inputs=2,format=yuv420p,fade=t=in:st=0:d=0.25")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", raw, "-loop", "1", "-i", cap,
                        "-filter_complex", vf, "-t", str(DUR), "-r", "30", "-c:v", "libx264",
                        "-preset", "slow", "-crf", "16", clip], check=True)
        clips.append(clip)
    lst = os.path.join(tmp, "l.txt")
    open(lst, "w").write("".join(f"file '{c}'\n" for c in clips))
    out = os.path.join(ROOT, "out", "preview", kind, f"{lang}.mp4")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst,
                    "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-shortest",
                    "-c:v", "libx264", "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p",
                    "-r", "30", "-b:v", "10M", "-c:a", "aac", "-b:a", "256k", out], check=True)
    print(out)


if __name__ == "__main__":
    for k in DEV:
        for l in ["tr", "en", "ar"]:
            build(k, l)
