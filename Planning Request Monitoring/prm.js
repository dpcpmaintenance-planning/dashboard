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
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                allData = results.data;
                populateFilters(allData);
                generateTable(allData);
                renderApprovalChart(allData); // Call external chart script
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

    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });

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
        { id: "categoryFilter", key: "Category" },
        { id: "sectionFilter", key: "Section" },
        { id: "systemFilter", key: "System" },
        { id: "currentFilter", key: "Current Status" },
        { id: "quotationFilter", key: "Quotation Status" },
        { id: "brfFilter", key: "BRF Status" },
        { id: "prFilter", key: "PR Status" },
        { id: "poFilter", key: "PO/WO STATUS" },
        { id: "deliveryFilter", key: "Delivery Status" },
    ];

    statusFields.forEach(({ id, key }) => {
        const select = document.getElementById(id);
        if (!select) return;

        const actualKey = Object.keys(data[0]).find(
            (k) => k.trim().toLowerCase() === key.toLowerCase()
        );
        if (!actualKey) return;

        const uniqueValues = [
            ...new Set(
                data.map((row) => (row[actualKey]?.trim() || "")).filter(Boolean)
            ),
        ].sort();

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
    const filters = {
        category: document.getElementById("categoryFilter").value,
        section: document.getElementById("sectionFilter").value,
        system: document.getElementById("systemFilter").value,
        current: document.getElementById("currentFilter").value,
        quotation: document.getElementById("quotationFilter").value,
        brf: document.getElementById("brfFilter").value,
        pr: document.getElementById("prFilter").value,
        po: document.getElementById("poFilter").value,
        delivery: document.getElementById("deliveryFilter").value,
    };

    const filteredData = allData.filter((row) => {
        const matchesSearch = Object.values(row).some((val) =>
            String(val || "").toLowerCase().includes(input)
        );

        const match = (key, filterValue) =>
            !filterValue || (row[key]?.trim() || "") === filterValue;

        return (
            matchesSearch &&
            match("CATEGORY", filters.category) &&
            match("SECTION", filters.section) &&
            match("SYSTEM", filters.system) &&
            match("CURRENT STATUS", filters.current) &&
            match("QUOTATION STATUS", filters.quotation) &&
            match("BRF STATUS", filters.brf) &&
            match("PR STATUS", filters.pr) &&
            match("PO/WO STATUS", filters.po) &&
            match("DELIVERY STATUS", filters.delivery)
        );
    });

    generateTable(filteredData);
    renderApprovalChart(filteredData); // Re-render chart with filtered data
}

function resetFilters() {
    document.getElementById("searchInput").value = "";
    [
        "categoryFilter",
        "sectionFilter",
        "systemFilter",
        "currentFilter",
        "quotationFilter",
        "brfFilter",
        "prFilter",
        "poFilter",
        "deliveryFilter",
    ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    generateTable(allData);
    renderApprovalChart(allData); // Reset chart
}

// Navigation
function goBack() {
    window.location.href = "welcome.html";
}
function goHome() {
    window.location.href = "../index.html";
}
function redirectWithFade() {
    document.body.classList.remove("fade-in");
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = "prm.html";
    }, 300);
}
