let approvalChartInstance = null;

function renderApprovalChart(data) {
    const brfStatuses = { Approved: 0, Pending: 0 };
    const prStatuses = { Approved: 0, Pending: 0 };
    const poStatuses = { Approved: 0, Pending: 0 };

    // Keywords to check for each status category
    const approvedKeywords = [
        "approved",
        "approve for payment",
        "approved for payment",
        "upload to share point",
    ];
    const pendingKeywords = ["pending", "for approval", "for revision"];

    // Normalize helper
    const normalize = (val) => (val || "").toLowerCase().trim();

    data.forEach((row) => {
        const brfStatus = normalize(row["BRF STATUS"]);
        const prStatus = normalize(row["PR STATUS"]);
        const poStatus = normalize(row["PO/WO STATUS"]);

        if (approvedKeywords.some((kw) => brfStatus.includes(kw))) brfStatuses.Approved++;
        else if (pendingKeywords.some((kw) => brfStatus.includes(kw))) brfStatuses.Pending++;

        if (approvedKeywords.some((kw) => prStatus.includes(kw))) prStatuses.Approved++;
        else if (pendingKeywords.some((kw) => prStatus.includes(kw))) prStatuses.Pending++;

        if (approvedKeywords.some((kw) => poStatus.includes(kw))) poStatuses.Approved++;
        else if (pendingKeywords.some((kw) => poStatus.includes(kw))) poStatuses.Pending++;
    });

    const ctx = document.getElementById("approvalBarChart").getContext("2d");

    // Destroy previous chart if exists
    if (approvalChartInstance) {
        approvalChartInstance.destroy();
    }

    approvalChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["BRF", "PR", "PO/WO"],
            datasets: [
                {
                    label: "Approved",
                    data: [
                        brfStatuses.Approved,
                        prStatuses.Approved,
                        poStatuses.Approved,
                    ],
                    backgroundColor: "#28a745",
                },
                {
                    label: "Pending",
                    data: [
                        brfStatuses.Pending,
                        prStatuses.Pending,
                        poStatuses.Pending,
                    ],
                    backgroundColor: "#ffc107",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: "Approval Status of BRF, PR, and PO/WO",
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                    },
                },
            },
        },
    });
}
