function groupByPersonnel(data) {
    const personnelCounts = {};

    data.forEach(row => {
        const cell = row["PERSONNEL"] || row["Personnel"] || "";
        if (!cell) return;

        const people = cell.split(",").map(p => p.trim()).filter(Boolean);
        const rawType = (row["TYPE OF MAINTENANCE"] || row["Type of Maintenance"] || "").toLowerCase().trim();

        people.forEach(person => {
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
        .sort((a, b) => b.total - a.total);  // 🔥 sort by total (descending)
}



let personnelChart = null;

// Map of personnel images
const personnelImages = {
    "Botavara": "images/BOTAVARA.png",
    "Borlagdatan": "images/BORLAGDATAN.png",
    "Bandiola": "images/BANDIOLA.png",
    "Aiso": "images/AISO.png",
    "Sotito": "images/SOTITO.png",
    "Agravante": "images/AGRAVANTE.png",
    "Alfeche": "images/ALFECHE.png",
    "Bacay": "images/BACAY.png",
    "Bagnate": "images/BAGNATE.png",
    "Baldivino": "images/BALDIVINO.png",
    "Biona": "images/BIONA.png",
    "Bundac": "images/BUNDAC.png",
    "Caabay": "images/CAABAY.png",
    "Capuno": "images/CAPUNO.png",
    "Catbagan": "images/CATBAGAN.png",
    "Celino": "images/CELINO.png",
    "Constantino": "images/CONSTANTINO.png",
    "Cualing": "images/CUALING.png",
    "Denosta": "images/DENOSTA.png",
    "Esmenda": "images/ESMENDA.png",
    "Fabrigas": "images/FABRIGAS.png",
    "Gattoc": "images/GATTOC.png",
    "Ilagan": "images/ILAGAN.png",
    "Juanerio": "images/JUANERIO.png",
    "Laureano": "images/LAUREANO.png",
    "Manzano": "images/MANZANO.png",
    "Mumar": "images/MUMAR.png",
    "Oaman": "images/OAMAN.png",
    "Palay": "images/PALAY.png",
    "Pamittan": "images/PAMITTAN.png",
    "Parcon": "images/PARCON.png",
    "Peralta": "images/PERALTA.png",
    "Rodriguez": "images/RODRIGUEZ.png",
    "Romero": "images/ROMERO.png",
    "Salazar": "images/SALAZAR.png",
    "Salcedo": "images/SALCEDO.png",
    "Salomon": "images/SALOMON.png",
    "Santos": "images/SANTOS.png",
    "Silang": "images/SILANG.png",
    "Sison": "images/SISON.png",
    "Simaurio": "images/SIMAURIO.png",
    "Tagaro": "images/TAGARO.png",
    "Torregoza": "images/TORREGOZA.png",
    "Villatura": "images/VILLATURA.png",
    "Zabala": "images/ZABALA.png",
    "Zonio": "images/ZONIO.png"
};

function renderPersonnelChart(groupedData) {
    const container = document.getElementById("personnel-container");
    container.innerHTML = "";

    if (!groupedData || groupedData.length === 0) return;

    // Determine the max value across all personnel for proportional X-axis
    const maxValue = Math.max(...groupedData.flatMap(p => [p.Preventive, p.Corrective, p.Modification]));

    groupedData.forEach(person => {
        // 🔥 Skip if no image available (hide for now)
        if (!personnelImages[person.person]) {
            return;
        }

        // Container row
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        rowDiv.style.alignItems = "center";
        rowDiv.style.gap = "20px";
        rowDiv.style.marginBottom = "20px";
        rowDiv.style.padding = "10px";
        rowDiv.style.borderRadius = "8px";
        rowDiv.style.background = "#fff";
        rowDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
        rowDiv.style.transition = "transform 0.2s";
        rowDiv.addEventListener("mouseenter", () => rowDiv.style.transform = "translateY(-2px)");
        rowDiv.addEventListener("mouseleave", () => rowDiv.style.transform = "translateY(0)");

        // Left: Image + Name
        const leftDiv = document.createElement("div");
        leftDiv.style.textAlign = "center";
        const img = document.createElement("img");
        img.src = personnelImages[person.person]; // ✅ safe, only defined ones reach here
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";
        img.style.marginBottom = "8px";
        img.style.border = "2px solid #ddd";

        const name = document.createElement("div");
        name.textContent = person.person;
        name.style.fontWeight = "bold";
        name.style.fontSize = "14px";
        name.style.textAlign = "center";

        leftDiv.appendChild(img);
        leftDiv.appendChild(name);

        // Right: Horizontal bar chart
        const rightDiv = document.createElement("div");
        rightDiv.style.flex = "1";
        rightDiv.style.minWidth = "250px";
        rightDiv.style.height = "100px";
        const canvas = document.createElement("canvas");
        rightDiv.appendChild(canvas);

        rowDiv.appendChild(leftDiv);
        rowDiv.appendChild(rightDiv);
        container.appendChild(rowDiv);

        // Chart.js code (unchanged)...
        new Chart(canvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: [person.person],
                datasets: [
                    { label: "Preventive", data: [person.Preventive], backgroundColor: "#4caf50", stack: "maintenance" },
                    { label: "Corrective", data: [person.Corrective], backgroundColor: "#f44336", stack: "maintenance" },
                    { label: "Modification", data: [person.Modification], backgroundColor: "#2196f3", stack: "maintenance" }
                ]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 800, easing: "easeOutQuart" },
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: "center",
                        align: "center",
                        color: "#fff",
                        font: { weight: "bold", size: 14 },
                        formatter: value => value === 0 ? "" : value
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            stepSize: 500,
                            callback: value => value
                        },
                        suggestedMax: Math.ceil(maxValue / 500) * 500,
                        grid: { drawTicks: true, drawBorder: true }
                    },
                    y: {
                        stacked: true,
                        barPercentage: 0.6,
                        categoryPercentage: 0.7,
                        ticks: { display: false },
                        grid: { drawTicks: false, drawBorder: false }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    });
}

