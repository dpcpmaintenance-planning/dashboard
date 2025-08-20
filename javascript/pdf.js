document.addEventListener("DOMContentLoaded", () => {
    const checkDataReady = setInterval(() => {
        if (typeof rows !== "undefined" && Array.isArray(rows) && rows.length > 0) {
            clearInterval(checkDataReady);

            const exportBtn = document.getElementById("export-pdf-btn");
            if (!exportBtn) return;

            exportBtn.addEventListener("click", () => {
                const startDateVal = document.getElementById("start-date").value;
                const endDateVal = document.getElementById("end-date").value;

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
                    "Primary High Pressure Water Pump B", "Primary High Pressure Water Pump A",
                    "Ash Bin 1", "Ash Bin 2", "Ash Bin 3", "Ash Bin 4", "Ash Bin 5", "Ash Bin 6", "Ash Bin 7", "Ash Bin 8",
                    "Ash Bin 9", "Ash Bin 10", "Bucket Elevator A", "Bucket Elevator B", "Sea Water Intake Pump A", "Sea Water Intake Pump B",
                    "Belt Conveyor 1A", "Belt Conveyor 1B", "Belt Conveyor 2A", "Belt Conveyor 2B", "Belt Conveyor 3A", "Belt Conveyor 3B",
                    "Belt Conveyor 1C", "Belt Conveyor 2C", "Belt Conveyor 3C", "Belt Conveyor 4C", "Wet Mixer", "Fuel Unloading Pump",
                    "Circulating Water Pump A", "Circulating Water Pump B", "Circulating Water Pump C", "Steam Drum", "Air Dryer A",
                    "Air Dryer B", "Screw Air Compressor A", "Screw Air Compressor B", "Coal Crusher A", "Coal Crusher B", "Primary R.O. Tank",
                    "Dump Truck MDT-77", "Dump Truck MDT-78", "Backhoe 1", "Backhoe 2", "Dump Truck MDT-75"
                ];

                const filteredRows = rows.filter(row => {
                    const status = (row["WR Status"] || "").toLowerCase();
                    const section = (row["Maintenance Section"] || "").toUpperCase();
                    const equipment = row["Equipment"] || "";
                    const rowDate = row["Timestamp"] ? new Date(row["Timestamp"]) : null;

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

                // Group rows by Maintenance Section
                const grouped = {};
                filteredRows.forEach(row => {
                    const section = (row["Maintenance Section"] || "UNKNOWN").toUpperCase();
                    if (!grouped[section]) grouped[section] = [];
                    grouped[section].push(row);
                });

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                });

                let y = 20;
                doc.setFontSize(14);
                doc.text("Pending Work Requests", 14, y);
                y += 10;

                const sectionOrder = ["MECHANICAL", "ELECTRICAL", "I&C"];
                const orderedSections = [
                    ...sectionOrder.filter(sec => grouped[sec]),
                    ...Object.keys(grouped).filter(sec => !sectionOrder.includes(sec))
                ];

                orderedSections.forEach((section, index) => {
                    const sectionRows = grouped[section];

                    if (index !== 0) y += 10;
                    const pageHeight = doc.internal.pageSize.height;

                    if (y + 20 >= pageHeight) {
                        doc.addPage();
                        y = 20;
                    }

                    doc.setFontSize(12);
                    doc.setTextColor(0);
                    doc.text(section, 14, y);
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
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [41, 128, 185] },
                        margin: { left: 14, right: 14 },
                        didDrawPage: (data) => {
                            y = data.cursor.y;
                        }
                    });
                });

                const today = new Date();
                const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${today.getFullYear()}`;
                doc.save(`Pending_Work_Requests_${formattedDate}.pdf`);

            });
        }
    }, 300);
});
