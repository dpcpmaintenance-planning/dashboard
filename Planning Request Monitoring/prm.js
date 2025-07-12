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
                renderApprovalChart(allData);
            },
        });
    });

function populateFilters(data) {
    const fields = [
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

    fields.forEach(({ id, key }) => {
        const container = document.getElementById(id);
        if (!container) return;

        const actualKey = Object.keys(data[0]).find(
            (k) => k.trim().toLowerCase() === key.toLowerCase()
        );
        if (!actualKey) return;

        const uniqueValues = [
            ...new Set(data.map((row) => (row[actualKey]?.trim() || "")).filter(Boolean)),
        ].sort();

        const dropdown = document.createElement("div");
        dropdown.classList.add("custom-dropdown");

        const toggle = document.createElement("button");
        toggle.classList.add("dropdown-toggle");
        toggle.textContent = "Select";
        toggle.type = "button";
        toggle.onclick = () => dropdown.classList.toggle("open");

        const list = document.createElement("div");
        list.classList.add("checkbox-list");

        uniqueValues.forEach((value) => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = value;

            checkbox.onchange = () => {
                updateDropdownLabel(toggle, list);
                filterTable();
            };

            label.appendChild(checkbox);
            label.append(" " + value);
            list.appendChild(label);
        });

        dropdown.appendChild(toggle);
        dropdown.appendChild(list);
        container.innerHTML = "";
        container.appendChild(dropdown);

        // Initialize label text
        updateDropdownLabel(toggle, list);
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
        document.querySelectorAll(".custom-dropdown").forEach((dropdown) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove("open");
            }
        });
    });
}

function updateDropdownLabel(toggleBtn, checkboxList) {
    const selected = Array.from(
        checkboxList.querySelectorAll("input[type='checkbox']:checked")
    ).map((cb) => cb.value);

    toggleBtn.textContent = selected.length === 0
        ? "Select"
        : selected.length <= 2
            ? selected.join(", ")
            : `${selected.length} selected`;
}

function getCheckedValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    return Array.from(
        container.querySelectorAll("input[type='checkbox']:checked")
    ).map((cb) => cb.value);
}

function filterTable() {
    const input = document.getElementById("searchInput").value.toLowerCase();

    const filters = {
        category: getCheckedValues("categoryFilter"),
        section: getCheckedValues("sectionFilter"),
        system: getCheckedValues("systemFilter"),
        current: getCheckedValues("currentFilter"),
        quotation: getCheckedValues("quotationFilter"),
        brf: getCheckedValues("brfFilter"),
        pr: getCheckedValues("prFilter"),
        po: getCheckedValues("poFilter"),
        delivery: getCheckedValues("deliveryFilter"),
    };

    const filteredData = allData.filter((row) => {
        const matchesSearch = Object.values(row).some((val) =>
            String(val || "").toLowerCase().includes(input)
        );

        const match = (key, selected) =>
            !selected.length || selected.includes((row[key] || "").trim());

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
    renderApprovalChart(filteredData);
}

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

function resetFilters() {
    document.getElementById("searchInput").value = "";

    const filterIds = [
        "categoryFilter",
        "sectionFilter",
        "systemFilter",
        "currentFilter",
        "quotationFilter",
        "brfFilter",
        "prFilter",
        "poFilter",
        "deliveryFilter",
    ];

    filterIds.forEach((id) => {
        const container = document.getElementById(id);
        if (!container) return;

        const toggleBtn = container.querySelector(".dropdown-toggle");
        const list = container.querySelector(".checkbox-list");

        container.querySelectorAll("input[type='checkbox']").forEach((cb) => (cb.checked = false));
        updateDropdownLabel(toggleBtn, list);
    });

    generateTable(allData);
    renderApprovalChart(allData);
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
