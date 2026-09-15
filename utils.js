export function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function formatTime(ms) {
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);

  if (hrs > 0) {
    return `${hrs}h ${mins % 60}m`;
  }

  return `${mins}m`;
}

export function calculateTotalTime(sites) {
  return Object.values(sites || {}).reduce((sum, value) => sum + value, 0);
}

export function calculateFocusScore(stats) {
  if (!stats) return 0;

  let score = 100;

  score -= (stats.switches || 0) * 1.5;
  score -= (stats.shortVisits || 0) * 3;

  const siteCount = Object.keys(stats.sites || {}).length;

  if (siteCount > 15) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculatePersonalBaseline(dailyStats, today) {
  const previousDays = Object.entries(dailyStats || {})
    .filter(([date]) => date !== today)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7);

  // We need at least 3 previous days
  // before showing a personal baseline.
  if (previousDays.length < 3) {
    return null;
  }

  const scores = previousDays.map(([, stats]) => calculateFocusScore(stats));

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  return Math.round(average);
}

export function calculateFocusScoreBreakdown(stats) {
  if (!stats) {
    return {
      startingScore: 100,
      switchPenalty: 0,
      shortVisitPenalty: 0,
      sitePenalty: 0,
      finalScore: 0,
    };
  }

  const switches = stats.switches || 0;
  const shortVisits = stats.shortVisits || 0;
  const siteCount = Object.keys(stats.sites || {}).length;

  const switchPenalty = switches * 1.5;
  const shortVisitPenalty = shortVisits * 3;
  const sitePenalty = siteCount > 15 ? 10 : 0;

  const finalScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - switchPenalty - shortVisitPenalty - sitePenalty),
    ),
  );

  return {
    startingScore: 100,
    switchPenalty,
    shortVisitPenalty,
    sitePenalty,
    finalScore,
  };
}

/* Score zones shared by the popup gauge, dashboard gauge,
   and dashboard trend strip - one place so they can never
   disagree with each other. */

export function zoneForScore(score) {
  if (score >= 80) return "high";
  if (score >= 50) return "mid";
  return "low";
}

export const ZONE_LABEL = {
  high: "Highly focused",
  mid: "Moderately focused",
  low: "Distracted",
};

export function needleAngle(score) {
  return (score / 100) * 180 - 90;
}

/* Letter grade from a 0-100 score. Lives next to zoneForScore so
   the grade boundaries and the score/zone boundaries can't quietly
   drift apart from each other. Used by the dashboard's Insights
   card and weekly report. */

export function getGradeLetter(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 65) return "C";
  return "D";
}

export function generateFocusInsight(stats, baseline = null) {
  if (!stats) {
    return {
      title: "Start your focus journey",
      message:
        "Keep using FocusPulse to collect enough activity data for personalized insights.",
    };
  }

  const score = calculateFocusScore(stats);
  const switches = stats.switches || 0;
  const shortVisits = stats.shortVisits || 0;
  const siteCount = Object.keys(stats.sites || {}).length;

  // Personal baseline insight
  if (baseline !== null) {
    const delta = score - baseline;

    if (delta <= -10) {
      return {
        title: "You're below your usual focus",
        message:
          `Your focus score is ${Math.abs(delta)} points below your personal baseline. ` +
          "Try keeping fewer active tabs during your next work period.",
      };
    }

    if (delta >= 10) {
      return {
        title: "You're above your usual focus",
        message:
          `Your focus score is ${delta} points above your personal baseline. ` +
          "Keep using the browsing routine that worked well today.",
      };
    }
  }

  // Switching insight
  if (switches > 80) {
    return {
      title: "Try reducing tab switching",
      message:
        "You switched tabs frequently today. Keeping fewer active tabs may help reduce unnecessary switching.",
    };
  }

  // Short-visit insight
  if (shortVisits > 10) {
    return {
      title: "Try staying longer on each task",
      message:
        "You had several short visits today. When starting a task, try staying on it a little longer before switching.",
    };
  }

  // Website variety insight
  if (siteCount > 15) {
    return {
      title: "Simplify your browsing",
      message:
        "You visited many different websites today. Consider closing websites you are not currently using.",
    };
  }

  // Strong score
  if (score >= 90) {
    return {
      title: "Great focus today",
      message:
        "Your focus score is very strong today. Keep using the browsing routine that works for you.",
    };
  }

  // General positive insight
  if (score >= 70) {
    return {
      title: "Keep building your focus",
      message:
        "Your browsing activity is looking steady today. Keep your current routine going.",
    };
  }

  // General low-score insight
  return {
    title: "Give your browsing a reset",
    message:
      "Your focus score is lower today. Try closing tabs you are not currently using and focus on one task at a time.",
  };
}
