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
