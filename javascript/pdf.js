document.addEventListener("DOMContentLoaded", () => {
    // Helper: parse Timestamp strings like Date(2025,0,29,18,18,21)
    function parseRowTimestamp(ts) {
        if (!ts) return null;
        if (ts instanceof Date) return ts;

        const match = ts.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
        if (match) {
            const [_, year, month, day, hour, min, sec] = match.map(Number);
            return new Date(year, month, day, hour, min, sec);
        }

        const d = new Date(ts);
        return isNaN(d) ? null : d;
    }

    // Helper: format date as "August 26, 2025 at 07:07"
    function formatDateTime(date) {
        if (!date) return "";
        const options = { year: "numeric", month: "long", day: "numeric" };
        const dateStr = date.toLocaleDateString("en-US", options);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${dateStr} at ${hours}:${minutes}`;
    }

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
                    "Ash Bin 1", "Ash Bin 2", "Ash Bin 3", "Ash Bin 4", "Ash Bin 5", "Ash Bin 6",
                    "Ash Bin 7", "Ash Bin 8", "Ash Bin 9", "Ash Bin 10", "Soot Blower 1", "Soot Blower 2",
                    "Bucket Elevator A", "Bucket Elevator B", "Soot Blower 3", "Soot Blower 4",
                    "Soot Blower 5", "Soot Blower 6", "Soot Blower 7", "Soot Blower 8",
                    "Belt Conveyor 1A", "Belt Conveyor 1B", "Belt Conveyor 2A", "Belt Conveyor 2B",
                    "Belt Conveyor 3A", "Belt Conveyor 3B", "Belt Conveyor 1C", "Belt Conveyor 2C",
                    "Belt Conveyor 3C", "Belt Conveyor 4C", "Wet Mixer", "Metal Detector A", "Metal Detector B",
                    "Circulating Water Pump A", "Circulating Water Pump B", "Circulating Water Pump C",
                    "Steam Drum", "Air Dryer A", "Air Dryer B", "Screw Air Compressor A",
                    "Screw Air Compressor B", "Coal Crusher A", "Coal Crusher B", "Primary R.O. Tank",
                    "Dump Truck MDT-77", "Dump Truck MDT-78", "Backhoe 1", "Backhoe 2",
                    "Dump Truck MDT-75", "Star Feeder/Limestone Feeder", "Underground Hopper B",
                    "Underground Hopper A", "Primary Air Fan A", "Primary Air Fan B",
                    "Induced Draft Fan A", "Induced Draft Fan B", "Secondary Air Fan A",
                    "Secondary Air Fan B", "Secondary R.O. Booster Pump A", "Secondary R.O. Booster Pump B",
                    "Closed Cooling Water Pump A", "Closed Cooling Water Pump B", "44ZKKE", "Demineralized Tank",
                    "Air Storage tank 10M^3", "Multi-Media Filter B", "Multi-Media Filter A", "EDI A", "EDI B",
                    "Vibrating Coal Screen B", "Vibrating Coal Screen A", "Secondary Safety Filter B",
                    "Secondary Safety Filter A", "Bag Dust Collector 1", "Bag Dust Collector 2", "Dust Collector 4",
                    "Dust Collector 3", "Coal Feeder A", "Coal Feeder B", "Coal Feeder C", "Mobile Compressor", "Periodic Blowdown Valve",
                    "Periodic Blowdown Tank", "Mobile Oil Purification Device", "Primary Air Preheater", "Industrial Water Pump A",
                    "Industrial Water Pump B", "Rundown Tank", "Envidas",
                ];

                // Filter rows
                const filteredRows = rows.filter(row => {
                    const status = (row["WR Status"] || "").toLowerCase();
                    const section = (row["Maintenance Section"] || "").toUpperCase();
                    const equipment = row["Equipment"] || "";
                    const rowDate = parseRowTimestamp(row["Timestamp"]);

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

                // Group rows by section
                const grouped = {};
                filteredRows.forEach(row => {
                    const section = (row["Maintenance Section"] || "UNKNOWN").toUpperCase();
                    if (!grouped[section]) grouped[section] = [];
                    grouped[section].push(row);
                });

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

                let y = 20;
                doc.setFontSize(14);

                // Title
                doc.text("Pending Work Requests", 14, y);

                // Today's date
                const pageWidth = doc.internal.pageSize.getWidth();
                const todayStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                doc.setFontSize(11);
                doc.text(`Update as of ${todayStr}`, pageWidth - 14, y, { align: "right" });
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

                    const tableData = sectionRows.map(row => {
                        let days = row["Days Delayed"] || "";
                        days = days.replace(/pending\s*for\s*/i, "").replace(/pending\s*/i, "").trim();
                        let daysNum = parseInt(days, 10);
                        if (isNaN(daysNum) || daysNum < 0) daysNum = 0;
                        const daysText = `${daysNum} days`;

                        const tsDate = parseRowTimestamp(row["Timestamp"]);
                        const tsFormatted = formatDateTime(tsDate);

                        return [
                            tsFormatted,
                            row["Work Order Num"] || "",
                            row["Equipment"] || "",
                            row["Sub-Component"] || "",
                            row["Brief Description of Problem or Work"] || "",
                            row["*Planning Remarks"] || "",
                            daysText
                        ];
                    });

                    doc.autoTable({
                        head: [["Timestamp", "WR Number", "Equipment", "Sub-Component", "Brief Description", "Planning Remarks", "Days in Queue"]],
                        body: tableData,
                        startY: y,
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [41, 128, 185] },
                        margin: { left: 14, right: 14 },
                        didDrawPage: (data) => { y = data.cursor.y; }
                    });
                });

                const todayFile = new Date();
                const formattedDate = `${String(todayFile.getMonth() + 1).padStart(2, '0')}-${String(todayFile.getDate()).padStart(2, '0')}-${todayFile.getFullYear()}`;
                doc.save(`Pending_Work_Requests_${formattedDate}.pdf`);
            });
        }
    }, 300);
});
