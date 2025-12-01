// Draw status indicator on diagram
function drawStatusIndicator(label, x, y, latestStatusMap, breakdownMap, daysDelayedMap, statusEmoji, modificationQueueMap) {
  const eqNorm = normalize(label);
  const status = latestStatusMap[eqNorm] ?? "0";
  const breakdown = breakdownMap[eqNorm] ?? 0;
  const daysDelayed = daysDelayedMap[eqNorm] || 0;
  const modificationDays = modificationQueueMap?.[eqNorm] || 0;

  const statusLabels = {
    "0": "Operational",
    "1": "Sustainable",
    "2": "Breakdown",
    "3": "Modification"
  };
  const readableStatus = statusLabels[status] || "Unknown";

  const div = document.createElement("div");
  div.className =
    "status-indicator " +
    (status === "2" ? "breakdown"
      : status === "1" ? "sustainable"
        : status === "3" ? "modification"
          : "operational");

  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
  div.style.zIndex = status === "2" ? 3 : (status === "1" || status === "3") ? 2 : 1;

  // Tooltip with conditional Modification Queue
  div.title = `
📌 ${label}
📊 Status: ${readableStatus}
💥 Breakdowns: ${breakdown}
⏱️ Days in Queue: ${daysDelayed}
${status === "3" ? `🛠️ Modification Queue: ${modificationDays}` : ""}
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
// Global flag to enable/disable dragging
// =============================
let draggableEnabled = false; // set false to temporarily disable dragging

// =============================
// Normalize string: lowercase, trim, remove punctuation
// =============================
function normalize(str) {
  return str?.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") || "";
}

// =============================
// Load saved positions from localStorage into equipmentPositionMaps
// =============================
function loadSavedPositions(baseName) {
  const positions = equipmentPositionMaps[baseName];
  if (!positions) return;

  Object.keys(positions).forEach(partName => {
    const saved = localStorage.getItem(`statusPos_${baseName}_${partName}`);
    if (saved) {
      try {
        const { top, left } = JSON.parse(saved);
        positions[partName] = { x: left, y: top };
      } catch (e) { }
    }
  });
}

// =============================
// Show Equipment Detail
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

      <!-- Image container -->
      <div id="equipment-image-container" style="display:none; text-align:center; padding:20px;">
        <img id="equipment-image" src="" alt="Equipment Image" style="max-width:100%; max-height:80vh; object-fit:contain; border-radius:10px; box-shadow:0 0 10px #ccc;">
      </div>
    </div>
  `;

  // Cache elements
  const detailTable = container.querySelector(".table-container");
  const imageContainer = container.querySelector("#equipment-image-container");
  const imageBtn = container.querySelector("#diagram-export-btn");

  imageBtn.textContent = "Equipment Sectional View and Parts List";
  let positioningMode = true;

  // =============================
  // Toggle Table ↔ Image
  // =============================
  imageBtn.addEventListener("click", () => {
    if (detailTable.style.display !== "none") {
      let baseName = label.trim();

      // Special cases
      const labelNorm = normalize(label);

      if (labelNorm.startsWith("belt conveyor")) {
        baseName = "Belt Conveyor";

      } else if (labelNorm.startsWith("screw air compressor")) {
        baseName = "Screw Air Compressor";

      } else if (labelNorm.startsWith("condensate pump")) {
        baseName = "Condensate Pump";

      } else if (labelNorm.startsWith("edi booster pump")) {
        baseName = "EDI Booster Pump";

      } else if (labelNorm.startsWith("secondary ro booster pump")) {
        baseName = "Secondary R.O. Booster Pump";

      } else {
        const suffixMatch = label.match(/\s+[A-Z0-9]$/i);
        if (suffixMatch) baseName = label.replace(suffixMatch[0], "").trim();
      }



      // Load saved positions for this equipment type
      loadSavedPositions(baseName);

      const imgPath = `equipments/${encodeURIComponent(baseName)}.jpg`;
      const positions = equipmentPositionMaps[baseName] || {};
      let indicatorsHTML = "";

      const rowParts = (labelParts) =>
        labelParts ? labelParts.split(",").map((p) => normalize(p)) : [];

      for (const [part, pos] of Object.entries(positions)) {
        // Find all rows for this equipment
        const eqRows = rows.filter((r) => normalize(r["Equipment"]) === normalize(label));
        const matchingRow = eqRows.find((r) =>
          rowParts(r["Parts Needed"]).includes(normalize(part))
        );

        // Status & breakdown
        let status = matchingRow?.["Current Status"] ?? "0";
        let breakdown = matchingRow?.["Breakdown Count"] ?? "0";

        // Extract only the number of days
        let daysDelayedRaw = matchingRow?.["Days Delayed"] ?? "0";
        let daysMatch = daysDelayedRaw.match(/(\d+)\s*days?/i);
        let daysDelayed = daysMatch ? daysMatch[1] : "0";

        // Status labels & emojis
        const statusLabels = { "0": "Operational", "1": "Sustainable", "2": "Breakdown" };
        const statusEmojis = { "0": "🟢", "1": "🟡", "2": "🔴" };
        const readableStatus = statusLabels[status] || "Unknown";
        const statusEmoji = statusEmojis[status] || "⚪";

        indicatorsHTML += `
          <div class="equip-status-indicator ${status === "1" ? "sustainable" : ""} ${status === "2" ? "breakdown" : ""
          }"
              data-tooltip="📌 ${part}
        📊 Status: ${readableStatus}
        💥 Breakdowns: ${breakdown}
        ⏱️ Days in Queue: ${daysDelayed}"
              data-part="${part}"
              style="position:absolute; left:${pos.x}px; top:${pos.y}px; z-index:${status === "2" ? 3 : status === "1" ? 2 : 1
          };"
          >
            <span class="status-icon">${statusEmoji}</span>
            <span class="breakdown-count">${breakdown}</span>
          </div>
        `;

      }

      imageContainer.innerHTML = `
      <div style="position:relative; display:inline-block;">
        <img id="equipment-image" src="${imgPath}" alt="Equipment Image" style="max-width:100%; max-height:80vh; object-fit:contain;">
        ${indicatorsHTML}
      </div>
    `;

      /*   // Make draggable only if enabled
         if (draggableEnabled) {
           imageContainer.querySelectorAll(".equip-status-indicator").forEach((el) => {
             const partName = el.dataset.part || el.textContent;
             makeDraggable(el, partName, true, baseName);
           });
         }*/

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
// makeDraggable helper
// =============================
function makeDraggable(el, partName, positioningMode, baseName) {
  if (!positioningMode || !el || !draggableEnabled) return;

  const savedPos = localStorage.getItem(`statusPos_${baseName}_${partName}`);

  if (savedPos) {
    try {
      const { top, left } = JSON.parse(savedPos);
      el.style.position = "absolute";
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
    } catch (err) { console.warn("Invalid saved position for", partName); }
  }

  el.style.position = el.style.position || "absolute";
  el.style.cursor = "grab";

  let offsetX = 0, offsetY = 0, isDown = false;

  const onMouseMove = (e) => {
    if (!isDown) return;
    const parentRect = el.parentElement.getBoundingClientRect();
    el.style.left = `${e.clientX - parentRect.left - offsetX}px`;
    el.style.top = `${e.clientY - parentRect.top - offsetY}px`;
  };

  const onMouseUp = () => {
    if (isDown) {
      isDown = false;
      el.style.cursor = "grab";
      const top = parseInt(el.style.top);
      const left = parseInt(el.style.left);
      localStorage.setItem(`statusPos_${baseName}_${partName}`, JSON.stringify({ top, left }));


      // Update in-memory map
      if (equipmentPositionMaps[baseName]) {
        equipmentPositionMaps[baseName][partName] = { x: left, y: top };
      }

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  };

  el.addEventListener("mousedown", (e) => {
    isDown = true;
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    el.style.cursor = "grabbing";

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    e.preventDefault();
  });
}

