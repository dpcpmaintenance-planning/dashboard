const csvUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRJsdbqvJZosavRLmcTpv6POWOtrWlQLSb5hNEttqh4eRAnng2itnoxNqo-KTawzIllbVsBv4huHdOQ/pub?gid=0&single=true&output=csv";

let allData = [];

fetch(csvUrl)
    .then((response) => response.text())
    .then((csvText) => {
        const rows = csvText.split("\n");
        const csvWithoutFirstRow = rows.slice(1).join("\n");

        Papa.parse(csvWithoutFirstRow, {
            header: true,
            skipEmptyLines: true,
            transformHeader: function (header) {
                return header.trim();
            },
            complete: function (results) {
                allData = results.data;
                populateFilters(allData);
                generateTable(allData);
            },
        });
    });

function generateTable(data) {
    const headerRow = document.getElementById("tableHeader");
    const body = document.getElementById("tableBody");
    headerRow.innerHTML = "";
    body.innerHTML = "";

    if (!data.length) return;

    const headers = Object.keys(data[0]);

    // Generate headers
    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // Generate rows
    data.forEach((row) => {
        const tr = document.createElement("tr");
        headers.forEach((header) => {
            const td = document.createElement("td");
            const cellValue = row[header] || "";

            if (header.toLowerCase() === "status") {
                const status = cellValue.toLowerCase();
                const badge = document.createElement("span");
                badge.classList.add("badge");
                badge.classList.add(
                    status.includes("done")
                        ? "done"
                        : status.includes("delayed")
                            ? "delayed"
                            : status.includes("ongoing")
                                ? "ongoing"
                                : "pending"
                );
                badge.textContent = cellValue;
                td.appendChild(badge);
            } else {
                td.textContent = cellValue;
            }

            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

function populateFilters(data) {
    const statusFields = [
        { id: "currentFilter", key: "Current Status" },
        { id: "quotationFilter", key: "Quotation Status" },
        { id: "brfFilter", key: "BRF Status" },
        { id: "prFilter", key: "PR Status" },
        { id: "poFilter", key: "PO/WO STATUS" },
        { id: "deliveryFilter", key: "Delivery Status" },
        { id: "currentFilter", key: "Current Status" }
    ];

    statusFields.forEach((field) => {
        const select = document.getElementById(field.id);
        if (!select) return;

        // Try to find the actual column key using case-insensitive match
        const actualKey = Object.keys(data[0]).find(
            k => k.trim().toLowerCase() === field.key.toLowerCase()
        );

        if (!actualKey) {
            console.warn(`Column "${field.key}" not found in CSV headers`);
            return;
        }

        const uniqueValues = [
            ...new Set(
                data.map(row => (row[actualKey]?.trim() || "")).filter(Boolean)
            )
        ].sort();

        // Clear old options
        select.innerHTML = '<option value="">All</option>';

        uniqueValues.forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    });
}


function filterTable() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const currentFilter = document.getElementById("currentFilter").value;
    const quotationFilter = document.getElementById("quotationFilter").value;
    const brfFilter = document.getElementById("brfFilter").value;
    const prFilter = document.getElementById("prFilter").value;
    const poFilter = document.getElementById("poFilter").value;
    const deliveryFilter = document.getElementById("deliveryFilter").value;

    const filteredData = allData.filter((row) => {
        const matchesSearch = Object.values(row).some((val) =>
            String(val || "").toLowerCase().includes(input)
        );

        const matchesCurrent =
            !currentFilter || row["CURRENT STATUS"] === currentFilter;
        const matchesQuotation =
            !quotationFilter || row["QUOTATION STATUS"] === quotationFilter;
        const matchesBRF = !brfFilter || row["BRF STATUS"] === brfFilter;
        const matchesPR = !prFilter || row["PR STATUS"] === prFilter;
        const matchesPO = !poFilter || row["PO/WO STATUS"] === poFilter;
        const matchesDelivery =
            !deliveryFilter || row["DELIVERY STATUS"] === deliveryFilter;

        return (
            matchesSearch &&
            matchesCurrent &&
            matchesQuotation &&
            matchesBRF &&
            matchesPR &&
            matchesPO &&
            matchesDelivery
        );
    });

    generateTable(filteredData);
}

// Navigation
function redirectWithFade() {
    document.body.classList.remove("fade-in");
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = "prm.html";
    }, 300);
}
function goHome() {
    window.location.href = "../index.html";
}
function goBack() {
    window.location.href = "welcome.html";
}
function resetFilters() {
    document.getElementById("searchInput").value = "";
    ["quotationFilter", "brfFilter", "prFilter", "poFilter", "deliveryFilter"].forEach(
        (id) => {
            document.getElementById(id).value = "";
        }
    );
    generateTable(allData);
}
