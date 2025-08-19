const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRoTu1psI2FA0JCVZy32GDnjKZOhF2_I2VFvAml8JDS2vLG24Uh_U7tUVvtsbCylC-fXksZStYrqWlb/pub?gid=0&single=true&output=csv";
let originalData = [];

async function loadData() {
  const response = await fetch(csvUrl);
  const text = await response.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  originalData = parsed.data;
  const filters = getSelectedFiltersFromURL();
  populateFilters(originalData, filters);
  updateTable();
  attachDropdownListeners();
}

function getSelectedFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    system: params.getAll("system"),
    equipment: params.getAll("equipment"),
    maintenance: params.getAll("maintenance"),
    problem: params.getAll("problem"),
    section: params.getAll("section"),
    year: params.getAll("year"),
    quarter: params.getAll("quarter"),
    manpower: params.getAll("manpower"), // new
  };
}

function populateFilters(data, selectedFilters = {}) {
  const sets = {
    system: new Set(),
    equipment: new Set(),
    maintenance: new Set(),
    problem: new Set(),
    section: new Set(),
    year: new Set(),
    manpower: new Set() // new
  };

  data.forEach(row => {
    if (row["SYSTEM"]) sets.system.add(row["SYSTEM"]);
    if (row["EQUIPMENT ID NO."]) sets.equipment.add(row["EQUIPMENT ID NO."]);
    if (row["TYPE OF MAINTENANCE"]) sets.maintenance.add(row["TYPE OF MAINTENANCE"]);
    if (row["TYPE OF PROBLEM/ACTIVITY"]) sets.problem.add(row["TYPE OF PROBLEM/ACTIVITY"]);
    if (row["POINT SECTION"]) sets.section.add(row["POINT SECTION"]);

    // handle multiple manpower
    if (row["PERSONNEL"]) {
      const names = row["PERSONNEL"]
        .split(/[,&]/)           // split by comma or &
        .map(n => n.trim())      // trim spaces
        .filter(Boolean);        // remove empty strings
      names.forEach(name => sets.manpower.add(name));
    }

    const date = new Date(row["DATE STARTED"]);
    if (!isNaN(date)) sets.year.add(date.getFullYear().toString());
  });

  fillSelect("filter-system", Array.from(sets.system), selectedFilters.system);
  fillSelect("filter-equipment", Array.from(sets.equipment), selectedFilters.equipment);
  fillSelect("filter-maintenance", Array.from(sets.maintenance), selectedFilters.maintenance);
  fillSelect("filter-problem", Array.from(sets.problem), selectedFilters.problem);
  fillSelect("filter-section", Array.from(sets.section), selectedFilters.section);
  fillSelect("filter-year", Array.from(sets.year), selectedFilters.year);
  fillSelect("filter-quarter", ["Q1", "Q2", "Q3", "Q4"], selectedFilters.quarter);
  fillSelect("filter-manpower", Array.from(sets.manpower), selectedFilters.manpower); // new
}

function fillSelect(id, values, selected = []) {
  const container = document.getElementById(id);
  container.innerHTML = "";

  const searchDiv = document.createElement("div");
  searchDiv.innerHTML = `<input type="text" placeholder="Search..." class="dropdown-search" />`;
  container.appendChild(searchDiv);

  const allChecked = selected.length === 0;
  const allDiv = document.createElement("div");
  allDiv.innerHTML = `<label><input type="checkbox" value="__ALL__" ${allChecked ? "checked" : ""}> All</label>`;
  container.appendChild(allDiv);

  values.sort().forEach(value => {
    const isChecked = selected.includes(value);
    const div = document.createElement("div");
    div.classList.add("dropdown-item");
    div.innerHTML = `<label><input type="checkbox" value="${value}" ${isChecked ? "checked" : ""}> ${value}</label>`;
    container.appendChild(div);
  });
}

function getSelectedValues(containerId) {
  const container = document.getElementById(containerId);
  const checked = [...container.querySelectorAll("input[type='checkbox']:checked")].map(cb => cb.value);
  return checked.includes("__ALL__") ? [] : checked;
}

function updateTable() {
  const system = getSelectedValues("filter-system");
  const equipment = getSelectedValues("filter-equipment");
  const maintenance = getSelectedValues("filter-maintenance");
  const problem = getSelectedValues("filter-problem");
  const section = getSelectedValues("filter-section");
  const year = getSelectedValues("filter-year");
  const quarter = getSelectedValues("filter-quarter");
  const manpower = getSelectedValues("filter-manpower"); // new

  const filtered = originalData.filter(row => {
    const date = new Date(row["DATE FINISHED"]);
    const rowYear = date.getFullYear().toString();
    const rowQuarter = (date.getMonth() < 3) ? "Q1" :
      (date.getMonth() < 6) ? "Q2" :
        (date.getMonth() < 9) ? "Q3" : "Q4";

    // split manpower in row
    const rowManpower = row["PERSONNEL"]
      ? row["PERSONNEL"].split(/[,&]/).map(n => n.trim())
      : [];

    return (
      (system.length === 0 || system.includes(row["SYSTEM"])) &&
      (equipment.length === 0 || equipment.includes(row["EQUIPMENT ID NO."])) &&
      (maintenance.length === 0 || maintenance.includes(row["TYPE OF MAINTENANCE"])) &&
      (problem.length === 0 || problem.includes(row["TYPE OF PROBLEM/ACTIVITY"])) &&
      (section.length === 0 || section.includes(row["POINT SECTION"])) &&
      (year.length === 0 || year.includes(rowYear)) &&
      (quarter.length === 0 || quarter.includes(rowQuarter)) &&
      (manpower.length === 0 || rowManpower.some(name => manpower.includes(name))) // match any
    );
  });

  renderTable(filtered);
}

function renderTable(data) {
  const container = document.getElementById("table-container");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p>No matching records found.</p>";
    return;
  }

  const excluded = ["WR #", "SERVICE REPORT NO.", "PTW #"];
  const headers = Object.keys(data[0]).filter(h => !excluded.includes(h));

  const table = document.createElement("table");
  table.classList.add("styled-table");
  table.innerHTML = `
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>
      ${data.map(row => `
        <tr>${headers.map(h => `<td>${row[h] || ""}</td>`).join("")}</tr>
      `).join("")}
    </tbody>
  `;
  container.appendChild(table);
}

function attachDropdownListeners() {
  document.querySelectorAll(".dropdown input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", () => {
      const container = cb.closest(".dropdown");
      const allCheckbox = container.querySelector('input[value="__ALL__"]');
      const others = [...container.querySelectorAll('input[type="checkbox"]')].filter(c => c.value !== "__ALL__");

      if (cb.value === "__ALL__") {
        others.forEach(c => c.checked = false);
      } else {
        allCheckbox.checked = false;
      }

      const anyChecked = others.some(c => c.checked);
      if (!anyChecked) allCheckbox.checked = true;

      updateTable();
    });
  });

  // dropdown open/close behavior
  document.querySelectorAll(".dropdown-wrapper").forEach(wrapper => {
    const dropdown = wrapper.querySelector(".dropdown");
    wrapper.addEventListener("click", e => {
      e.stopPropagation();
      document.querySelectorAll(".dropdown").forEach(d => {
        if (d !== dropdown) d.style.display = "none";
      });
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown").forEach(d => d.style.display = "none");
  });

  document.querySelectorAll(".dropdown-search").forEach(search => {
    search.addEventListener("input", () => {
      const term = search.value.toLowerCase();
      const items = search.closest(".dropdown").querySelectorAll(".dropdown-item");
      items.forEach(div => {
        const label = div.textContent.toLowerCase();
        div.style.display = label.includes(term) ? "block" : "none";
      });
    });
  });
}

// Go back to dashboard with filters in URL
document.getElementById("back-to-dashboard").addEventListener("click", () => {
  const url = new URLSearchParams();
  ["system", "equipment", "maintenance", "problem", "section", "year", "quarter", "manpower"].forEach(key => {
    const values = getSelectedValues(`filter-${key}`);
    values.forEach(v => url.append(key, v));
  });
  window.location.href = `history.html?${url.toString()}`;
});

// Clear filters
document.getElementById("clear-filters").addEventListener("click", () => {
  populateFilters(originalData);
  updateTable();
});

loadData();
