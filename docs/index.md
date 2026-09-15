---
title: Overview
description: Focus Pulse measures your browsing activity locally and turns it into a transparent daily focus score with personal baselines and actionable insights.
---

# Focus Pulse

**A Chrome extension that measures how you spend your browsing time, explains your focus score, and keeps your browsing statistics on your own machine.**

Most productivity tools ask you to create an account and then quietly ship your
browsing history to a server. Focus Pulse does the opposite. It watches which
site is in your active tab, how long it stays there, and how often you switch —
then turns that activity into a daily focus score you can understand and
inspect. Nothing is uploaded, because there is nowhere to upload it to.

<div class="ft-facts" markdown>
<div class="ft-fact"><b>0</b><span>network requests made by the extension</span></div>
<div class="ft-fact"><b>0</b><span>third parties with access to your data</span></div>
<div class="ft-fact"><b>No</b><span>account, login, or cloud sync</span></div>
<div class="ft-fact"><b>Local</b><span>storage only, erased when you uninstall</span></div>
</div>

[Add to Chrome](https://chromewebstore.google.com/detail/focuspulse/gcffkhpmcpjkmjmjeeiigbnjieoaennn){ .md-button .md-button--primary }
[Installation options](install.md){ .md-button }
[Read the privacy policy](privacy.md){ .md-button }

Focus Pulse is available on the Chrome Web Store, or you can
[load it unpacked](install.md#load-unpacked-developers) straight from the
repository.

## What it measures

**Time per site.** Whenever a tab is focused and you are actually at the
computer, the time is credited to that site's hostname — `wikipedia.org`, not
the full address of the page you were reading.

**Tab switching.** Every switch between tabs is counted. Frequent switching
contributes to the focus score and can be useful as a signal of fragmented
browsing activity.

**Short visits.** Visits that end almost as soon as they begin are counted
separately. Ten seconds on a site, then away again, is different from ten
minutes of reading.

**Website variety.** Focus Pulse counts the number of different website
domains visited during the day. Visiting more than 15 different websites
results in a fixed score penalty.

**Tab load.** The highest number of tabs you had open simultaneously that day.

## What it shows you

| Surface               | What you get                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Popup**             | Today's focus score on a gauge, top sites, live tab count, export buttons                                                            |
| **Dashboard**         | Today's readouts, weekly summary, 7-day trend, best and worst days, top sites, personal baseline, score breakdown, and Focus Insight |
| **Score Breakdown**   | A transparent explanation of how today's score was calculated                                                                        |
| **Personal Baseline** | Your usual focus score based on previous days, compared with today's score                                                           |
| **Focus Insight**     | A factual, actionable suggestion based on your existing browsing statistics                                                          |
| **Exports**           | Statistics as JSON or CSV, plus a plain-text weekly report                                                                           |

The score is translated into a letter grade from **A** to **D** and a focus zone
— highly focused, moderately focused, or distracted. The exact formula is
documented in [How it works](how-it-works.md), including a breakdown of the
penalties used to calculate the score.

## Personal focus context

Focus Pulse can build a **Personal Baseline** once enough daily data is
available. Your baseline uses up to your previous seven days of focus scores
and excludes the current day.

At least three previous days are required before a baseline is shown. This
allows Focus Pulse to compare today's score with your own recent browsing
pattern rather than relying only on a generic benchmark.

## Focus Insight

**Focus Insight** provides one simple, actionable observation based on the
browsing statistics already collected by Focus Pulse.

Depending on your data, it may highlight:

- frequent tab switching
- several short visits
- visiting many different websites
- being above or below your personal baseline
- maintaining a strong focus score

Focus Insight does **not** change your focus score and does not attempt to
determine whether a particular website is productive or distracting. It uses
the same transparent statistics that are already available in the dashboard.

## Designed to be honest about time

A focus tracker that counts time you weren't there is worse than no tracker at
all. Focus Pulse stops the clock when the system goes idle or the screen locks,
and pauses when the browser window loses focus.

It also makes one deliberate exception: if the active tab is playing audio, you
are treated as present even without keyboard or mouse input. Watching a
40-minute talk should not be recorded as 40 minutes of idling.

!!! info "Built for Manifest V3"
Chrome suspends extension service workers aggressively. Focus Pulse
checkpoints the session in progress once a minute so that long stretches
on a single page survive suspension instead of vanishing from your
statistics.

## Privacy in one line

Your browsing statistics are written to your browser's local extension storage
and are not sent to external servers. They remain there until you delete them
or uninstall the extension. The full policy is on the
[Privacy](privacy.md) page.
