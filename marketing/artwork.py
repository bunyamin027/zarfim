"""App Store header (3840x1646) ve arama sonucu (1920x1280) görselleri, metinsiz."""
import os, compose as c
SIZES={'header':(3840,1646),'search':(1920,1280)}
for l in ['tr','en','ar']:
    shots=[c.b64(os.path.join(c.ROOT,'raw','iphone',l,f+'.png')) for f in ['04-incomes','01-home','05-reports','03-envelope','06-expenses']]
    for kind,(W,H) in SIZES.items():
        n=5 if kind=='header' else 3
        sel=shots if n==5 else shots[:3]
        pw=H*0.36 if kind=='header' else H*0.40
        mid=(n-1)/2
        phones=''
        for i,img in enumerate(sel):
            off=i-mid; z=10-int(abs(off)*3)
            sc=1-abs(off)*0.12; x=W/2+off*pw*(0.95 if kind=='header' else 0.82)-pw/2; y=H*0.12+abs(off)*H*0.06
            phones+=f'<div style="position:absolute;left:{x}px;top:{y}px;z-index:{z};transform:scale({sc}) rotate({off*5}deg);transform-origin:50% 0">{c.phone(img,pw)}</div>'
        env=''
        import random; random.seed(len(l)+W)
        for k in range(9):
            ex=random.uniform(0,W); ey=random.uniform(0,H); ew=random.uniform(.06,.11)*W*(0.6 if kind=='header' else 1); col=random.choice(['#F5C24B','#E2563A','#2E8B6A','#FFF3D6','#7A3FB0'])
            env+=f'<div class=env style="left:{ex}px;top:{ey}px;width:{ew}px;height:{ew*.66}px;background:{col};transform:rotate({random.uniform(-30,30)}deg)"></div>'
        html=f"""<!doctype html><html><head><meta charset=utf-8><style>*{{margin:0}}html,body{{width:{W}px;height:{H}px;overflow:hidden}}
body{{position:relative;background:radial-gradient(70% 90% at 50% 40%,#2E8B6A 0%,#1F4E79 45%,#0F1A3A 80%,#0a0f1f)}}
.dev{{background:linear-gradient(145deg,#2b2f3a,#0d0f14);box-shadow:0 {H*.05}px {H*.1}px rgba(0,0,0,.55)}}.dev img{{width:100%;display:block}}
.env{{position:absolute;border-radius:{W*.006}px;opacity:.85;box-shadow:0 {H*.02}px {H*.04}px rgba(0,0,0,.35);filter:blur(1px)}}
.env:after{{content:'';position:absolute;inset:0;background:linear-gradient(155deg,transparent 49%,rgba(0,0,0,.18) 50%),linear-gradient(25deg,transparent 49%,rgba(0,0,0,.12) 50%)}}
.glow{{position:absolute;border-radius:50%;filter:blur({H*.12}px)}}</style></head><body>
<div class=glow style="width:{W*.4}px;height:{W*.4}px;background:#F5C24B;opacity:.35;left:{W*.3}px;top:{H*.35}px"></div>
<div class=glow style="width:{W*.3}px;height:{W*.3}px;background:#E2563A;opacity:.3;left:{-W*.05}px;top:{-H*.2}px"></div>
<div class=glow style="width:{W*.3}px;height:{W*.3}px;background:#7A3FB0;opacity:.3;right:{-W*.05}px;bottom:{-H*.3}px"></div>
{env}{phones}</body></html>"""
        out=os.path.join(c.ROOT,'out','appstore_art',kind,f'{l}.png'); c.render(html,W,H,out); print(out)
