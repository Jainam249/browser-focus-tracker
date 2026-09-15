---
title: How it works
description: The tracking model behind Focus Pulse — what counts as browsing time, how idle is handled, and how the focus score, personal baseline, and Focus Insight are calculated.
---

# How it works

A score you can't interrogate isn't worth much. This page documents exactly what
Focus Pulse measures, what it deliberately refuses to measure, and how the
number on the gauge is calculated.

## What counts as browsing time

Time is credited to a site only when **all three** of these hold:

- The site's tab is the active tab in its window.
- A Chrome window actually has focus.
- The system is not idle or locked.

The moment any of those stops being true, the clock stops and the elapsed time
is banked against that site's hostname. When they become true again, a fresh
session starts.

### Pages that are never tracked

Internal browser pages are skipped entirely — `chrome://`,
`chrome-extension://`, `edge://`, and `about:`. Time spent on the new tab page
or in browser settings is not counted as browsing and never appears in your
statistics.

### Hostnames, not URLs

Only the hostname is stored. Reading three different articles on
`wikipedia.org` produces one entry, `wikipedia.org`, with the combined time.
The full address is used momentarily to extract that hostname and is not
retained.

## Handling absence honestly

The hardest part of a focus tracker is not counting time you weren't there for.

**Idle detection runs on a 5-minute threshold.** Chrome's idle API only sees
physical keyboard and mouse input, so a shorter threshold could punish normal
behaviour — reading a long article without touching the mouse would register as
absence. Five minutes is the trade-off: genuine idle time can take up to five
minutes to be noticed, while ordinary reading is less likely to be
misclassified.

**Audio is treated as presence.** If the active tab is playing audio when the
system goes idle, tracking continues. Watching a 40-minute talk is engagement,
not idling. A **locked screen** has no such exemption — if you locked the
computer, tracking stops.

**Brief focus loss has a 300 ms grace period.** Opening DevTools or a zoom menu
can momentarily unfocus the window. Focus Pulse waits 300 ms and re-checks
before deciding the browser genuinely lost focus, so these brief interruptions
do not unnecessarily fragment tracking.

!!! info "Surviving Manifest V3"
Chrome can suspend extension service workers, and in-memory variables can
disappear with them. Focus Pulse treats `chrome.storage.local` as the
persistent source of truth and runs a one-minute alarm that checkpoints the
session in progress. Without that checkpoint, a long single-tab session —
such as a video or long read — could lose time when the service worker is
suspended.

## Short visits

A session shorter than **10 seconds** is recorded as a short visit and can
reduce the focus score.

A short visit is only counted when the session ends because you deliberately
moved away from the page — for example, by switching tabs or loading a new URL.

A session cut short because the browser lost focus, the system went idle, or
the session was checkpointed by the alarm is **not** treated as a short visit.
Those events are interruptions outside the browsing behaviour being measured.

## The focus score

Every day starts at **100 points**. The score then loses points for selected
browsing behaviours:

```text
score = 100

       − (tab switches × 1.5)
       − (short visits × 3)
       − (10 if more than 15 distinct sites were visited)

final score = clamped to 0–100 and rounded
```
