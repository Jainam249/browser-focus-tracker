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

### Grades and focus zones

The final score is also shown as a letter grade and a focus zone.

| Score  | Grade | Focus zone         |
| ------ | ----- | ------------------ |
| 90–100 | **A** | Highly focused     |
| 80–89  | **B** | Highly focused     |
| 65–79  | **C** | Moderately focused |
| 50–64  | **D** | Moderately focused |
| 0–49   | **D** | Distracted         |

The focus zone gives a simple interpretation of the score, while the letter
grade provides a more detailed classification.

### Why did my score change?

Focus Pulse makes the score easier to understand by showing a breakdown of
where points were lost.

The dashboard shows:

- **Starting score** — every day begins at 100.
- **Tab switching** — each tab switch reduces the score by 1.5 points.
- **Short visits** — each qualifying short visit reduces the score by 3 points.
- **Website variety** — visiting more than 15 distinct sites applies a
  10-point penalty.
- **Today's focus score** — the resulting score after the penalties are applied
  and the value is clamped between 0 and 100.

This breakdown is intended to make the score transparent rather than presenting
it as an unexplained number.

### Your Personal Baseline

After enough daily data has been collected, Focus Pulse calculates a personal
baseline using up to the previous seven days of focus scores.

At least three previous days are required before a baseline is shown. This
prevents the comparison from being based on too little information.

The dashboard compares today's score with your usual score and shows whether
you are:

- Above your usual focus
- Below your usual focus
- Around your usual focus

The personal baseline is calculated entirely from your locally stored daily
statistics.

### Focus Insight

Focus Pulse also provides a short **Focus Insight** based on the day's
browsing statistics.

The insight can highlight patterns such as:

- Frequent tab switching
- Several short visits
- A large number of different websites
- A score significantly above or below your personal baseline
- A generally strong or steady focus score

The insight is intended as a lightweight suggestion, not as a measurement of
your actual productivity or mental attention.

For example, a high number of tab switches may result in a suggestion to keep
fewer active tabs. A score above your personal baseline may result in a positive
message encouraging you to continue the browsing routine that worked well.

These insights are generated locally and do not require your browsing data to
be sent anywhere.

### Limitations of the score

The focus score is a **v1 heuristic**, not a scientific measurement of
attention, productivity, or concentration.

The score measures observable browsing behaviour such as tab switching,
short visits, and website variety. It cannot determine whether you are
actually focused on a task.

For example, reading a long document without switching tabs may produce a high
score even though Focus Pulse cannot know whether you were paying attention.
Similarly, switching tabs frequently may be completely reasonable when a task
requires research.

The personal baseline and Focus Insight provide additional context, but they
do not change this fundamental limitation.

The formula may evolve in future versions as Focus Pulse develops more
meaningful ways to represent browsing behaviour.

## Where the data lives

Each day is stored as a single small record in `chrome.storage.local`:

| Field         | Contents                                |
| ------------- | --------------------------------------- |
| `sites`       | Hostname → milliseconds of focused time |
| `switches`    | Number of tab switches                  |
| `shortVisits` | Number of sessions under 10 seconds     |
| `maxTabs`     | Highest simultaneous tab count that day |

Alongside these sits the in-progress session state — the current hostname and
when its session started.

The daily records are used to calculate the focus score, 7-day trend, personal
baseline, and Focus Insight.

The `maxTabs` value is tracked for informational purposes but is **not currently
used directly in the focus-score formula**.

Because several listeners can fire at once — for example, a tab switch, tab
close, and alarm — read-modify-write operations on the daily record are
serialised through a queue. This prevents concurrent updates from overwriting
each other and losing recorded activity.

Nothing here is transmitted anywhere. See [Privacy](../privacy/) for the full
statement.
