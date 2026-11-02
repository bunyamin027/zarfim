"""Play feature graphic 1024x500 (dil başına)."""
import os, compose as c
T={'tr':('Her kuruşun bir <em>zarfı</em> olsun.','Zarf usulü bütçe • Harcama takibi'),
   'en':('Give every dollar an <em>envelope.</em>','Envelope budgeting • Expense tracker'),
   'ar':('لكل ريال <em>ظرفه</em> الخاص.','ميزانية الظروف • تتبع المصاريف')}
for l,(h,s) in T.items():
    rtl=l=='ar'; f="'Cairo'" if rtl else "'Fraunces'"
    shot=c.b64(os.path.join(c.ROOT,'raw','iphone',l,'01-home.png'))
    html=f"""<!doctype html><html dir="{'rtl' if rtl else 'ltr'}"><head><meta charset=utf-8>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,900;1,900&family=Manrope:wght@700&family=Cairo:wght@800&display=swap" rel=stylesheet>
<style>*{{margin:0}}html{{width:1024px;height:500px;overflow:hidden}}body{{width:1024px;height:500px;overflow:hidden;position:relative;color:#fff;
background:radial-gradient(90% 120% at {'0%' if not rtl else '100%'} 0%,#1F6B52,#0F2A4A 65%,#0a0f1f)}}
.t{{position:absolute;{'left' if not rtl else 'right'}:56px;top:110px;width:560px}}
h1{{font:900 {54 if not rtl else 50}px {f},serif;line-height:{1.08 if not rtl else 1.4}}} em{{color:#F5C24B;font-style:{'italic' if not rtl else 'normal'}}}
p{{margin-top:22px;font:700 24px 'Manrope',{f};opacity:.9}}
.logo{{font:900 30px 'Fraunces';color:#F5C24B;margin-bottom:18px}}
.ph{{position:absolute;{'right' if not rtl else 'left'}:70px;top:40px;width:300px;border-radius:44px;padding:10px;background:#111;transform:rotate({-8 if not rtl else 8}deg);box-shadow:0 30px 70px rgba(0,0,0,.6)}}
.ph img{{width:100%;border-radius:36px;display:block}}
.g{{position:absolute;width:500px;height:500px;border-radius:50%;background:#F5C24B;filter:blur(110px);opacity:.35;{'right' if not rtl else 'left'}:-120px;top:120px}}</style></head>
<body><div class=g></div><div class=t><div class=logo>✉️ Zarfım</div><h1>{h}</h1><p>{s}</p></div><div class=ph><img src="{shot}"></div></body></html>"""
    out=os.path.join(c.ROOT,'out','play_feature',f'{l}.png'); c.render(html,1024,500,out); print(out)
