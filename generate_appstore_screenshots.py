import os
import subprocess

OUTPUT_DIRS = [
    "/Users/teknopark/Desktop/mobil/4-Zarfim/zarfim ss/11 promax/ingilizce",
    "/Users/teknopark/Desktop/mobil/4-Zarfim/app_store_screenshots/en"
]

for d in OUTPUT_DIRS:
    os.makedirs(d, exist_ok=True)

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Base CSS template for 1242 x 2688 App Store screenshots
BASE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {{
    --bg-dark: #122B22;
    --bg-dark-accent: #0E221B;
    --gold: #C9973A;
    --gold-light: #DFC07A;
    --paper: #F4EEDF;
    --paper-card: #EFE6D3;
    --paper-card-light: #FAF6ED;
    --ink: #1C2541;
    --ink-muted: #55627A;
    --sage: #2E6B4F;
    --sage-light: #488E6B;
    --stamp: #C1442D;
    --muted-green: #9CB8AA;
    --border-color: #D8CEB6;
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1242px;
    height: 2688px;
    background: radial-gradient(circle at 50% 15%, #18372C 0%, #122B22 65%, #0B1D17 100%);
    font-family: 'Manrope', -apple-system, sans-serif;
    position: relative;
    overflow: hidden;
    color: #FAF6ED;
    display: flex;
    flex-direction: column;
    padding: 160px 84px 90px;
    -webkit-font-smoothing: antialiased;
  }}

  /* Background Watermark Envelope */
  .bg-watermark {{
    position: absolute;
    top: 60px;
    right: -100px;
    width: 780px;
    height: 560px;
    opacity: 0.045;
    pointer-events: none;
    transform: rotate(14deg);
  }}

  /* Top Typography Area */
  .header-area {{
    margin-bottom: 70px;
    position: relative;
    z-index: 2;
  }}
  .tagline {{
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .tagline::before {{
    content: '';
    display: inline-block;
    width: 32px;
    height: 3px;
    background: var(--gold);
    border-radius: 2px;
  }}
  .headline {{
    font-family: 'Fraunces', Georgia, serif;
    font-size: 84px;
    font-weight: 600;
    line-height: 1.14;
    color: #FAF6ED;
    margin-bottom: 26px;
    letter-spacing: -0.02em;
  }}
  .subtitle {{
    font-size: 32px;
    font-weight: 500;
    line-height: 1.48;
    color: var(--muted-green);
    max-width: 980px;
  }}

  /* Phone Mockup Container */
  .phone-container {{
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
  }}
  .phone {{
    width: 1060px;
    background: var(--paper);
    border-radius: 54px;
    box-shadow: 0 44px 120px rgba(0, 0, 0, 0.65), 0 0 0 2px rgba(255, 255, 255, 0.08);
    padding: 44px 46px 54px;
    display: flex;
    flex-direction: column;
    position: relative;
    color: var(--ink);
  }}

  /* Phone Statusbar */
  .statusbar {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px 36px;
    font-size: 25px;
    font-weight: 700;
    color: var(--ink);
  }}
  .status-icons {{
    display: flex;
    align-items: center;
    gap: 14px;
  }}

  /* Envelope Card Component */
  .envelope-card {{
    background: var(--paper-card-light);
    border: 2.5px solid var(--border-color);
    border-radius: 28px;
    padding: 32px 34px 28px;
    margin-bottom: 24px;
    box-shadow: 0 6px 16px rgba(28, 37, 65, 0.04);
    position: relative;
  }}
  .envelope-top {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }}
  .envelope-title-wrap {{
    display: flex;
    align-items: center;
    gap: 18px;
  }}
  .envelope-icon {{
    width: 58px;
    height: 48px;
    border: 2.5px solid var(--border-color);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFF;
    color: var(--ink);
  }}
  .envelope-name {{
    font-size: 32px;
    font-weight: 700;
    color: var(--ink);
  }}
  .envelope-amounts {{
    font-size: 26px;
    font-weight: 600;
    color: var(--ink-muted);
  }}
  .envelope-spent {{
    font-size: 32px;
    font-weight: 700;
    color: var(--ink);
    margin-right: 6px;
  }}
  .progress-track {{
    height: 12px;
    background: #E5DEC9;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }}
  .progress-fill {{
    height: 100%;
    border-radius: 8px;
  }}
  .fill-sage {{ background: var(--sage); }}
  .fill-gold {{ background: var(--gold); }}
  .fill-stamp {{ background: var(--stamp); }}

  /* Footer Brand */
  .footer-brand {{
    text-align: center;
    padding-top: 36px;
    font-family: 'Fraunces', Georgia, serif;
    font-size: 34px;
    font-weight: 600;
    color: #FAF6ED;
    letter-spacing: 0.04em;
    opacity: 0.95;
    position: relative;
    z-index: 2;
  }}
</style>
</head>
<body>

<svg class="bg-watermark" viewBox="0 0 100 70" fill="none" stroke="#FAF6ED" stroke-width="1.5">
  <rect x="2" y="2" width="96" height="66" rx="6" />
  <path d="M4 6 L50 42 L96 6" />
</svg>

<div class="header-area">
  <div class="tagline">{tagline}</div>
  <h1 class="headline">{headline}</h1>
  <p class="subtitle">{subtitle}</p>
</div>

<div class="phone-container">
  <div class="phone">
    <div class="statusbar">
      <span>9:41</span>
      <div class="status-icons">
        <svg width="28" height="20" viewBox="0 0 28 20" fill="currentColor">
          <circle cx="4" cy="16" r="3"/>
          <circle cx="12" cy="13" r="3"/>
          <circle cx="20" cy="10" r="3"/>
        </svg>
        <svg width="24" height="20" viewBox="0 0 24 20" fill="currentColor">
          <path d="M12 4C7.5 4 3.6 5.8 0.8 8.7L12 20L23.2 8.7C20.4 5.8 16.5 4 12 4Z"/>
        </svg>
        <svg width="34" height="18" viewBox="0 0 34 18" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="2" y="2" width="26" height="14" rx="4"/>
          <rect x="4" y="4" width="16" height="10" rx="2" fill="currentColor"/>
          <path d="M30 6v6" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    {phone_content}

  </div>
</div>

<div class="footer-brand">Zarfım — Envelope Budget Tracker</div>

</body>
</html>
"""

# Screen 1: Home / Envelope Budgeting
CONTENT_SCREEN_1 = """
    <!-- App Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 28px;">
      <div>
        <div style="font-family:'Fraunces', serif; font-size:46px; font-weight:700; color:var(--ink);">Zarfım</div>
        <div style="font-size:24px; color:var(--ink-muted); margin-top:4px;">October Budget</div>
      </div>
      <div style="width:48px; height:48px; border-radius:50%; background:#E5DEC9; display:flex; align-items:center; justify-content:center; border:2px solid var(--border-color);">
        <div style="width:16px; height:16px; border-radius:50%; background:var(--sage);"></div>
      </div>
    </div>

    <!-- Balance Banner -->
    <div style="margin-bottom: 34px;">
      <div style="font-size:24px; color:var(--ink-muted); font-weight:600;">Remaining Monthly Balance</div>
      <div style="font-family:'Fraunces', serif; font-size:74px; font-weight:700; color:var(--ink); margin-top:6px; letter-spacing:-0.03em;">$4,250.00</div>
    </div>

    <!-- Envelopes List -->
    <div class="envelope-card">
      <div class="envelope-top">
        <div class="envelope-title-wrap">
          <div class="envelope-icon">
            <svg width="28" height="22" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="16" rx="3"/><path d="M2 3l10 8 10-8"/></svg>
          </div>
          <span class="envelope-name">Groceries</span>
        </div>
        <div class="envelope-amounts"><span class="envelope-spent">$1,200</span> / $1,500</div>
      </div>
      <div class="progress-track"><div class="progress-fill fill-sage" style="width: 80%;"></div></div>
    </div>

    <div class="envelope-card">
      <div class="envelope-top">
        <div class="envelope-title-wrap">
          <div class="envelope-icon">
            <svg width="28" height="22" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <span class="envelope-name">Rent & Housing</span>
        </div>
        <div class="envelope-amounts"><span class="envelope-spent">$3,000</span> / $3,000</div>
      </div>
      <div class="progress-track"><div class="progress-fill fill-gold" style="width: 100%;"></div></div>
    </div>

    <div class="envelope-card">
      <div class="envelope-top">
        <div class="envelope-title-wrap">
          <div class="envelope-icon">
            <svg width="28" height="22" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="16" rx="3"/><path d="M2 3l10 8 10-8"/></svg>
          </div>
          <span class="envelope-name">Transportation</span>
        </div>
        <div class="envelope-amounts"><span class="envelope-spent">$220</span> / $400</div>
      </div>
      <div class="progress-track"><div class="progress-fill fill-sage" style="width: 55%;"></div></div>
    </div>

    <!-- Income Envelope Card -->
    <div class="envelope-card" style="background:#F6F0E2; border-color:var(--gold);">
      <div class="envelope-top">
        <div class="envelope-title-wrap">
          <div class="envelope-icon" style="background:var(--gold); border-color:var(--gold); color:#FFF;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
          </div>
          <div>
            <span class="envelope-name">Monthly Income</span>
            <span style="background:var(--gold); color:#FFF; font-size:18px; font-weight:800; padding:2px 10px; border-radius:12px; margin-left:10px; text-transform:uppercase;">Added</span>
          </div>
        </div>
        <div style="font-family:'Fraunces', serif; font-size:36px; font-weight:700; color:var(--sage); letter-spacing:-0.01em;">+$8,500.00</div>
      </div>
    </div>

    <!-- Mini Chart Section -->
    <div style="margin-top: 18px; padding: 22px 30px; background:var(--paper-card); border-radius:24px; border:2px dashed var(--border-color);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <span style="font-size:22px; font-weight:700; color:var(--ink);">Spending Trend</span>
        <span style="font-size:20px; font-weight:600; color:var(--sage);">On Track</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:flex-end; height:75px; padding: 0 20px;">
        <div style="text-align:center;"><div style="width:34px; height:40px; background:#8EAA9B; border-radius:8px; margin:0 auto 8px;"></div><span style="font-size:18px; color:var(--ink-muted);">Jun</span></div>
        <div style="text-align:center;"><div style="width:34px; height:58px; background:#8EAA9B; border-radius:8px; margin:0 auto 8px;"></div><span style="font-size:18px; color:var(--ink-muted);">Jul</span></div>
        <div style="text-align:center;"><div style="width:34px; height:50px; background:#8EAA9B; border-radius:8px; margin:0 auto 8px;"></div><span style="font-size:18px; color:var(--ink-muted);">Aug</span></div>
        <div style="text-align:center;"><div style="width:34px; height:72px; background:var(--gold); border-radius:8px; margin:0 auto 8px;"></div><span style="font-size:18px; font-weight:700; color:var(--ink);">Sep</span></div>
        <div style="text-align:center;"><div style="width:34px; height:46px; background:var(--sage); border-radius:8px; margin:0 auto 8px;"></div><span style="font-size:18px; font-weight:700; color:var(--sage);">Oct</span></div>
      </div>
    </div>
"""

# Screen 2: Quick Expense Entry
CONTENT_SCREEN_2 = """
    <!-- Modal Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 30px;">
      <span style="font-size:28px; font-weight:700; color:var(--ink-muted);">Cancel</span>
      <span style="font-family:'Fraunces', serif; font-size:36px; font-weight:700; color:var(--ink);">Add Expense</span>
      <span style="font-size:28px; font-weight:700; color:var(--sage);">Done</span>
    </div>

    <!-- Large Amount Display Box -->
    <div style="background:var(--paper-card-light); border:2.5px solid var(--border-color); border-radius:32px; padding: 40px 30px; text-align:center; margin-bottom: 34px;">
      <div style="font-size:22px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-muted); margin-bottom:8px;">Amount to Deduct</div>
      <div style="font-family:'Fraunces', serif; font-size:94px; font-weight:700; color:var(--ink); letter-spacing:-0.03em; display:flex; justify-content:center; align-items:center;">
        <span>$48.50</span>
        <span style="display:inline-block; width:4px; height:80px; background:var(--gold); margin-left:8px; border-radius:2px;"></span>
      </div>
    </div>

    <!-- Category Selector Title -->
    <div style="font-size:24px; font-weight:700; color:var(--ink-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom: 18px;">
      Select Envelope
    </div>

    <!-- Grid of Envelopes -->
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-bottom: 34px;">
      <div style="background:#FFF; border:3px solid var(--stamp); border-radius:24px; padding:24px 16px; text-align:center; box-shadow:0 8px 20px rgba(193,68,45,0.12);">
        <div style="font-size:42px; margin-bottom:10px;">🛒</div>
        <div style="font-size:24px; font-weight:700; color:var(--stamp);">Groceries</div>
        <div style="font-size:18px; color:var(--ink-muted); margin-top:4px;">$300 left</div>
      </div>

      <div style="background:var(--paper-card); border:2px solid var(--border-color); border-radius:24px; padding:24px 16px; text-align:center;">
        <div style="font-size:42px; margin-bottom:10px;">☕</div>
        <div style="font-size:24px; font-weight:700; color:var(--ink);">Dining Out</div>
        <div style="font-size:18px; color:var(--ink-muted); margin-top:4px;">$140 left</div>
      </div>

      <div style="background:var(--paper-card); border:2px solid var(--border-color); border-radius:24px; padding:24px 16px; text-align:center;">
        <div style="font-size:42px; margin-bottom:10px;">🚌</div>
        <div style="font-size:24px; font-weight:700; color:var(--ink);">Transport</div>
        <div style="font-size:18px; color:var(--ink-muted); margin-top:4px;">$180 left</div>
      </div>

      <div style="background:var(--paper-card); border:2px solid var(--border-color); border-radius:24px; padding:24px 16px; text-align:center;">
        <div style="font-size:42px; margin-bottom:10px;">🎬</div>
        <div style="font-size:24px; font-weight:700; color:var(--ink);">Leisure</div>
        <div style="font-size:18px; color:var(--ink-muted); margin-top:4px;">$85 left</div>
      </div>

      <div style="background:var(--paper-card); border:2px solid var(--border-color); border-radius:24px; padding:24px 16px; text-align:center;">
        <div style="font-size:42px; margin-bottom:10px;">⚡</div>
        <div style="font-size:24px; font-weight:700; color:var(--ink);">Utilities</div>
        <div style="font-size:18px; color:var(--ink-muted); margin-top:4px;">$460 left</div>
      </div>

      <div style="background:var(--paper-card); border:2px dashed var(--border-color); border-radius:24px; padding:24px 16px; text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center;">
        <div style="font-size:38px; color:var(--gold); font-weight:700;">+</div>
        <div style="font-size:22px; font-weight:700; color:var(--gold); margin-top:4px;">New Envelope</div>
      </div>
    </div>

    <!-- Merchant Note Input -->
    <div style="background:#FFF; border:2px solid var(--border-color); border-radius:22px; padding:24px 28px; display:flex; align-items:center; gap:16px; margin-bottom: 34px;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span style="font-size:26px; color:var(--ink); font-weight:600;">Whole Foods Market — Weekly Essentials</span>
    </div>

    <!-- CTA Button -->
    <div style="background:var(--stamp); color:#FAF6ED; padding:28px; border-radius:24px; text-align:center; font-size:30px; font-weight:800; letter-spacing:0.02em; box-shadow:0 12px 28px rgba(193,68,45,0.32);">
      Save to Groceries Envelope
    </div>
"""

# Screen 3: Family Sharing
CONTENT_SCREEN_3 = """
    <!-- App Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 24px;">
      <div>
        <div style="font-family:'Fraunces', serif; font-size:48px; font-weight:700; color:var(--ink);">Family Budget</div>
        <div style="font-size:24px; color:var(--ink-muted); margin-top:6px;">Members in this budget</div>
      </div>
      <div style="width:48px; height:48px; border-radius:50%; background:#E5DEC9; display:flex; align-items:center; justify-content:center; border:2px solid var(--border-color); margin-top:8px;">
        <div style="width:16px; height:16px; border-radius:50%; background:var(--gold);"></div>
      </div>
    </div>

    <!-- Family Avatars -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom: 34px;">
      <div style="width:68px; height:68px; border-radius:50%; background:var(--sage); color:#FFF; font-weight:800; font-size:24px; display:flex; align-items:center; justify-content:center;">JD</div>
      <div style="width:68px; height:68px; border-radius:50%; background:var(--gold); color:#FFF; font-weight:800; font-size:24px; display:flex; align-items:center; justify-content:center;">EM</div>
      <div style="width:68px; height:68px; border-radius:50%; background:#2B3A5E; color:#FFF; font-weight:800; font-size:24px; display:flex; align-items:center; justify-content:center;">MD</div>
      <div style="width:68px; height:68px; border-radius:50%; background:#C5BC9E; color:var(--ink); font-weight:800; font-size:22px; display:flex; align-items:center; justify-content:center;">+2</div>
    </div>

    <!-- Envelopes -->
    <div class="envelope-card">
      <div class="envelope-top">
        <div class="envelope-title-wrap">
          <div class="envelope-icon">
            <svg width="28" height="22" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="16" rx="3"/><path d="M2 3l10 8 10-8"/></svg>
          </div>
          <span class="envelope-name">Shared Groceries</span>
        </div>
        <div class="envelope-amounts"><span class="envelope-spent">$1,680</span> / $2,000</div>
      </div>
      <div style="display:flex; align-items:center; gap:16px;">
        <div class="progress-track" style="flex:1;"><div class="progress-fill fill-sage" style="width: 84%;"></div></div>
        <div style="width:40px; height:40px; border-radius:50%; background:var(--sage); color:#FFF; font-size:16px; font-weight:800; display:flex; align-items:center; justify-content:center;">JD</div>
      </div>
    </div>

    <div class="envelope-card">
      <div class="envelope-top">
        <div class="envelope-title-wrap">
          <div class="envelope-icon">
            <svg width="28" height="22" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <span class="envelope-name">House Rent</span>
        </div>
        <div class="envelope-amounts"><span class="envelope-spent">$3,000</span> / $3,000</div>
      </div>
      <div style="display:flex; align-items:center; gap:16px;">
        <div class="progress-track" style="flex:1;"><div class="progress-fill fill-gold" style="width: 100%;"></div></div>
        <div style="width:40px; height:40px; border-radius:50%; background:var(--gold); color:#FFF; font-size:16px; font-weight:800; display:flex; align-items:center; justify-content:center;">EM</div>
      </div>
    </div>

    <div class="envelope-card">
      <div class="envelope-top">
        <div class="envelope-title-wrap">
          <div class="envelope-icon">
            <svg width="28" height="22" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span class="envelope-name">Utilities & Bills</span>
        </div>
        <div class="envelope-amounts"><span class="envelope-spent">$740</span> / $1,200</div>
      </div>
      <div style="display:flex; align-items:center; gap:16px;">
        <div class="progress-track" style="flex:1;"><div class="progress-fill fill-sage" style="width: 61%;"></div></div>
        <div style="width:40px; height:40px; border-radius:50%; background:#2B3A5E; color:#FFF; font-size:16px; font-weight:800; display:flex; align-items:center; justify-content:center;">MD</div>
      </div>
    </div>

    <!-- Invite Member Box -->
    <div style="border:2px dashed var(--border-color); border-radius:24px; padding:24px; text-align:center; font-size:26px; font-weight:700; color:var(--ink-muted); margin-bottom: 30px; background:rgba(255,255,255,0.4);">
      + Invite Family Member
    </div>

    <!-- Monthly Contribution Share -->
    <div style="margin-top: 6px;">
      <div style="font-size:22px; font-weight:700; color:var(--ink-muted); margin-bottom:14px;">This Month's Contribution Share</div>
      <div style="height:20px; border-radius:10px; background:#E5DEC9; overflow:hidden; display:flex; margin-bottom:18px;">
        <div style="width:46%; background:var(--sage);"></div>
        <div style="width:34%; background:var(--gold);"></div>
        <div style="width:20%; background:#2B3A5E;"></div>
      </div>
      <div style="display:flex; justify-content:flex-start; gap:36px; font-size:22px; font-weight:700;">
        <span style="color:var(--ink); display:flex; align-items:center; gap:8px;">
          <span style="width:16px; height:16px; border-radius:50%; background:var(--sage);"></span> JD 46%
        </span>
        <span style="color:var(--ink); display:flex; align-items:center; gap:8px;">
          <span style="width:16px; height:16px; border-radius:50%; background:var(--gold);"></span> EM 34%
        </span>
        <span style="color:var(--ink); display:flex; align-items:center; gap:8px;">
          <span style="width:16px; height:16px; border-radius:50%; background:#2B3A5E);"></span> MD 20%
        </span>
      </div>
    </div>
"""

# Screen 4: Visual Reports & Analytics
CONTENT_SCREEN_4 = """
    <!-- App Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 24px;">
      <div>
        <div style="font-family:'Fraunces', serif; font-size:48px; font-weight:700; color:var(--ink);">Reports</div>
        <div style="font-size:24px; color:var(--ink-muted); margin-top:6px;">October — total spending</div>
        <div style="font-family:'Fraunces', serif; font-size:72px; font-weight:700; color:var(--ink); margin-top:10px; letter-spacing:-0.03em;">$6,420.00</div>
      </div>
      <div style="width:48px; height:48px; border-radius:50%; background:#E5DEC9; display:flex; align-items:center; justify-content:center; border:2px solid var(--border-color); margin-top:8px;">
        <div style="width:16px; height:16px; border-radius:50%; background:var(--sage);"></div>
      </div>
    </div>

    <!-- Centered Donut Chart -->
    <div style="display:flex; justify-content:center; align-items:center; margin: 34px 0;">
      <div style="position:relative; width:280px; height:280px;">
        <svg width="280" height="280" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#E5DEC9" stroke-width="12" />
          <!-- Housing 47% -->
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--sage)" stroke-width="12" stroke-dasharray="112 238" stroke-dashoffset="0" />
          <!-- Groceries 26% -->
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--gold)" stroke-width="12" stroke-dasharray="62 238" stroke-dashoffset="-112" />
          <!-- Transit 12% -->
          <circle cx="50" cy="50" r="38" fill="none" stroke="#2B3A5E" stroke-width="12" stroke-dasharray="28 238" stroke-dashoffset="-174" />
          <!-- Other 15% -->
          <circle cx="50" cy="50" r="38" fill="none" stroke="#8EAA9B" stroke-width="12" stroke-dasharray="36 238" stroke-dashoffset="-202" />
        </svg>
        <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
          <span style="font-size:18px; color:var(--ink-muted); font-weight:600;">This Month</span>
          <span style="font-family:'Fraunces', serif; font-size:24px; font-weight:700; color:var(--ink); margin-top:2px;">4 Categories</span>
        </div>
      </div>
    </div>

    <!-- 2x2 Categories Breakdown Grid -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px 28px; margin-bottom: 34px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:24px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:10px;">
          <span style="width:16px; height:16px; border-radius:50%; background:var(--sage);"></span> Rent
        </span>
        <span style="font-size:24px; font-weight:700; color:var(--ink);">$3,000</span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:24px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:10px;">
          <span style="width:16px; height:16px; border-radius:50%; background:var(--gold);"></span> Groceries
        </span>
        <span style="font-size:24px; font-weight:700; color:var(--ink);">$1,680</span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:24px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:10px;">
          <span style="width:16px; height:16px; border-radius:50%; background:#2B3A5E);"></span> Transit
        </span>
        <span style="font-size:24px; font-weight:700; color:var(--ink);">$740</span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:24px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:10px;">
          <span style="width:16px; height:16px; border-radius:50%; background:#8EAA9B);"></span> Other
        </span>
        <span style="font-size:24px; font-weight:700; color:var(--ink);">$1,000</span>
      </div>
    </div>

    <div style="height:2px; background:var(--border-color); margin-bottom: 28px;"></div>

    <!-- 5-Month Trend Bar Chart -->
    <div>
      <div style="font-size:22px; font-weight:700; color:var(--ink-muted); margin-bottom: 20px;">Last 5 Months Trend</div>
      <div style="display:flex; justify-content:space-between; align-items:flex-end; height:130px; padding: 0 30px;">
        <div style="text-align:center;"><div style="width:48px; height:70px; background:#8EAA9B; border-radius:10px; margin:0 auto 10px;"></div><span style="font-size:20px; color:var(--ink-muted);">Jun</span></div>
        <div style="text-align:center;"><div style="width:48px; height:98px; background:#8EAA9B; border-radius:10px; margin:0 auto 10px;"></div><span style="font-size:20px; color:var(--ink-muted);">Jul</span></div>
        <div style="text-align:center;"><div style="width:48px; height:84px; background:#8EAA9B; border-radius:10px; margin:0 auto 10px;"></div><span style="font-size:20px; color:var(--ink-muted);">Aug</span></div>
        <div style="text-align:center;"><div style="width:48px; height:120px; background:var(--gold); border-radius:10px; margin:0 auto 10px;"></div><span style="font-size:20px; font-weight:700; color:var(--ink);">Sep</span></div>
        <div style="text-align:center;"><div style="width:48px; height:82px; background:var(--sage); border-radius:10px; margin:0 auto 10px;"></div><span style="font-size:20px; font-weight:700; color:var(--sage);">Oct</span></div>
      </div>
    </div>
"""

# Screen 5: Envelope Detail & Receipts
CONTENT_SCREEN_5 = """
    <!-- Detail Navigation Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
      <span style="font-size:26px; font-weight:700; color:var(--sage);">‹ Back</span>
      <span style="font-family:'Fraunces', serif; font-size:34px; font-weight:700; color:var(--ink);">Envelope Details</span>
      <span style="font-size:26px; font-weight:700; color:var(--ink-muted);">Edit</span>
    </div>

    <!-- Category Header Card -->
    <div style="background:var(--paper-card-light); border:2.5px solid var(--border-color); border-radius:28px; padding:32px; margin-bottom: 28px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <div style="font-family:'Fraunces', serif; font-size:46px; font-weight:700; color:var(--ink);">Groceries</div>
          <div style="font-size:24px; color:var(--ink-muted); margin-top:6px;">$1,200 spent · $300 remaining</div>
        </div>
        <div style="background:var(--sage); color:#FFF; font-size:20px; font-weight:800; padding:6px 14px; border-radius:12px;">
          80% Used
        </div>
      </div>
      <div class="progress-track" style="margin-top:22px; height:14px;"><div class="progress-fill fill-sage" style="width: 80%;"></div></div>
    </div>

    <!-- Transaction History Title -->
    <div style="font-size:22px; font-weight:700; color:var(--ink-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom: 16px;">
      Transaction History
    </div>

    <!-- Transaction Rows -->
    <div style="background:#FFF; border:2px solid var(--border-color); border-radius:26px; overflow:hidden; margin-bottom: 28px;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; padding:22px 26px; border-bottom:1.5px dashed var(--border-color);">
        <div style="display:flex; align-items:center; gap:18px;">
          <div style="width:54px; height:54px; border-radius:14px; background:#F4EEDF; border:2px solid var(--border-color); display:flex; align-items:center; justify-content:center; font-family:'Fraunces', serif; font-size:26px; font-weight:700; color:var(--ink);">W</div>
          <div>
            <div style="font-size:26px; font-weight:700; color:var(--ink);">Whole Foods Market</div>
            <div style="font-size:20px; color:var(--ink-muted); margin-top:2px;">Oct 3 · Card payment</div>
          </div>
        </div>
        <div style="font-family:'Fraunces', serif; font-size:30px; font-weight:700; color:var(--stamp);">-$84.50</div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; padding:22px 26px; border-bottom:1.5px dashed var(--border-color);">
        <div style="display:flex; align-items:center; gap:18px;">
          <div style="width:54px; height:54px; border-radius:14px; background:#F4EEDF; border:2px solid var(--border-color); display:flex; align-items:center; justify-content:center; font-family:'Fraunces', serif; font-size:26px; font-weight:700; color:var(--ink);">O</div>
          <div>
            <div style="font-size:26px; font-weight:700; color:var(--ink);">Artisan Bakery</div>
            <div style="font-size:20px; color:var(--ink-muted); margin-top:2px;">Oct 2 · Apple Pay</div>
          </div>
        </div>
        <div style="font-family:'Fraunces', serif; font-size:30px; font-weight:700; color:var(--stamp);">-$26.00</div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; padding:22px 26px; border-bottom:1.5px dashed var(--border-color);">
        <div style="display:flex; align-items:center; gap:18px;">
          <div style="width:54px; height:54px; border-radius:14px; background:#F4EEDF; border:2px solid var(--border-color); display:flex; align-items:center; justify-content:center; font-family:'Fraunces', serif; font-size:26px; font-weight:700; color:var(--ink);">T</div>
          <div>
            <div style="font-size:26px; font-weight:700; color:var(--ink);">Trader Joe's</div>
            <div style="font-size:20px; color:var(--ink-muted); margin-top:2px;">Sep 29 · Card payment</div>
          </div>
        </div>
        <div style="font-family:'Fraunces', serif; font-size:30px; font-weight:700; color:var(--stamp);">-$145.20</div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; padding:22px 26px;">
        <div style="display:flex; align-items:center; gap:18px;">
          <div style="width:54px; height:54px; border-radius:14px; background:#F4EEDF; border:2px solid var(--border-color); display:flex; align-items:center; justify-content:center; font-family:'Fraunces', serif; font-size:26px; font-weight:700; color:var(--ink);">F</div>
          <div>
            <div style="font-size:26px; font-weight:700; color:var(--ink);">Farmers Market Depot</div>
            <div style="font-size:20px; color:var(--ink-muted); margin-top:2px;">Sep 26 · Cash</div>
          </div>
        </div>
        <div style="font-family:'Fraunces', serif; font-size:30px; font-weight:700; color:var(--stamp);">-$58.40</div>
      </div>

    </div>

    <!-- Add Expense to Envelope CTA -->
    <div style="background:var(--stamp); color:#FAF6ED; padding:26px; border-radius:24px; text-align:center; font-size:28px; font-weight:800; box-shadow:0 10px 24px rgba(193,68,45,0.3);">
      + Add Expense to This Envelope
    </div>
"""

SCREENS = [
    {
        "filename": "1-dashboard-envelopes.png",
        "title": "Zarfım - Digital Envelope Budgeting",
        "tagline": "Digital Envelope Budgeting",
        "headline": "See where every<br>dollar goes.",
        "subtitle": "Add your income, organize spending envelopes, and stay in total control.",
        "content": CONTENT_SCREEN_1
    },
    {
        "filename": "2-fast-expense-tracking.png",
        "title": "Zarfım - Fast Expense Tracking",
        "tagline": "Lightning Fast Logging",
        "headline": "Log any expense<br>in just two taps.",
        "subtitle": "Select an envelope, type the amount, and watch your balance adjust instantly.",
        "content": CONTENT_SCREEN_2
    },
    {
        "filename": "3-family-shared-budget.png",
        "title": "Zarfım - Shared Family Budget",
        "tagline": "Budget Together",
        "headline": "Invite your family,<br>share the same envelope.",
        "subtitle": "Track shared household expenses in one place without any surprises.",
        "content": CONTENT_SCREEN_3
    },
    {
        "filename": "4-visual-reports-charts.png",
        "title": "Zarfım - Visual Reports & Analytics",
        "tagline": "Spending Insights",
        "headline": "Read your money's<br>story in clear charts.",
        "subtitle": "Category breakdowns and monthly trends help you spot where to save immediately.",
        "content": CONTENT_SCREEN_4
    },
    {
        "filename": "5-envelope-receipts-history.png",
        "title": "Zarfım - Envelope Detail & History",
        "tagline": "Transaction History",
        "headline": "Keep every receipt<br>neatly organized.",
        "subtitle": "Drill down into any envelope to see real-time progress and past purchases.",
        "content": CONTENT_SCREEN_5
    }
]

def render_screens():
    temp_html_dir = "/Users/teknopark/Desktop/mobil/4-Zarfim/build/temp_screenshots"
    os.makedirs(temp_html_dir, exist_ok=True)

    for idx, screen in enumerate(SCREENS):
        html_content = BASE_HTML.format(
            title=screen["title"],
            tagline=screen["tagline"],
            headline=screen["headline"],
            subtitle=screen["subtitle"],
            phone_content=screen["content"]
        )
        html_file = os.path.join(temp_html_dir, f"screen_{idx+1}.html")
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html_content)

        for out_dir in OUTPUT_DIRS:
            out_png = os.path.join(out_dir, screen["filename"])
            cmd = [
                CHROME_BIN,
                "--headless",
                "--virtual-time-budget=4000",
                f"--screenshot={out_png}",
                "--window-size=1242,2688",
                "--default-background-color=00000000",
                f"file://{html_file}"
            ]
            print(f"Generating {out_png}...")
            subprocess.run(cmd, check=True)

    print("All 5 App Store screenshots generated successfully in both directories!")

if __name__ == "__main__":
    render_screens()
