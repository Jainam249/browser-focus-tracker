---
title: Changelog
description: Development history of Focus Pulse, from the first tracking prototype to version 1.0.
---

# Changelog

The changelog records the development history of Focus Pulse. Version **1.2.0** is the next planned release, following the existing version 1.1.0. Release dates and publication status will be updated when the release is finalized.
[published to the Chrome Web Store](https://chromewebstore.google.com/detail/focuspulse/gcffkhpmcpjkmjmjeeiigbnjieoaennn).

## 1.0 — published

**22 August 2026**

- **Published to the Chrome Web Store.** Focus Pulse is now installable at
  [chromewebstore.google.com/detail/focuspulse/gcffkhpmcpjkmjmjeeiigbnjieoaennn](https://chromewebstore.google.com/detail/focuspulse/gcffkhpmcpjkmjmjeeiigbnjieoaennn).

The submission-ready build. Scoring was centralised so the popup, dashboard, and
weekly report can no longer disagree with each other, and the tracking worker was
hardened against Manifest V3's aggressive suspension.

**20 August 2026**

- **Renamed the product from Focus Tracker to Focus Pulse.** The extension
  name, in-app labels, exported filenames, and weekly report header all use
  the new name. The repository and documentation URLs keep their original
  `browser-focus-tracker` slug so existing links and the published privacy
  policy URL stay valid.
- Revised the score-to-grade scale.

**13 August 2026**

- Fixed dashboard styling and the weekly report download.
- Fixed the success notification on JSON export.
- Centralised scoring logic in `utils.js` and made the dashboard defensive
  against missing or partial data.
- Cleaned up the background service worker: serialised all storage
  read-modify-write operations behind a queue to prevent lost updates, and made
  the auto-save alarm await its write so Chrome cannot suspend the worker
  mid-save.
- Finalised project documentation.

## Earlier development

**20 July 2026**

- Improved session tracking and focus analytics.
- Added weekly analytics and productivity insights to the dashboard.
- Redesigned the popup around a focus gauge, with export options.
- Introduced a shared design-token system across popup and dashboard.
- Updated extension permissions and configuration.

**3 July 2026**

- Added weekly statistics and the history table.
- Reorganised the project into its current structure.

**23–30 June 2026**

- Built the analytics dashboard — page, styles, and logic.
- Reworked the popup layout and behaviour.
- Extended the background tracking script.

**15 June 2026**

- Enhanced the focus score calculation.
- Improved tab session tracking.
- Extracted shared utility functions.

**9 June 2026**

- Initial browser focus tracker extension (released under the former name).

## Planned

Ideas under consideration, from the project README:

- Weight the focus score by time of day and session length. The current formula
  — flat penalties per switch and per short visit — is a straightforward v1
  heuristic that ignores when a session happened and how long it ran.
- Custom productivity goals and monthly reports.
- Website categorisation.
- Focus session reminders.

## 1.2.0 — Dashboard enhancements

**Release date: To be confirmed**

- Added a graph selector to switch between Bar Graph and Line Graph views.
- Added 7-day, 15-day and 30-day trend ranges.
- Saved the selected graph type so it is restored when the dashboard is reopened.
- Improved the dashboard's flexibility for reviewing historical focus scores.

This release updates dashboard visualization and user preferences without changing the focus score formula or the underlying browsing-data collection model.
