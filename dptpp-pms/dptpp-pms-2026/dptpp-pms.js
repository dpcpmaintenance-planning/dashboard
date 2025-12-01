// The public URL of your CSV data
const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5kI51i175dpHi0ZxxnRfT8yhnAa4YARmmbz4M3JapJxhCmLb-8nZaQRJIoYpavCrUon_5yJ4N1bt2/pub?gid=642950523&single=true&output=csv";

// Helper function to parse CSV text into Google Charts format
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const chartData = { columns: [], data: [] };

    if (lines.length < 2) return chartData;

    // We want data from Columns O and P. In a 0-indexed array:
    // A=0, B=1, ..., O=14, P=15.
    const COL_O_INDEX = 14;
    const COL_P_INDEX = 15;

    // We want data starting from row 4 (header at row 3). 
    // In a 0-indexed lines array: row 1 is index 0 (header), row 4 is index 3.
    const START_ROW_INDEX = 3;
    const END_ROW_INDEX = 6; // To include up to row 7 (index 6)

    // Check if the CSV has enough columns for O and P
    // The first line (index 0) is the header line
    const headerCells = lines[0].split(',');
    if (headerCells.length <= COL_P_INDEX) {
        console.error("CSV does not contain enough columns (up to P) for the specified range.");
        return chartData;
    }

    // --- 1. Process Header (Row 4, which is index 3) ---
    // We treat Row 4 (index 3) of the CSV data as our header row
    const dataHeaderCells = lines[START_ROW_INDEX].split(',');
    const headerO = dataHeaderCells[COL_O_INDEX].trim().replace(/"/g, '');
    const headerP = dataHeaderCells[COL_P_INDEX].trim().replace(/"/g, '');

    chartData.columns = [
        // Column O (Category)
        { label: headerO || 'Category', type: 'string' },
        // Column P (Value)
        { label: headerP || 'Value', type: 'number' }
    ];

    // --- 2. Process Data Rows (starting from Row 5 up to Row 7) ---
    // Start loop from START_ROW_INDEX + 1 (Row 5/index 4) up to END_ROW_INDEX (Row 7/index 6)
    for (let i = START_ROW_INDEX + 1; i <= END_ROW_INDEX && i < lines.length; i++) {
        const cells = lines[i].split(',');

        // Ensure the row has enough cells
        if (cells.length <= COL_P_INDEX) continue;

        // Get and clean data from Column O
        const category = cells[COL_O_INDEX].trim().replace(/"/g, '');

        // Get and convert data from Column P to a number
        const value = Number(cells[COL_P_INDEX].trim().replace(/"/g, ''));

        // Only add if the category is present and the value is a valid number
        if (category && !isNaN(value)) {
            chartData.data.push([category, value]);
        }
    }

    return chartData;
}


// Main function to fetch data and draw the chart (NO CHANGE HERE)
function fetchAndDrawChart() {
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            const { columns, data } = parseCSV(csvText);

            // Create Google DataTable
            const dataTable = new google.visualization.DataTable();
            dataTable.addColumn(columns[0]);
            dataTable.addColumn(columns[1]);
            dataTable.addRows(data);

            // Set chart options
            const options = {
                title: 'Palawan Maintenance Data Overview (O4:P7)',
                hAxis: { title: columns[1].label, minValue: 0 },
                vAxis: { title: columns[0].label },
                legend: { position: 'none' },
                chartArea: { width: '50%', height: '80%' }
            };

            // Instantiate and draw the chart
            const chart = new google.visualization.BarChart(document.getElementById('bar-chart-container'));
            chart.draw(dataTable, options);

        })
        .catch(error => {
            console.error('Error fetching or processing data:', error);
            document.getElementById('bar-chart-container').innerHTML =
                '<h2>Error loading data. Please check the CSV URL and browser console.</h2>';
        });
}


// Load the Google Charts package when the window is ready (NO CHANGE HERE)
window.onload = function () {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(fetchAndDrawChart);
    // Example: if (typeof loadHeaderFooter === 'function') { loadHeaderFooter(); }
}