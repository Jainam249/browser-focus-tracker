import {
  getToday,
  formatTime,
  calculateTotalTime,
  calculateFocusScore,
  calculateFocusScoreBreakdown,
  calculatePersonalBaseline,
  generateFocusInsight,
  zoneForScore,
  ZONE_LABEL,
  needleAngle,
  getGradeLetter,
} from "./utils.js";

let selectedTrendRange = 7;

let selectedGraphType = localStorage.getItem("focusPulseGraphType") || "line";

/* -----------------------------
   Gauge (the reading section's signature element)
------------------------------*/

function updateGauge(score) {
  const needleGroup = document.getElementById("needleGroup");

  needleGroup.setAttribute(
    "transform",
    `rotate(${needleAngle(score)} 100 110)`,
  );

  document.getElementById("focusScore").textContent = score;

  document.getElementById("focusLabel").textContent =
    ZONE_LABEL[zoneForScore(score)];
}

/* -----------------------------
   Today's readouts
------------------------------*/

function updateScoreBreakdown(stats) {
  const breakdown = calculateFocusScoreBreakdown(stats);

  const startingScore = document.getElementById("startingScore");
  const switchPenalty = document.getElementById("switchPenalty");
  const shortVisitPenalty = document.getElementById("shortVisitPenalty");
  const sitePenalty = document.getElementById("sitePenalty");
  const breakdownFinalScore = document.getElementById("breakdownFinalScore");
  const breakdownScore = document.getElementById("breakdownScore");

  if (startingScore) {
    startingScore.textContent = breakdown.startingScore;
  }

  if (switchPenalty) {
    switchPenalty.textContent =
      breakdown.switchPenalty > 0 ? `-${breakdown.switchPenalty}` : "-0";
  }

  if (shortVisitPenalty) {
    shortVisitPenalty.textContent =
      breakdown.shortVisitPenalty > 0
        ? `-${breakdown.shortVisitPenalty}`
        : "-0";
  }

  if (sitePenalty) {
    sitePenalty.textContent =
      breakdown.sitePenalty > 0 ? `-${breakdown.sitePenalty}` : "-0";
  }

  if (breakdownFinalScore) {
    breakdownFinalScore.textContent = breakdown.finalScore;
  }

  if (breakdownScore) {
    breakdownScore.textContent = `${breakdown.finalScore}/100`;
  }
}

function updateTodayStats(stats) {
  const total = calculateTotalTime(stats.sites);

  document.getElementById("browsingTime").textContent = formatTime(total);

  document.getElementById("switches").textContent = stats.switches || 0;

  document.getElementById("siteCount").textContent = Object.keys(
    stats.sites || {},
  ).length;

  document.getElementById("maxTabs").textContent = stats.maxTabs || 0;
}

function updateTopSites(stats) {
  const container = document.getElementById("topSites");

  container.innerHTML = "";

  const entries = Object.entries(stats.sites || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const totalTime = calculateTotalTime(stats.sites);

  container.classList.toggle("is-empty", entries.length === 0);

  entries.forEach(([domain, time]) => {
    const percentage =
      totalTime > 0 ? ((time / totalTime) * 100).toFixed(1) : 0;

    const li = document.createElement("li");

    li.className = "site-card";

    const header = document.createElement("div");
    header.className = "site-header";

    const domainSpan = document.createElement("span");
    domainSpan.className = "site-domain";
    domainSpan.textContent = domain;

    const percentSpan = document.createElement("span");
    percentSpan.className = "site-percent";
    percentSpan.textContent = `${percentage}%`;

    header.appendChild(domainSpan);
    header.appendChild(percentSpan);

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.width = `${percentage}%`;

    progressBar.appendChild(progressFill);

    const timeDiv = document.createElement("div");
    timeDiv.className = "site-time";
    timeDiv.textContent = formatTime(time);

    li.appendChild(header);
    li.appendChild(progressBar);
    li.appendChild(timeDiv);

    container.appendChild(li);
  });
}

/* -----------------------------
   Weekly summary + trend strip
------------------------------*/

function calculateWeeklySummary(dailyStats) {
  const daysDesc = Object.entries(dailyStats || {})
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7);

  let totalScore = 0;
  let totalTime = 0;
  let totalSwitches = 0;

  let bestScore = -1;
  let bestDay = "-";

  let worstScore = 101;
  let worstDay = "-";

  daysDesc.forEach(([date, stats]) => {
    const score = calculateFocusScore(stats);

    const time = calculateTotalTime(stats.sites);

    totalScore += score;
    totalTime += time;
    totalSwitches += stats.switches || 0;

    if (score > bestScore) {
      bestScore = score;
      bestDay = date;
    }

    if (score < worstScore) {
      worstScore = score;
      worstDay = date;
    }
  });

  return {
    average: daysDesc.length ? Math.round(totalScore / daysDesc.length) : 0,

    bestDay,
    bestScore,

    worstDay,
    worstScore,

    weeklyTime: totalTime,

    weeklySwitches: totalSwitches,

    // oldest -> newest, for the trend strip (reads
    // left to right like a strip-chart recording)
    orderedDays: [...daysDesc].reverse().map(([date, stats]) => ({
      date,
      score: calculateFocusScore(stats),
    })),
  };
}

function renderTrend(orderedDays) {
  const container = document.getElementById("trend");

  container.innerHTML = "";

  if (!orderedDays.length) {
    return;
  }

  function getDayLabel(date) {
    const match = String(date).match(/^\d{4}-\d{2}-(\d{2})$/);
    return match ? match[1] : String(date).slice(-2);
  }

  // BAR GRAPH
  if (selectedGraphType === "bar") {
    orderedDays.forEach(({ date, score }) => {
      const bar = document.createElement("div");

      bar.className = "trend-bar";
      bar.setAttribute("data-zone", zoneForScore(score));

      const fill = document.createElement("div");
      fill.className = "trend-bar-fill";
      // fill.style.height = `${Math.max(4, score)}%`;
      fill.style.height = `${Math.max(4, Math.min(100, score))}%`;
      fill.title = `${date}: ${score}/100`;

      const label = document.createElement("div");
      label.className = "trend-bar-label";
      label.textContent = getDayLabel(date);

      bar.appendChild(fill);
      bar.appendChild(label);
      container.appendChild(bar);
    });

    return;
  }

  // LINE GRAPH
  const ns = "http://www.w3.org/2000/svg";
  const width = 600;
  const height = 220;
  const left = 42;
  const right = 585;
  const top = 18;
  const bottom = 170;

  const svg = document.createElementNS(ns, "svg");

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("class", "trend-line-chart");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Focus score line graph");

  const add = (tag, attrs, text) => {
    const element = document.createElementNS(ns, tag);

    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    if (text !== undefined) {
      element.textContent = text;
    }

    svg.appendChild(element);
    return element;
  };

  // Y-axis gridlines and labels.
  // Draw horizontal gridlines without Y-axis numbers.
  [0, 25, 50, 75, 100].forEach((value) => {
    const y = bottom - (value / 100) * (bottom - top);

    add("line", {
      x1: left,
      y1: y,
      x2: right,
      y2: y,
      class: "trend-line-grid",
    });
  });

  // Position each recorded day.
  const points = orderedDays.map((day, index) => ({
    ...day,
    x:
      orderedDays.length === 1
        ? (left + right) / 2
        : left + (index * (right - left)) / (orderedDays.length - 1),
    y: bottom - (day.score / 100) * (bottom - top),
  }));

  // Connect the scores.
  if (points.length > 1) {
    add("polyline", {
      points: points.map((point) => `${point.x},${point.y}`).join(" "),
      class: "trend-line-path",
      fill: "none",
    });
  }

  // Draw points, score labels, and dates.
  points.forEach(({ date, score, x, y }) => {
    const point = add("circle", {
      cx: x,
      cy: y,
      r: 4,
      class: "trend-line-point",
      tabindex: "0",
      role: "img",
      "aria-label": `${date}: ${score}/100`,
    });

    const tooltip = document.createElementNS(ns, "title");
    tooltip.textContent = `${date}: ${score}/100`;
    point.appendChild(tooltip);

    add(
      "text",
      {
        x,
        y: y - 10,
        "text-anchor": "middle",
        class: "trend-line-value",
      },
      String(score),
    );

    add(
      "text",
      {
        x,
        y: 195,
        "text-anchor": "middle",
        class: "trend-line-label",
      },
      getDayLabel(date),
    );
  });

  container.appendChild(svg);
}

function updateWeeklySummary(weekly) {
  document.getElementById("weeklyAverage").textContent =
    `${weekly.average}/100`;

  document.getElementById("bestDay").textContent =
    weekly.bestScore >= 0 ? `${weekly.bestDay} (${weekly.bestScore})` : "--";

  document.getElementById("worstDay").textContent =
    weekly.worstScore <= 100
      ? `${weekly.worstDay} (${weekly.worstScore})`
      : "--";

  document.getElementById("weeklyTime").textContent = formatTime(
    weekly.weeklyTime,
  );

  document.getElementById("weeklySwitches").textContent = weekly.weeklySwitches;

  const trendDays = Object.entries(window.currentDailyStats || {})
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-selectedTrendRange)
    .map(([date, stats]) => ({
      date,
      score: calculateFocusScore(stats),
    }));

  renderTrend(trendDays);
}

function updateWeeklyDelta(dailyStats) {
  const allDaysAsc = Object.entries(dailyStats || {})
    .filter(([date, stats]) => date && stats)
    .sort((a, b) => a[0].localeCompare(b[0]));

  const element = document.getElementById("weeklyDelta");
  const periodElement = document.getElementById("weeklyDeltaPeriod");

  if (!element) return;

  if (allDaysAsc.length < 14) {
    element.textContent = "Need 14 recorded days to compare periods.";

    if (periodElement) {
      periodElement.textContent = `Currently have ${allDaysAsc.length} recorded day(s).`;
    }

    return;
  }

  const current = allDaysAsc.slice(-7);
  const previous = allDaysAsc.slice(-14, -7);

  const currentAverage = Math.round(
    current.reduce((sum, [, stats]) => sum + calculateFocusScore(stats), 0) /
      current.length,
  );

  const previousAverage = Math.round(
    previous.reduce((sum, [, stats]) => sum + calculateFocusScore(stats), 0) /
      previous.length,
  );

  const delta = currentAverage - previousAverage;

  const currentStart = current[0][0];
  const currentEnd = current[current.length - 1][0];

  const previousStart = previous[0][0];
  const previousEnd = previous[previous.length - 1][0];

  if (periodElement) {
    periodElement.textContent = "Compared with the previous 7 recorded days";
  }

  if (delta > 0) {
    element.textContent = `▲ Improved by ${delta} points`;
  } else if (delta < 0) {
    element.textContent = `▼ Down by ${Math.abs(delta)} points`;
  } else {
    element.textContent = "No change from the previous period";
  }
}

/* -----------------------------
   History log
------------------------------*/

function updateHistoryTable(dailyStats) {
  const body = document.getElementById("historyBody");

  body.innerHTML = "";

  const rows = Object.entries(dailyStats || {})
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7);

  rows.forEach(([date, stats]) => {
    const row = document.createElement("tr");

    const cells = [
      date,
      `${calculateFocusScore(stats)}/100`,
      formatTime(calculateTotalTime(stats.sites)),
      stats.switches || 0,
      stats.maxTabs || 0,
    ];

    cells.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      row.appendChild(td);
    });

    body.appendChild(row);
  });

  document
    .getElementById("logEmptyNote")
    .classList.toggle("is-visible", rows.length === 0);
}

/* -----------------------------
   Personal baseline
------------------------------*/

function updatePersonalBaseline(dailyStats, today) {
  const baseline = calculatePersonalBaseline(dailyStats, today);
  const baselineDaysUsed = document.getElementById("baselineDaysUsed");

  const previousDays = Object.entries(dailyStats || {})
    .filter(([date, stats]) => date < today && stats)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7);

  if (baselineDaysUsed) {
    const count = previousDays.length;

    baselineDaysUsed.textContent = `Based on ${count} previous recorded ${count === 1 ? "day" : "days"} (up to 7).`;
  }

  const baselineValue = document.getElementById("baselineValue");
  const baselineToday = document.getElementById("baselineToday");
  const baselineDelta = document.getElementById("baselineDelta");
  const baselinePercent = document.getElementById("baselinePercent");
  const baselineEmpty = document.getElementById("baselineEmpty");

  if (!baseline) {
    if (baselineValue) {
      baselineValue.textContent = "";
    }

    if (baselineToday) {
      baselineToday.textContent = "";
    }

    if (baselineDelta) {
      baselineDelta.textContent = "";
    }

    if (baselinePercent) {
      baselinePercent.textContent = "";
    }

    if (baselineEmpty) {
      baselineEmpty.style.display = "";
    }

    const content = document.getElementById("baselineContent");

    if (content) {
      content.style.display = "none";
    }

    return;
  }

  const todayStats = dailyStats[today];

  if (!todayStats) {
    return;
  }

  const todayScore = calculateFocusScore(todayStats);
  const delta = todayScore - baseline;

  const percent =
    baseline > 0 ? Math.round((Math.abs(delta) / baseline) * 100) : 0;

  if (baselineValue) {
    baselineValue.textContent = baseline;
  }

  if (baselineToday) {
    baselineToday.textContent = todayScore;
  }

  if (baselineDelta) {
    if (delta > 0) {
      baselineDelta.textContent = `↑ ${delta} points`;
    } else if (delta < 0) {
      baselineDelta.textContent = `↓ ${Math.abs(delta)} points`;
    } else {
      baselineDelta.textContent = "→ Same as usual";
    }
  }

  if (baselinePercent) {
    if (delta > 0) {
      baselinePercent.textContent = `${percent}% better than usual`;
    } else if (delta < 0) {
      baselinePercent.textContent = `${percent}% below your usual`;
    } else {
      baselinePercent.textContent = "Right around your usual";
    }
  }

  if (baselineEmpty) {
    baselineEmpty.style.display = "none";
  }

  const content = document.getElementById("baselineContent");

  if (content) {
    content.style.display = "";
  }
}

/* -----------------------------
   Focus insights
------------------------------*/

function updateFocusInsight(dailyStats, today) {
  const stats = dailyStats[today];

  const titleElement = document.getElementById("focusInsightTitle");
  const messageElement = document.getElementById("focusInsightMessage");

  if (!stats) {
    if (titleElement) {
      titleElement.textContent = "Start your focus journey";
    }

    if (messageElement) {
      messageElement.textContent =
        "Keep using FocusPulse to receive personalized focus insights.";
    }

    return;
  }

  const baseline = calculatePersonalBaseline(dailyStats, today);
  const insight = generateFocusInsight(stats, baseline);

  if (titleElement) {
    titleElement.textContent = insight.title;
  }

  if (messageElement) {
    messageElement.textContent = insight.message;
  }
}

function updateTodayMetrics(stats) {
  const totalTime = calculateTotalTime(stats.sites);

  const sessions = (stats.switches || 0) + 1;

  const average = sessions > 0 ? totalTime / sessions : totalTime;

  let longest = 0;

  Object.values(stats.sites || {}).forEach((time) => {
    if (time > longest) {
      longest = time;
    }
  });

  document.getElementById("longestSession").textContent = formatTime(longest);

  document.getElementById("averageSession").textContent = formatTime(average);

  const score = calculateFocusScore(stats);

  document.getElementById("productivityGrade").textContent =
    getGradeLetter(score);
}

/* -----------------------------
   Weekly report (downloadable summary)

   Reuses the same "longest/average session" approximation
   used by updateTodayMetrics() for a single day, just applied
   across the week's combined totals.

   There is no per-session record kept in storage (only
   cumulative time per site per day), so "top site's total
   time" stands in for "longest session" and
   "total time / (switches + 1)" stands in for "average
   session".

   These are estimates, not exact session logs.
------------------------------*/

function calculateWeeklyTopSite(dailyStats) {
  const totals = {};

  Object.values(dailyStats || {}).forEach((stats) => {
    Object.entries(stats.sites || {}).forEach(([domain, time]) => {
      totals[domain] = (totals[domain] || 0) + time;
    });
  });

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  return entries.length ? entries[0] : null;
}

function calculateWeeklyLongestSite(dailyStats) {
  let longest = 0;

  Object.values(dailyStats || {}).forEach((stats) => {
    Object.values(stats.sites || {}).forEach((time) => {
      if (time > longest) {
        longest = time;
      }
    });
  });

  return longest;
}

function updateWeeklyReport(dailyStats, weekly) {
  const topSite = calculateWeeklyTopSite(dailyStats);

  const sessions = (weekly.weeklySwitches || 0) + 1;

  const averageSession =
    sessions > 0 ? weekly.weeklyTime / sessions : weekly.weeklyTime;

  const longestSession = calculateWeeklyLongestSite(dailyStats);

  document.getElementById("reportAverage").textContent =
    `${weekly.average}/100`;

  document.getElementById("reportBestDay").textContent =
    weekly.bestScore >= 0 ? `${weekly.bestDay} (${weekly.bestScore})` : "--";

  document.getElementById("reportWorstDay").textContent =
    weekly.worstScore <= 100
      ? `${weekly.worstDay} (${weekly.worstScore})`
      : "--";

  document.getElementById("reportBrowsing").textContent = formatTime(
    weekly.weeklyTime,
  );

  document.getElementById("reportSwitches").textContent = weekly.weeklySwitches;

  document.getElementById("reportTopSite").textContent = topSite
    ? topSite[0]
    : "-";

  document.getElementById("reportLongest").textContent =
    formatTime(longestSession);

  document.getElementById("reportAverageSession").textContent =
    formatTime(averageSession);

  document.getElementById("reportGrade").textContent = getGradeLetter(
    weekly.average,
  );
}

/* -----------------------------
   Toast (mirrors popup.js's helper so both surfaces give
   the same feedback on download success/failure)
------------------------------*/

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast._timer);

  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* -----------------------------
   Masthead date
------------------------------*/

function renderDateline() {
  document.getElementById("dateline").textContent =
    new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
}

/* -----------------------------
   Load
------------------------------*/

async function loadDashboard() {
  try {
    const storage = await chrome.storage.local.get("dailyStats");

    const dailyStats = storage.dailyStats || {};

    window.currentDailyStats = dailyStats || {};

    const today = getToday();

    const stats = dailyStats[today];

    renderDateline();

    const readingSection = document.getElementById("readingSection");

    const topSitesBlock = document.getElementById("topSitesBlock");

    if (stats) {
      readingSection.classList.remove("is-empty");

      const scoreBreakdown = calculateFocusScoreBreakdown(stats);
      updateGauge(scoreBreakdown.finalScore);
      updateScoreBreakdown(stats);
      updateTodayStats(stats);
      updateTopSites(stats);
      updateTodayMetrics(stats);
      updatePersonalBaseline(dailyStats, today);
      updateFocusInsight(dailyStats, today);

      topSitesBlock.style.display = "";
    } else {
      readingSection.classList.add("is-empty");

      // No data for today yet - hide the two blocks
      // that only make sense with today's data, but
      // keep weekly signal / log / report visible below
      // since they can still show past days.
      topSitesBlock.style.display = "none";
    }

    // Weekly signal, the log, and the weekly report all use
    // the full week of data, so they render regardless of
    // whether today has anything logged yet.
    const weekly = calculateWeeklySummary(dailyStats);

    if (weekly) {
      updateWeeklySummary(weekly);
    }

    updateWeeklyDelta(dailyStats);

    updateHistoryTable(dailyStats);

    updateWeeklyReport(dailyStats, weekly);
  } catch (error) {
    console.error(error);

    const sheet = document.querySelector(".sheet");

    const message = document.createElement("p");

    message.className = "empty-note is-visible";
    message.innerHTML = `

      <strong>Unable to load dashboard.</strong>

      <br><br>

      Please refresh the page or try again.

    `;

    sheet.prepend(message);
  }
}

loadDashboard();

document.getElementById("downloadWeeklyReport").addEventListener(
  "click",

  async () => {
    const report = `
FOCUS PULSE
WEEKLY REPORT

==========================

Average Focus Score :
${document.getElementById("reportAverage").textContent}

Best Day :
${document.getElementById("reportBestDay").textContent}

Needs Improvement :
${document.getElementById("reportWorstDay").textContent}

Weekly Browsing :
${document.getElementById("reportBrowsing").textContent}

Tab Switches :
${document.getElementById("reportSwitches").textContent}

Most Used Website :
${document.getElementById("reportTopSite").textContent}

Longest Session :
${document.getElementById("reportLongest").textContent}

Average Session :
${document.getElementById("reportAverageSession").textContent}

Productivity Grade :
${document.getElementById("reportGrade").textContent}

Generated :
${new Date().toLocaleString()}
`;

    const blob = new Blob([report], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    try {
      await chrome.downloads.download({
        url,

        filename: `weekly-report-${new Date().toISOString().split("T")[0]}.txt`,
        saveAs: false,
        conflictAction: "uniquify",
      });

      showToast("Weekly report downloaded");
    } catch (error) {
      console.error("Weekly report download failed:", error);
      showToast("Download failed");
    } finally {
      URL.revokeObjectURL(url);
    }
  },
);

document.querySelectorAll(".graph-type-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedGraphType = button.dataset.graph;
    localStorage.setItem("focusPulseGraphType", selectedGraphType);

    document.querySelectorAll(".graph-type-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn === button);
    });

    // The graph type controls the trend strip's appearance.
    renderTrend(
      Object.entries(window.currentDailyStats || {})
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-selectedTrendRange)
        .map(([date, stats]) => ({
          date,
          score: calculateFocusScore(stats),
        })),
    );
  });
});

document.querySelectorAll(".trend-range-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedTrendRange = Number(button.dataset.range);

    document.querySelectorAll(".trend-range-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn === button);
    });

    const trendDays = Object.entries(window.currentDailyStats || {})
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-selectedTrendRange)
      .map(([date, stats]) => ({
        date,
        score: calculateFocusScore(stats),
      }));

    renderTrend(trendDays);

    const label = document.getElementById("trendPeriodLabel");
    if (label) {
      label.textContent = `Last ${selectedTrendRange} days`;
    }
  });
});

// Restore the saved graph type when the dashboard opens.
document.querySelectorAll(".graph-type-btn").forEach((button) => {
  button.classList.toggle(
    "is-active",
    button.dataset.graph === selectedGraphType,
  );
});

// Restore the default date-range selection.
document.querySelectorAll(".trend-range-btn").forEach((button) => {
  button.classList.toggle(
    "is-active",
    Number(button.dataset.range) === selectedTrendRange,
  );
});
