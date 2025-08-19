function groupProblemsBySystem(data) {
  const result = {};
  data.forEach((row) => {
    const system = row["SYSTEM"] || "Unknown System";
    const problem = row["TYPE OF PROBLEM/ACTIVITY"] || "Unspecified";
    if (!result[system]) result[system] = {};
    if (!result[system][problem]) result[system][problem] = 0;
    result[system][problem]++;
  });
  return result;
}

function renderProblemChart(groupedProblems, selectedSystems) {
  const ctx = document.getElementById("problemChart").getContext("2d");

  let problems = {};

  if (!selectedSystems || selectedSystems.length === 0) {
    // No system filter selected → combine all systems
    for (const system in groupedProblems) {
      for (const [problem, count] of Object.entries(groupedProblems[system])) {
        problems[problem] = (problems[problem] || 0) + count;
      }
    }
  } else {
    // Use only the selected systems
    selectedSystems.forEach(system => {
      const sysProblems = groupedProblems[system] || {};
      for (const [problem, count] of Object.entries(sysProblems)) {
        problems[problem] = (problems[problem] || 0) + count;
      }
    });
  }

  // Sort top 20
  const sorted = Object.entries(problems)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const labels = sorted.map(([problem]) => problem);
  const data = sorted.map(([_, count]) => count);

  const greenList = ["PMS", "Change OIl", "Visual Inspection / Cleaning", "Annual PMS", "Regreasing / Lubrication"];
  const backgroundColors = labels.map((label) =>
    greenList.includes(label) ? "#00C853" : "#FF0000"
  );

  if (problemChart) problemChart.destroy();

  problemChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: selectedSystems && selectedSystems.length === 1
            ? `${selectedSystems[0]} - Problem/Activity`
            : `All Systems - Problem/Activity`,
          data,
          backgroundColor: backgroundColors,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: selectedSystems && selectedSystems.length === 1
            ? `Nature of Activity in ${selectedSystems[0]}`
            : `Nature of Activity in All Systems`,
          font: { size: 18, family: "Oswald" },
        },
        datalabels: {
          anchor: "center",
          align: "center",
          color: "#fff",
          font: { size: 12, weight: "bold", family: "monospace" },
          formatter: Math.round,
        },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "#eee" } },
        x: { ticks: { font: { size: 12 } }, grid: { display: false } },
      },
    },
    plugins: [ChartDataLabels],
  });
}



function getTopPreventiveSystem(groupedData) {
  let maxSystem = null;
  let maxCount = -1;
  for (const [system, counts] of Object.entries(groupedData)) {
    if (counts.Preventive > maxCount) {
      maxCount = counts.Preventive;
      maxSystem = system;
    }
  }
  return maxSystem;
}