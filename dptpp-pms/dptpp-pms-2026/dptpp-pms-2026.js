const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5kI51i175dpHi0ZxxnRfT8yhnAa4YARmmbz4M3JapJxhCmLb-8nZaQRJIoYpavCrUon_5yJ4N1bt2/pub?gid=642950523&single=true&output=csv";

// Column indexes
const CATEGORY_COL_OVERVIEW = 17, VALUE_COL_OVERVIEW = 18, ROWS_OVERVIEW = [1,2,3];
const CATEGORY_COL_LABOR = 20, COMPLETED_COL_LABOR = 21, PENDING_COL_LABOR = 22, ROWS_LABOR = [1,2,3,4,5,6,7];
const CATEGORY_COL_PARTS = 24, COMPLETED_COL_PARTS = 25, PENDING_COL_PARTS = 26, ROWS_PARTS = [1,2,3,4,5,6];

const stageCols = ['PR','Bidding','Quotation','TE','WO','Mobilization Requirements','Ticket'];
const stageIndexes = [6,7,8,9,10,11,12]; // Columns G-M (0-based)

const PARTS_STAGE_COLS = ["PR", "QUOTATION", "TE", "PO", "DELIVERY"];
const PARTS_STAGE_INDEX = { PR: 6, QUOTATION: 7, TE: 8, PO: 9, DELIVERY: 10 };


google.charts.load('current', { packages: ['corechart'] });

google.charts.setOnLoadCallback(() => {
    fetch(csvUrl)
        .then(res => res.ok ? res.text() : Promise.reject(`HTTP ${res.status}`))
        .then(csvText => {
            const results = Papa.parse(csvText, { header: false, skipEmptyLines: true }).data;

            drawBarChartOverview(results);
            drawBarChartLabor(results);
            drawBarChartParts(results);

            window.addEventListener('resize', () => {
                drawBarChartOverview(results);
                drawBarChartLabor(results);
                drawBarChartParts(results);
            });
        });
});

// ====== Overview Chart ======
function drawBarChartOverview(csvData) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Progress Item');
    data.addColumn('number', 'Percentage');
    data.addColumn({ type: 'string', role: 'annotation' });

    ROWS_OVERVIEW.forEach(i => {
        const row = csvData[i];
        if (!row) return;
        const category = (row[CATEGORY_COL_OVERVIEW] || '').trim().replace(/"/g,'');
        const value = parseFloat((row[VALUE_COL_OVERVIEW] || '0').replace(/"/g,'').replace('%','').trim()) || 0;
        if (!category) return;
        data.addRow([category, value, value + '%']);
    });

    const options = {
        title: 'PMS 2026 Completion Overall',
        hAxis: { title: 'Progress Item', slantedText: false, slantedTextAngle: 45 },
        vAxis: { title: 'Percentage %', minValue: 0, maxValue: 100 },
        legend: { position: 'none' },
        chartArea: { width: '70%', height: '70%' },
        colors: ['#6aa84f'],
        bar: { groupWidth: "50%" },
        annotations: { alwaysOutside: false, textStyle: { fontSize: 16, color: '#000' }, stem: { color: 'transparent' } }
    };

    new google.visualization.ColumnChart(document.getElementById('bar-chart-container')).draw(data, options);
}

// ====== Labor Chart ======
function drawBarChartLabor(csvData) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Progress Item');
    data.addColumn('number', 'Completed %');
    data.addColumn({ type: 'string', role: 'annotation' });
    data.addColumn('number', 'Pending %');
    data.addColumn({ type: 'string', role: 'annotation' });

    const rowMapping = [];

ROWS_LABOR.forEach(i => {
    const row = csvData[i];
    if (!row) return;

    const category = (row[CATEGORY_COL_LABOR] || '').trim();
    const completed = parseFloat((row[COMPLETED_COL_LABOR] || '0').replace('%','')) || 0;
    const pending = parseFloat((row[PENDING_COL_LABOR] || '0').replace('%','')) || 0;

    if (!category) return;

    data.addRow([category, completed, completed + '%', pending, pending + '%']);

    // Save the entire row for reference + the stage order
    rowMapping.push({ rowData: row, category });
});


    const options = {
        title: 'PMS 2026 LABOR',
        hAxis: { title: 'Progress Item', slantedText: false, slantedTextAngle: 45 },
        vAxis: { title: 'Percentage %', minValue: 0, maxValue: 100 },
        legend: { position: 'top' },
        chartArea: { width: '70%', height: '70%' },
        colors: ['#6aa84f', '#f1c232'],
        bar: { groupWidth: "50%" },
        annotations: { alwaysOutside: false, textStyle: { fontSize: 16, color: '#000' }, stem: { color: 'transparent' } }
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('bar-chart-labor'));
    chart.draw(data, options);

google.visualization.events.addListener(chart, 'select', function() {
    const selection = chart.getSelection();
    if (!selection.length) return;

    const rowIndex = selection[0].row;
    const colIndex = selection[0].column;
    const rowObj = rowMapping[rowIndex];

    // Determine if Completed or Pending
    const showCompleted = colIndex === 1; // Completed
    // Pending column (assuming chart structure)
    // const showCompleted = colIndex === 3; 

    // Determine the stage based on the series clicked
    // Map series index to stageCols (you may need to adjust index depending on chart)
    const stageName = stageCols[rowIndex]; // assumes each row represents a stage

    if (!stageName) return;

    // Show modal for that stage & Completed/Pending
    showModalForStage(csvData, stageName, showCompleted);
});

// ====== Modal Function with Multi-Column Search ======
function showModalForStage(csvData, stageName, showCompleted) {
    const modal = document.getElementById('detailsModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalList = document.getElementById('modalList');

    modalTitle.textContent = `${showCompleted ? 'Completed' : 'Pending'} items for ${stageName}`;
    modalList.innerHTML = '';

    const stageIdx = stageCols.indexOf(stageName);
    if (stageIdx === -1) return;
    const colIdx = stageIndexes[stageIdx];

    const table = document.createElement('table');
    table.classList.add('modal-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Item No.<br><input type="text" placeholder="Search Item No"></th>
                <th>Particulars<br><input type="text" placeholder="Search Particulars"></th>
                <th>REF. PR/PO<br><input type="text" placeholder="Search REF"></th>
                <th>REMARKS<br><input type="text" placeholder="Search Remarks"></th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    let count = 0;

    for (let i = 4; i <= 26; i++) {
        const row = csvData[i];
        if (!row) continue;

        const itemNo = (row[0] || '').trim();
        const particulars = (row[1] || '').trim();
        const refPRPO = (row[3] || '').trim();
        const remarks = (row[4] || '').trim();
        if (!particulars) continue;

        const stageValue = (row[colIdx] || '').trim();
        const isCompleted = stageValue && stageValue !== '0';
        const isPending = !stageValue || stageValue === '0';

        // Stage flow check ONLY for completed items
        if (showCompleted && !rowBelongsToStage(row, colIdx)) continue;

        if ((showCompleted && isCompleted) || (!showCompleted && isPending)) {
            count++;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${itemNo}</td>
                <td>${particulars}</td>
                <td>${refPRPO}</td>
                <td>${remarks}</td>
            `;
            tbody.appendChild(tr);
        }
    }

    if (count === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4" style="text-align:center;">No ${showCompleted ? 'completed' : 'pending'} items.</td>`;
        tbody.appendChild(tr);
    }

    modalList.appendChild(table);
    modal.style.display = 'flex';

    // --- Multi-column live search ---
    const inputs = table.querySelectorAll('thead input');
    inputs.forEach((input, colIndex) => {
        input.addEventListener('keyup', () => {
            const filters = Array.from(inputs).map(inp => inp.value.toLowerCase().trim());
            Array.from(tbody.rows).forEach(row => {
                let show = true;
                for (let c = 0; c < filters.length; c++) {
                    const cellText = (row.cells[c]?.textContent || '').toLowerCase();
                    if (!cellText.includes(filters[c])) {
                        show = false;
                        break;
                    }
                }
                row.style.display = show ? '' : 'none';
            });
        });
    });

    document.getElementById('closeModal').onclick = () => modal.style.display = 'none';
    modal.querySelector('.modal-backdrop').onclick = () => modal.style.display = 'none';
}




// ====== Table Filter Function ======
function filterModalTable(input, colIndex) {
    const table = input.closest('table');
    const filter = input.value.toUpperCase();
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const cell = row.cells[colIndex];
        row.style.display = (cell && cell.textContent.toUpperCase().indexOf(filter) > -1) ? '' : 'none';
    });
}



}

// ====== Helper Function ======
function rowBelongsToStage(row, stageCol) {
    const stageOrder = [6,7,8,9,10]; // G-K columns: PR, QUOTATION, TE, PO, DELIVERY
    const thisIndex = stageOrder.indexOf(stageCol);

    if (thisIndex === -1) return false; // stageCol not found

    // Ensure all previous stages are completed
    for (let i = 0; i < thisIndex; i++) {
        const prevVal = (row[stageOrder[i]] || "").trim();
        if (!prevVal || prevVal === "0") return false;
    }
    return true;
}

// ====== Parts Chart ======
function drawBarChartParts(csvData) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Stage');
    data.addColumn('number', 'Completed %');
    data.addColumn({ type: 'string', role: 'annotation' });
    data.addColumn('number', 'Pending %');
    data.addColumn({ type: 'string', role: 'annotation' });

    const stages = PARTS_STAGE_COLS;   // ["PR","QUOTATION","TE","PO","DELIVERY"]
    const rowMapping = [];

    // Build chart rows from summary columns (first row of each stage block)
    for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];

        const completed = parseFloat((csvData[ROWS_PARTS[0] + i][COMPLETED_COL_PARTS] || '0').replace('%', '')) || 0;
        const pending = parseFloat((csvData[ROWS_PARTS[0] + i][PENDING_COL_PARTS] || '0').replace('%', '')) || 0;

        data.addRow([stage, completed, completed + '%', pending, pending + '%']);
        rowMapping.push({ stage });
    }

    const options = {
        title: 'PMS 2026 PARTS',
        hAxis: { title: 'Stage' },
        vAxis: { title: 'Percentage %', minValue: 0, maxValue: 100 },
        legend: { position: 'top' },
        chartArea: { width: '70%', height: '70%' },
        colors: ['#6aa84f', '#f1c232']
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('bar-chart-parts'));
    chart.draw(data, options);

    // Click event
    google.visualization.events.addListener(chart, 'select', function () {
        const sel = chart.getSelection();
        if (!sel.length) return;

        const rowIndex = sel[0].row;
        const colIndex = sel[0].column;

        const stage = stages[rowIndex];
        if (!stage) return;

        const showCompleted = colIndex === 1;
        const showPending = colIndex === 3;

        showModalForPartsStage(csvData, stage, showCompleted, showPending);
    });
}


// ====== Modal for Parts by Stage (with stage flow check + column search) ======
function showModalForPartsStage(csvData, stage, showCompleted, showPending) {
    const modal = document.getElementById("detailsModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalList = document.getElementById("modalList");

    modalList.innerHTML = "";
    modalTitle.textContent = `${showCompleted ? "Completed" : "Pending"} Items for ${stage}`;

    const stageCol = PARTS_STAGE_INDEX[stage]; // G–K columns
    if (stageCol === undefined) return;

    // Create modal table with search inputs
    const table = document.createElement("table");
    table.classList.add("modal-table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Item No.<br><input type="text" placeholder="Search Item No"></th>
                <th>Particulars<br><input type="text" placeholder="Search Particulars"></th>
                <th>REF. PR/PO<br><input type="text" placeholder="Search REF"></th>
                <th>REMARKS<br><input type="text" placeholder="Search Remarks"></th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");
    let found = false;

    for (let r = 37; r <= 76; r++) {
        const row = csvData[r];
        if (!row) continue;

        const itemNo = (row[0] || "").trim();
        const particulars = (row[1] || "").trim();
        const refPRPO = (row[3] || "").trim();
        const remarks = (row[4] || "").trim();
        const stageValue = (row[stageCol] || "").trim();

        if (!particulars) continue; // skip blank rows
        if (!rowBelongsToStage(row, stageCol)) continue; // previous stages must be complete

        const isCompleted = stageValue && stageValue !== "0";
        const isPending = !stageValue || stageValue === "0";

        if ((showCompleted && isCompleted) || (showPending && isPending)) {
            found = true;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${itemNo}</td>
                <td>${particulars}</td>
                <td>${refPRPO}</td>
                <td>${remarks}</td>
            `;
            tbody.appendChild(tr);
        }
    }

    if (!found) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4" style="text-align:center;">No ${showCompleted ? "completed" : "pending"} items.</td>`;
        tbody.appendChild(tr);
    }

    modalList.appendChild(table);
    modal.style.display = "flex";

    // ===== Add multi-column live search =====
    const inputs = table.querySelectorAll('thead input');
    inputs.forEach((input, colIndex) => {
        input.addEventListener('keyup', () => {
            const filters = Array.from(inputs).map(inp => inp.value.toLowerCase().trim());
            Array.from(tbody.rows).forEach(row => {
                let show = true;
                for (let c = 0; c < filters.length; c++) {
                    const cellText = (row.cells[c]?.textContent || '').toLowerCase();
                    if (!cellText.includes(filters[c])) {
                        show = false;
                        break;
                    }
                }
                row.style.display = show ? '' : 'none';
            });
        });
    });

    document.getElementById("closeModal").onclick = () => modal.style.display = "none";
    modal.querySelector(".modal-backdrop").onclick = () => modal.style.display = "none";
}

