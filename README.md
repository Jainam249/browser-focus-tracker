# 🧠 Focus Pulse

**[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/focuspulse/gcffkhpmcpjkmjmjeeiigbnjieoaennn)** &middot; **[Documentation](https://jainam249.github.io/browser-focus-tracker/)**

A **privacy-first Chrome Extension** that helps users understand and improve their browsing habits by tracking website usage, measuring focus, and providing insightful analytics—all while keeping data stored **locally on the user's device**.

---

## 📌 Overview

Focus Pulse is designed to help users become more aware of their browsing behavior without compromising their privacy.

Unlike cloud-based productivity tools, this extension stores all browsing statistics locally using the Chrome Storage API. No personal browsing data is sent to external servers.

The extension monitors website usage, calculates a daily focus score, explains how the score was calculated, compares today's performance with the user's personal baseline, and provides actionable focus insights through an interactive dashboard.

---

## ✨ Features

### 📊 Activity Tracking

- Track time spent on each website
- Monitor active browser sessions
- Detect browser focus and idle states
- Count tab switches
- Track the maximum number of simultaneously open tabs

### 🎯 Focus Analysis

- Daily Focus Score
- Transparent score breakdown showing why points were deducted
- Personal Baseline based on previous 7 days
- Comparison between today's score and personal baseline
- Productivity Grade (A–D)
- Focus Zone classification
- Longest browsing session
- Average session length

### 📈 Dashboard Analytics

- Daily statistics overview
- Weekly productivity summary
- Selectable 7-day, 15-day and 30-day focus trends
- Switch between Bar Graph and Line Graph views
- Remember the selected graph type when reopening the dashboard
- Best and worst browsing days
- Top visited websites
- Focus Insight recommendations
- "Why did my score change?" score breakdown
- Personal Baseline comparison

### 📁 Data Export

- Export browsing statistics as JSON
- Export browsing statistics as CSV
- Generate a weekly report from the dashboard

### 🎨 User Experience

- Modern responsive interface
- Toast notifications
- Empty-state handling
- Professional dashboard layout

# 🔐 Privacy

Focus Pulse follows a **local-first architecture**.

- Browsing activity and focus statistics are stored locally using Chrome Storage.
- No backend server or cloud storage is used for browsing statistics.
- No user account is required.
- No analytics service is used.
- The extension does not send browsing statistics to external servers.
- Users can explicitly export their statistics as JSON or CSV, or generate a weekly report.

Uninstalling the extension removes its locally stored extension data as managed by Chrome. Exported files are separate and may remain on the user's device.

---

# 🛠️ Technology Stack

- Chrome Extension Manifest V3
- JavaScript (ES6+), HTML5 and CSS3
- Chrome Storage API for locally stored statistics
- Chrome Tabs API for tab activity tracking
- Chrome Alarms API for scheduled tracking tasks
- Chrome Idle API for detecting idle states
- Chrome Downloads API for exporting reports
- MkDocs with Material for MkDocs for the documentation website

---

# 📂 Project Structure

```
browser-focus-tracker/
│
│
├── icons/
│
├── background.js          # Background tracking engine
├── dashboard.html         # Analytics dashboard
├── dashboard.js           # Dashboard logic
├── dashboard.css          # Dashboard styling
│
├── popup.html             # Extension popup
├── popup.js               # Popup logic
├── popup.css              # Popup styling
│
├── tokens.css             # Shared design tokens
├── utils.js               # Shared helper functions
│
├── manifest.json          # Chrome extension configuration
│
├── docs/                  # MkDocs site sources (documentation website)
├── mkdocs.yml             # Documentation site configuration
├── requirements-docs.txt  # Documentation toolchain (mkdocs-material)
│
├── STORE_LISTING.md       # Chrome Web Store submission answers
└── README.md
```

---

# ⚙️ Installation

## From the Chrome Web Store (recommended)

Focus Pulse is published on the Chrome Web Store:

**https://chromewebstore.google.com/detail/focuspulse/gcffkhpmcpjkmjmjeeiigbnjieoaennn**

Click **Add to Chrome**, confirm the permissions prompt, and pin the icon to
your toolbar. Chrome keeps the extension updated automatically.

## Load unpacked (development)

There is no build step — the repository _is_ the extension.

1. Clone this repository

```
git clone https://github.com/Jainam249/browser-focus-tracker.git
```

2. Open Chrome

3. Navigate to

```
chrome://extensions
```

4. Enable **Developer Mode**

5. Click **Load unpacked**

6. Select the project folder

7. The extension is now ready to use.

---

# 🚀 How It Works

The extension continuously monitors the currently active browser tab while the browser window is focused.

It records:

- Time spent on each website
- Tab switches
- Browsing sessions
- Daily statistics

Using this information, the extension calculates a Focus Score. The dashboard then explains the score through a transparent score breakdown, compares it with the user's personal baseline when enough historical data is available, and generates a Focus Insight with a simple actionable recommendation.

### Exploring Focus History

The dashboard lets users review focus trends over 7-day, 15-day and 30-day periods. Users can switch between Bar Graph and Line Graph visualizations to explore their historical focus scores.

The selected graph type is saved locally in the browser, allowing the dashboard to restore the user's graph preference when it is reopened. Changing the graph type affects only the visualization, not the underlying focus score calculation.

---

# 📊 Focus Score

Focus Pulse uses a simple, transparent heuristic to calculate the daily Focus Score.

The score starts at **100 points** and deductions are applied based on browsing behavior:

- **Tab switching:** −1.5 points per tab switch
- **Short visits:** −3 points per short visit
- **Website variety:** −10 points when more than 15 different websites are visited

The final score is kept between **0 and 100**.

The score is also classified into focus zones and translated into a productivity grade from **A to D**.

### Why did my score change?

The dashboard provides a transparent breakdown showing:

- Starting score
- Tab-switching penalty
- Short-visit penalty
- Website-variety penalty
- Final Focus Score

This allows users to understand exactly how their score was calculated instead of seeing only a single number.

---

# 📈 Personal Baseline

Focus Pulse can compare today's Focus Score with the user's personal browsing baseline.

The Personal Baseline is calculated from the user's previous days of activity, using up to the previous **7 days** and excluding the current day.

A minimum of **3 previous days** is required before a baseline is displayed.

---

# 💡 Focus Insight

Focus Pulse provides a short actionable recommendation based on the user's current browsing statistics.

Focus Insight can consider:

- Performance compared with the personal baseline
- Frequent tab switching
- Short visits
- High website variety
- Strong focus scores

Focus Insight provides additional context and a practical suggestion for improving browsing habits.

---

# 🔐 Privacy

Focus Pulse follows a **local-first architecture**.

- No external servers
- No cloud storage
- No account required
- No analytics
- No tracking outside the browser
- User data never leaves the device unless explicitly exported

---

# 🌱 Future Improvements

Possible future enhancements include:

- Dark mode
- Custom productivity goals
- Monthly reports
- Website categorization
- Time-of-day and session-length weight
- More advance personalisation of Focus Score

The current scoring formula is intentionally designed as a simple and transparent v1 heuristic. It focuses on observable browsing behavior rather than attempting to infer whether a particular website or activity is productive or distracting.

---

# 📚 Documentation Website

The user-facing documentation lives in `docs/` and is published as a static site
with [MkDocs](https://www.mkdocs.org/) using the
[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme.

**Live site:** https://jainam249.github.io/browser-focus-tracker/

```

docs/
├── index.md # Overview / landing page
├── install.md # Install from the store or unpacked
├── how-it-works.md # Tracking model and focus score formula
├── privacy.md # Privacy policy (the URL used on the store listing)
├── changelog.md # Release history
└── stylesheets/
└── extra.css # Theme overrides and design tokens

```

The site configuration — navigation, theme, palette, markdown extensions — is
in `mkdocs.yml`. Only the documentation site needs Python; the extension itself
has no dependencies.

## How to preview the site locally

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements-docs.txt
mkdocs serve
```

Open http://127.0.0.1:8000 — the site rebuilds and reloads on every save.

## How to edit or add a page

1. Edit the relevant Markdown file in `docs/`, or create a new one.
2. If you added a page, register it under `nav:` in `mkdocs.yml`, otherwise it
   will not appear in the navigation.
3. Keep the YAML front matter (`title`, `description`) at the top of each page —
   it drives the page title and search/social descriptions.
4. Preview with `mkdocs serve` before committing.

## How to build and deploy

```bash
mkdocs build          # renders the static site into site/ (git-ignored)
mkdocs gh-deploy      # builds and pushes to the gh-pages branch
```

`mkdocs gh-deploy` publishes to GitHub Pages at the `site_url` configured in
`mkdocs.yml`. Run it from `main` with a clean working tree.

> **Note:** the **Privacy** page is the privacy policy URL registered on the
> Chrome Web Store listing. If its path ever changes, update the listing in the
> Developer Dashboard to match.

---

# 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

Feel free to fork the repository and submit a pull request.

---

# 👨‍💻 Author

**Jainam Shah**

Built as a privacy-first browser productivity tool using Chrome Extension Manifest V3.
