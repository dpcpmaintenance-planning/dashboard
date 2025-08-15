function drawStatusIndicator(label, x, y, latestStatusMap, breakdownMap, daysDelayedMap, statusEmoji) {
    const eqNorm = normalize(label);
    const status = latestStatusMap[eqNorm] ?? "0";
    const breakdown = breakdownMap[eqNorm] ?? 0;
    const daysDelayed = daysDelayedMap[eqNorm] || 0;

    const statusLabels = { "0": "Operational", "1": "Sustainable", "2": "Breakdown" };
    const readableStatus = statusLabels[status] || "Unknown";

    const div = document.createElement("div");
    div.className =
        "status-indicator " +
        (status === "2" ? "breakdown" : status === "1" ? "sustainable" : "operational");

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.zIndex = status === "2" ? 3 : status === "1" ? 2 : 1;

    div.title = `
📌 ${label}
📊 Status: ${readableStatus}
💥 Breakdowns: ${breakdown}
⏱️ Days in Queue: ${daysDelayed}
  `.trim();

    const emoji = encodeURIComponent(statusEmoji[status]);
    div.style.backgroundImage = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='28'>${emoji}</text></svg>")`;

    div.innerHTML = `<div class="count">${breakdown || 0}</div>`;

    // Inline detail view instead of modal
    div.addEventListener("click", () => {
        currentDiagramEquipment = label;
        diagramWRStatus = "";

        const container = document.querySelector(".diagram-container");
        container.style.backgroundImage = "none";
        container.innerHTML = `
      <div class="detail-view">
        <button class="back-btn">⬅ Back to Diagram</button><br><br>

        <div class="header-row">
          <div class="header-left">
            <h2>${label}</h2>
            <div class="filter-buttons">
              <button id="diagram-pending-btn">Pending</button>
              <button id="diagram-done-btn">Done</button>
            </div>
          </div>
          <div class="header-right">
            <button id="diagram-export-btn">Equipment Sectional View and Parts List</button>
          </div>
        </div>

        <div class="table-container">
          <table class="detail-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Work Order Num</th>
                <th>Equipment</th>
                <th>Sub-Component</th>
                <th>Brief Description</th>
                <th>Detailed Description</th>
                <th>Severity</th>
                <th>Planning Remarks</th>
                <th>Status</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody id="diagram-table-body"></tbody>
          </table>
        </div>

        <!-- Image container, hidden by default -->
        <div id="equipment-image-container" style="display:none; text-align:center; padding:20px;">
          <img id="equipment-image" src="" alt="Equipment Image" style="max-width:100%; max-height:80vh; object-fit:contain; border-radius:10px; box-shadow:0 0 10px #ccc;">
        </div>
      </div>
    `;

        // Cache elements
        const detailTable = container.querySelector(".table-container");
        const imageContainer = container.querySelector("#equipment-image-container");
        const equipmentImage = container.querySelector("#equipment-image");
        const imageBtn = container.querySelector("#diagram-export-btn");

        // Initial table view
        imageBtn.textContent = "Equipment Sectional View and Parts List";

        // Toggle table ↔ image
        imageBtn.addEventListener("click", () => {
            if (detailTable.style.display !== "none") {
                // Switch to image view
                let baseName = label.replace(/\s+[A-Z0-9]+$/i, "").trim();
                const imgPath = `equipments/${encodeURIComponent(baseName)}.jpg`;

                equipmentImage.src = imgPath;
                detailTable.style.display = "none";
                imageContainer.style.display = "block";
                imageBtn.textContent = "Table View";
            } else {
                // Switch back to table view
                detailTable.style.display = "block";
                imageContainer.style.display = "none";
                imageBtn.textContent = "Equipment Sectional View and Parts List";
            }
        });

        updateDiagramTableInline();

        container.querySelector(".back-btn").addEventListener("click", () => {
            currentDiagramEquipment = "";
            diagramWRStatus = "";
            updateDiagram();
        });
    });

    document.getElementById("diagram").appendChild(div);
}