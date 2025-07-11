function groupByYearAndQuarter(data) {
  const result = {};

  data.forEach((entry) => {
    const dateStr = entry["DATE FINISHED"];
    const typeRaw = entry["TYPE OF MAINTENANCE"] || "";
    const type = typeRaw.toLowerCase();
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return;

    const year = date.getFullYear();
    const month = date.getMonth(); // 0 = Jan, 11 = Dec
    let quarter = "Q1";
    if (month >= 3 && month <= 5) quarter = "Q2";
    else if (month >= 6 && month <= 8) quarter = "Q3";
    else if (month >= 9 && month <= 11) quarter = "Q4";

    if (!result[year]) {
      result[year] = {
        Preventive: 0,
        Corrective: 0,
        Modification: 0,
        quarters: {
          Preventive: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
          Corrective: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
          Modification: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        },
      };
    }

    const yearData = result[year];

    if (type.includes("preventive") || type.includes("pms")) {
      yearData.Preventive++;
      yearData.quarters.Preventive[quarter]++;
    } else if (type.includes("corrective")) {
      yearData.Corrective++;
      yearData.quarters.Corrective[quarter]++;
    } else if (type.includes("modification")) {
      yearData.Modification++;
      yearData.quarters.Modification[quarter]++;
    }
  });

  return result;
}

function renderYearlyTrendChart(filteredData) {
  const selectedYears = getSelectedValues("filter-year");
  const yearCounts = groupByYearAndQuarter(filteredData);

  let years = Object.keys(yearCounts).sort();
  if (selectedYears.length > 0) {
    years = years.filter((y) => selectedYears.includes(y));
  }

  const preventive = years.map((y) => yearCounts[y]?.Preventive || 0);
  const corrective = years.map((y) => yearCounts[y]?.Corrective || 0);
  const modification = years.map((y) => yearCounts[y]?.Modification || 0);

  const ctx = document.getElementById("yearlyTrendChart").getContext("2d");
  if (yearlyChart) yearlyChart.destroy();

  yearlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: years,
      datasets: [
        {
          label: "Preventive",
          data: preventive,
          backgroundColor: "#4caf50",
          borderColor: "#388e3c",
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "Corrective",
          data: corrective,
          backgroundColor: "#FF0000",
          borderColor: "#d32f2f",
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "Modification",
          data: modification,
          backgroundColor: "#2196f3",
          borderColor: "#1976d2",
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 20 },
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: { size: 13, family: "monospace" },
            padding: 10,
          },
        },
        title: {
          display: true,
          text:
            selectedYears.length > 0
              ? `Maintenance Trend for ${selectedYears.join(", ")}`
              : "Yearly Maintenance Trend",
          font: { size: 18, family: "Oswald" },
          padding: { top: 10, bottom: 20 },
        },
        tooltip: {
          backgroundColor: "#333",
          bodyFont: { size: 13 },
          cornerRadius: 6,
          padding: 10,
          callbacks: {
            afterLabel: function (context) {
              const year = context.label;
              const label = context.dataset.label; // Preventive, Corrective, etc.
              const q = yearCounts[year]?.quarters?.[label];
              if (!q) return null;
              return [
                `Q1: ${q.Q1 || 0}`,
                `Q2: ${q.Q2 || 0}`,
                `Q3: ${q.Q3 || 0}`,
                `Q4: ${q.Q4 || 0}`,
              ];
            },
          },
        },
        datalabels: {
          color: "#fff",
          anchor: "center",
          align: "center",
          font: {
            size: 13,
            family: "monospace",
            weight: "bold",
          },
          formatter: (value) => (value > 0 ? value : ""),
        },
      },
      scales: {
        x: {
          ticks: { font: { family: "monospace", size: 12 } },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { font: { family: "monospace", size: 12 } },
          grid: { color: "#f0f0f0" },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}
