function groupBySystemAndMaintenance(data) {
  const result = {};
  data.forEach((entry) => {
    const system = (entry["SYSTEM"] || "Unknown System").trim();
    const rawType = (entry["TYPE OF MAINTENANCE"] || "").toLowerCase().trim();

    if (!result[system]) {
      result[system] = { Preventive: 0, Corrective: 0, Modification: 0 };
    }

    if (rawType.includes("preventive") || rawType.includes("pms")) {
      result[system].Preventive++;
    } else if (rawType.includes("corrective")) {
      result[system].Corrective++;
    } else if (rawType.includes("modification")) {
      result[system].Modification++;
    }
  });

  return result;
}

function renderGroupedChart(groupedData) {
  const selectedSystems = getSelectedValues("filter-system");

  const allData = Object.entries(groupedData)
    .filter(([system]) => selectedSystems.length === 0 || selectedSystems.includes(system))
    .map(([system, counts]) => ({
      system,
      ...counts,
      total: counts.Preventive + counts.Corrective + counts.Modification,
    }));

  const prioritySystems = [
    "Slag Removal System", "Fly Ash Handling System", "Limestone Handling System",
    "Combustion System", "Water Treatment System", "Coal Handling System",
    "Biomass Handling System", "Feedwater System", "Circulating Water System",
    "Closed Circulating Cooling Water System", "Heavy Equipment", "Compressed Air System",
    "Electro-Chlorination Water System", "Main Steam System", "Seawater Intake and Drainage System",
    "Steam and Water Sampling System", "Turbine Oil System", "Electrical",
  ];

  const priority = [], others = [];
  allData.forEach(item =>
    (prioritySystems.includes(item.system) ? priority : others).push(item)
  );

  priority.sort((a, b) => b.Preventive - a.Preventive);
  others.sort((a, b) => b.Preventive - a.Preventive);

  const combined = [...priority, ...others].slice(0, 18);
  const systems = combined.map(i => i.system);
  const preventiveData = combined.map(i => i.Preventive);
  const correctiveData = combined.map(i => i.Corrective);
  const modificationData = combined.map(i => i.Modification);

  const ctx = document.getElementById("maintenanceChart").getContext("2d");
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: systems,
      datasets: [
        {
          label: "Preventive",
          data: preventiveData,
          backgroundColor: "#4caf50",
          borderColor: "#388e3c",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Corrective",
          data: correctiveData,
          backgroundColor: "#FF0000",
          borderColor: "#d32f2f",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Modification",
          data: modificationData,
          backgroundColor: "#2196f3",
          borderColor: "#1976d2",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: { font: { size: 13, family: "monospace" }, padding: 10 },
        },
        title: {
          display: true,
          text: `History Records`,
          font: { size: 18, family: "Oswald" },
          padding: { top: 10, bottom: 20 },
        },
        datalabels: {
          color: "#fff",
          anchor: "center",
          align: "center",
          rotation: -90,
          font: { weight: "bold", size: 12, family: "monospace" },
          formatter: Math.round,
          clamp: true,
          clip: false
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {},
          grid: { color: "#eee" },
        },
        x: {
          grid: { display: false },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}
