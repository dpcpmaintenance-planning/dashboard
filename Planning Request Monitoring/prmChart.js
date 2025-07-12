let approvalChartInstance;

function renderApprovalChart(data) {
    const brfStatuses = { Approved: 0, Pending: 0 };
    const prStatuses = { Approved: 0, Pending: 0 };
    const poStatuses = { Approved: 0, Pending: 0 };

    const approvedKeywords = [
        "approved",
        "approved for payment",
        "upload to share point",
        "approve for payment"
    ];
    const pendingKeywords = ["for approval", "for revision"];

    data.forEach((row) => {
        const brf = (row["BRF STATUS"] || "").toLowerCase();
        const pr = (row["PR STATUS"] || "").toLowerCase();
        const po = (row["PO/WO STATUS"] || "").toLowerCase();

        if (approvedKeywords.some((kw) => brf.includes(kw)))
            brfStatuses.Approved++;
        else if (pendingKeywords.some((kw) => brf.includes(kw)))
            brfStatuses.Pending++;

        if (approvedKeywords.some((kw) => pr.includes(kw)))
            prStatuses.Approved++;
        else if (pendingKeywords.some((kw) => pr.includes(kw)))
            prStatuses.Pending++;

        if (approvedKeywords.some((kw) => po.includes(kw)))
            poStatuses.Approved++;
        else if (pendingKeywords.some((kw) => po.includes(kw)))
            poStatuses.Pending++;
    });

    // === Get Filter Summary for Chart Title ===
    const filterLabels = [];
    const filterMap = {
        categoryFilter: "Category",
        sectionFilter: "Section",
        systemFilter: "System",
        currentFilter: "Current Status",
        quotationFilter: "Quotation Status",
        brfFilter: "BRF Status",
        prFilter: "PR Status",
        poFilter: "PO/WO Status",
        deliveryFilter: "Delivery Status"
    };

    for (const [id, label] of Object.entries(filterMap)) {
        const el = document.getElementById(id);
        if (el && el.value) {
            filterLabels.push(`${label}: ${el.value}`);
        }
    }

    const filterSummary =
        filterLabels.length > 0 ? `Filtered by: ${filterLabels.join(", ")}` : "All Records";

    // === Draw or Update Chart ===
    const ctx = document.getElementById("approvalBarChart").getContext("2d");

    if (approvalChartInstance) {
        approvalChartInstance.destroy();
    }

    approvalChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["BRF No.", "PR No.", "PO/WO No."],
            datasets: [
                {
                    label: "Approved",
                    data: [
                        brfStatuses.Approved,
                        prStatuses.Approved,
                        poStatuses.Approved
                    ],
                    backgroundColor: "#28a745"
                },
                {
                    label: "Pending",
                    data: [
                        brfStatuses.Pending,
                        prStatuses.Pending,
                        poStatuses.Pending
                    ],
                    backgroundColor: "#ffc107"
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: `Approval Status of BRF / PR / PO/WO — ${filterSummary}`,
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Count"
                    }
                }
            }
        }
    });
}
