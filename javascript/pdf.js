document.addEventListener("DOMContentLoaded", () => {
    const checkDataReady = setInterval(() => {
        if (typeof rows !== "undefined" && Array.isArray(rows) && rows.length > 0) {
            clearInterval(checkDataReady);

            const exportBtn = document.getElementById("export-pdf-btn");
            if (!exportBtn) return;

            exportBtn.addEventListener("click", () => {
                const pendingRows = rows.filter(row => {
                    const status = (row["WR Status"] || "").toLowerCase();
                    const section = (row["Maintenance Section"] || "").toUpperCase();
                    return status === "pending" && section !== "TSD";
                });

                if (pendingRows.length === 0) {
                    alert("No pending Work Requests found (excluding TSD).");
                    return;
                }

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                doc.setFontSize(14);
                doc.text("Pending Work Requests", 14, 20);

                // Group by Maintenance Section
                const grouped = {};
                pendingRows.forEach(row => {
                    const section = row["Maintenance Section"] || "Unspecified";
                    if (!grouped[section]) grouped[section] = [];
                    grouped[section].push(row);
                });

                let currentY = 30;

                Object.entries(grouped).forEach(([section, sectionRows], index) => {
                    if (index !== 0) currentY += 10; // space between sections

                    doc.setFontSize(14);
                    doc.text(`${section}`, 14, currentY);
                    currentY += 6;

                    const tableData = sectionRows.map((row, i) => [
                        i + 1,
                        row["Work Order Num"] || "",
                        row["Equipment"] || "",
                        row["Sub-Component"] || "",
                        row["Brief Description of Problem or Work"] || "",
                    ]);

                    doc.autoTable({
                        head: [["#", "WR Number", "Equipment", "Sub-Component", "Brief Description"]],
                        body: tableData,
                        startY: currentY,
                        styles: { fontSize: 10 },
                        headStyles: { fillColor: [41, 128, 185] },
                        margin: { left: 14, right: 14 },
                        didDrawPage: (data) => {
                            currentY = data.cursor.y;
                        }
                    });
                });

                doc.save("Pending_Work_Requests.pdf");
            });
        }
    }, 300);
});
