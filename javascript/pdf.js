document.addEventListener("DOMContentLoaded", () => {
    const checkDataReady = setInterval(() => {
        if (typeof rows !== "undefined" && Array.isArray(rows) && rows.length > 0) {
            clearInterval(checkDataReady);

            const exportBtn = document.getElementById("export-pdf-btn");
            if (!exportBtn) return;

            exportBtn.addEventListener("click", () => {
                const startDateVal = document.getElementById("start-date").value;
                const endDateVal = document.getElementById("end-date").value;

                // Convert to Date objects if both are provided
                const startDate = startDateVal ? new Date(startDateVal) : null;
                const endDate = endDateVal ? new Date(endDateVal) : null;

                const allowedEquipment = [
                    "Slag Cooler A", "Slag Cooler B", "Fly Ash Silo", "Limestone Hopper",
                    "Chain Conveyor A", "Chain Conveyor B", "Main Limestone Silo", "Biomass Bunker",
                    "Circulating Fluidized Bed Boiler", "Secondary High Pressure Water Pump A",
                    "Secondary High Pressure Water Pump B", "Primary R.O. Device A",
                    "Primary R.O. Device B", "Condensate Pump A", "Condensate Pump B",
                    "Boiler Feedwater Pump A", "Boiler Feedwater Pump B", "Heat Exchanger A",
                    "Heat Exchanger B", "Sprinkler", "Auxiliary Control Oil Pump",
                    "Loader 1", "Loader 2", "Elevator", "Electrostatic Precipitator",
                    "Primary High Pressure Water Pump B", "Primary High Pressure Water Pump A"
                ];

                const filteredRows = rows.filter(row => {
                    const status = (row["WR Status"] || "").toLowerCase();
                    const section = (row["Maintenance Section"] || "").toUpperCase();
                    const equipment = row["Equipment"] || "";
                    const rowDate = row["Timestamp"] ? new Date(row["Timestamp"]) : null;
                    const wrstatus = (row["Work Request Status"] || "").toLowerCase();

                    // Date range filter
                    const withinDateRange =
                        (!startDate || (rowDate && rowDate >= startDate)) &&
                        (!endDate || (rowDate && rowDate <= endDate));

                    return status === "pending" &&
                        section !== "TSD" &&
                        allowedEquipment.includes(equipment) &&
                        withinDateRange;
                });

                if (filteredRows.length === 0) {
                    alert("No matching pending Work Requests found for the selected date range.");
                    return;
                }

                // Group by Maintenance Section
                const grouped = {};
                filteredRows.forEach(row => {
                    const section = row["Maintenance Section"] || "UNKNOWN";
                    if (!grouped[section]) grouped[section] = [];
                    grouped[section].push(row);
                });

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                let y = 20;

                doc.setFontSize(14);
                doc.text("Pending Work Requests", 14, y);
                y += 10;

                Object.entries(grouped).forEach(([section, sectionRows], index) => {
                    if (index !== 0) y += 10;
                    const pageHeight = doc.internal.pageSize.height;
                    if (y + 20 >= pageHeight) {
                        doc.addPage();
                        y = 20;
                    }

                    doc.setFontSize(12);
                    doc.setTextColor(0);
                    doc.text(`${section}`, 14, y);
                    y += 6;

                    const tableData = sectionRows.map((row, i) => [
                        i + 1,
                        row["Timestamp"] || "",
                        row["Work Order Num"] || "",
                        row["Equipment"] || "",
                        row["Sub-Component"] || "",
                        row["Brief Description of Problem or Work"] || "",
                        row["*Planning Remarks"] || "",
                    ]);

                    doc.autoTable({
                        head: [["#", "Timestamp", "WR Number", "Equipment", "Sub-Component", "Brief Description", "Planning Remarks"]],
                        body: tableData,
                        startY: y,
                        styles: { fontSize: 10 },
                        headStyles: { fillColor: [41, 128, 185] },
                        margin: { left: 14, right: 14 },
                        didDrawPage: (data) => {
                            y = data.cursor.y;
                        }
                    });
                });

                doc.save("Pending_Work_Requests.pdf");
            });
        }
    }, 300);
});
