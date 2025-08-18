// Draw status indicator on diagram
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

  // Clicking opens detail view
  div.addEventListener("click", () => {
    showEquipmentDetail(label);
  });

  document.getElementById("diagram").appendChild(div);
}



// =============================
// Separated: Equipment Detail
// =============================
function showEquipmentDetail(label) {
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
              <th>Timestamp</th>
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
  const imageBtn = container.querySelector("#diagram-export-btn");

  // Initial table view
  imageBtn.textContent = "Equipment Sectional View and Parts List";
  let positioningMode = true;

  // Toggle table ↔ image
  // Example: your map of equipment parts and positions


  imageBtn.addEventListener("click", () => {
    if (detailTable.style.display !== "none") {
      let baseName = label.trim();

      // Strip suffix (like "A", "1")
      const suffixMatch = label.match(/\s+[A-Z0-9]$/i);
      if (suffixMatch) {
        baseName = label.replace(suffixMatch[0], "").trim();
      }

      const imgPath = `equipments/${encodeURIComponent(baseName)}.jpg`;

      // Load positions for this equipment type
      // Load positions for this equipment type
      const positions = equipmentPositionMaps[baseName] || {};

      // Build indicators
      let indicatorsHTML = "";

      // Split parts in the row by comma and trim spaces
      const rowParts = (labelParts) => labelParts.split(",").map(p => p.trim());

      for (const [part, pos] of Object.entries(positions)) {
        // Find all rows where the equipment matches
        const eqRows = rows.filter(r => normalize(r["Equipment"]) === normalize(label));

        // Check if any of the rows include this part in "Parts Needed"
        const matchingRow = eqRows.find(r => rowParts(r["Parts Needed"]).includes(part));

        let status = matchingRow?.["Current Status"] ?? "0";
        let breakdown = matchingRow?.["Breakdown Count"] ?? "0";
        let daysDelayed = matchingRow?.["Days in Queue"] ?? "0";

        const statusLabels = {
          "0": "Operational",
          "1": "Sustainable",
          "2": "Breakdown",
        };
        const statusEmojis = {
          "0": "🟢",
          "1": "🟡",
          "2": "🔴",
        };

        const readableStatus = statusLabels[status] || "Unknown";
        const statusEmoji = statusEmojis[status] || "⚪";

        // Build emoji indicator
        indicatorsHTML += `
    <div class="equip-status-indicator ${status === "1" ? "sustainable" : ""} ${status === "2" ? "breakdown" : ""}"
         data-tooltip="📌 ${part}
📊 Status: ${readableStatus}
💥 Breakdowns: ${breakdown}
⏱️ Days in Queue: ${daysDelayed}"
         style="left:${pos.x}px; top:${pos.y}px; z-index:${status === "2" ? 3 : status === "1" ? 2 : 1
          };">
      <span class="status-icon">${statusEmoji}</span>
      <span class="breakdown-count">${breakdown}</span>
    </div>
  `;
      }


      // Render diagram + indicators
      imageContainer.innerHTML = `
      <div style="position:relative; display:inline-block;">
        <img id="equipment-image" src="${imgPath}" alt="Equipment Image"
             style="max-width:100%; max-height:80vh; object-fit:contain;">
        ${indicatorsHTML}
      </div>
    `;

      detailTable.style.display = "none";
      imageContainer.style.display = "block";
      imageBtn.textContent = "Table View";

    } else {
      detailTable.style.display = "block";
      imageContainer.style.display = "none";
      imageBtn.textContent = "Equipment Sectional View and Parts List";
    }
  });






  updateDiagramTableInline();

  // Back to main diagram
  container.querySelector(".back-btn").addEventListener("click", () => {
    currentDiagramEquipment = "";
    diagramWRStatus = "";
    updateDiagram();
  });
}



// =============================
// Helper: draggable emoji
// =============================
function makeDraggable(el, baseName, positioningMode) {
  if (!positioningMode) return;
  let offsetX, offsetY, isDown = false;

  el.addEventListener("mousedown", (e) => {
    isDown = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    if (isDown) {
      isDown = false;
      el.style.cursor = "grab";
      localStorage.setItem(`statusPos_${baseName}`, JSON.stringify({
        top: parseInt(el.style.top),
        left: parseInt(el.style.left)
      }));
    }
  });
}