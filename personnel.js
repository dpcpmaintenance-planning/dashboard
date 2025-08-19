function groupByPersonnel(data, filterManpower = []) {
    const personnelCounts = {};

    data.forEach(row => {
        const cell = row["PERSONNEL"] || row["Personnel"] || "";
        if (!cell) return;

        // Split by comma or & and trim
        const people = cell.split(/[,&]/).map(p => p.trim()).filter(Boolean);

        const rawType = (row["TYPE OF MAINTENANCE"] || row["Type of Maintenance"] || "").toLowerCase().trim();

        people.forEach(person => {
            // ✅ Skip if filter is applied and person not in selected manpower
            if (filterManpower.length > 0 && !filterManpower.includes(person)) return;

            if (!personnelCounts[person]) {
                personnelCounts[person] = { Preventive: 0, Corrective: 0, Modification: 0, total: 0 };
            }

            if (rawType.includes("preventive") || rawType.includes("pms")) {
                personnelCounts[person].Preventive++;
            } else if (rawType.includes("corrective") || rawType.includes("cm")) {
                personnelCounts[person].Corrective++;
            } else if (rawType.includes("modification")) {
                personnelCounts[person].Modification++;
            }

            personnelCounts[person].total++;
        });
    });

    return Object.entries(personnelCounts)
        .map(([person, counts]) => ({ person, ...counts }))
        .sort((a, b) => b.Preventive - a.Preventive)  // sort by Preventive
        .slice(0, 20);
}



let personnelChart = null;

function renderPersonnelChart(groupedData) {
    const people = groupedData.map(d => d.person);

    const preventive = groupedData.map(d => d.Preventive);
    const corrective = groupedData.map(d => d.Corrective);
    const modification = groupedData.map(d => d.Modification);

    const ctx = document.getElementById("personnelChart").getContext("2d");
    if (personnelChart) personnelChart.destroy();

    personnelChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: people,
            datasets: [
                {
                    label: "Preventive",
                    data: preventive,
                    backgroundColor: "#4caf50",
                },
                {
                    label: "Corrective",
                    data: corrective,
                    backgroundColor: "#f44336",
                },
                {
                    label: "Modification",
                    data: modification,
                    backgroundColor: "#2196f3",
                }
            ],
        },
        options: {
            responsive: true,
            indexAxis: "x", // vertical bars
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: "Manpower",
                    font: { size: 18, family: "Oswald" },
                    padding: { top: 10, bottom: 20 },
                },
            },
            scales: {
                y: { beginAtZero: true }
            },
        },
    });
}
