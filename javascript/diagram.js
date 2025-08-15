function updateDiagramTableInline() {
  const tbody = document.getElementById("diagram-table-body");

  const filtered = rows
    .filter(r =>
      currentDiagramEquipment
        ? normalize(r["Equipment"]) === normalize(currentDiagramEquipment)
        : true
    )
    .filter(r =>
      diagramWRStatus
        ? r["WR Status"]?.toLowerCase() === diagramWRStatus.toLowerCase()
        : true
    )
    .sort((a, b) => new Date(b["Timestamp"]) - new Date(a["Timestamp"]));

  tbody.innerHTML = filtered.map(row => {
    const rawImageURL = row[imageColumnKey]?.trim();
    let imageCell = "No image";

    if (rawImageURL) {
      const thumbURL = convertGoogleDriveLink(rawImageURL);
      imageCell = `
        <a href="${rawImageURL}" target="_blank" rel="noopener noreferrer">
          <img src="${thumbURL}" 
               alt="Work Request Image" 
               style="width:100px; height:auto; border:1px solid #ccc; border-radius:6px; box-shadow:0 1px 4px rgba(0,0,0,0.1);" />
        </a>
      `;
    }

    return `
      <tr>
        <td>${formatDate(row["Timestamp"])}</td>
        <td>${row["Work Order Num"] || ""}</td>
        <td>${row["Equipment"] || ""}</td>
        <td>${row["Sub-Component"] || ""}</td>
        <td>${row["Brief Description of Problem or Work"] || ""}</td>
        <td>${row["Detailed Description"] || ""}</td>
        <td>${row["Severity"] || ""}</td>
        <td>${row["*Planning Remarks"] || ""}</td>
        <td>${row["WR Status"] || ""}</td>
        <td>${imageCell}</td>
      </tr>
    `;
  }).join("");

  // Filter buttons
  const pendingBtn = document.getElementById("diagram-pending-btn");
  const doneBtn = document.getElementById("diagram-done-btn");

  pendingBtn.onclick = () => {
    diagramWRStatus = (diagramWRStatus.toLowerCase() === "pending") ? "" : "Pending";
    updateDiagramTableInline();
  };

  doneBtn.onclick = () => {
    diagramWRStatus = (diagramWRStatus.toLowerCase() === "done") ? "" : "Done";
    updateDiagramTableInline();
  };

  updateFilterButtonStates();
}


function updateDiagram() {
  const diagram = document.getElementById("diagram");
  const container = document.querySelector(".diagram-container");

  diagramWRStatus = "";
  currentSystemFilter = "";
  currentDiagramEquipment = "";

  if (selectedSystemTab === "equipments") {
    container.classList.add("no-diagram");
    diagram.innerHTML = renderFullEquipmentTable();
    setupEquipmentListFilters();
    return;
  }

  container.classList.remove("no-diagram");

  const imagePath = `systems/${selectedSystemTab}`;
  const img = new Image();
  img.onload = () => {
    container.style.backgroundImage = `url("${imagePath}.jpg")`;
  };
  img.onerror = () => {
    container.style.backgroundImage = `url("${imagePath}.png")`;
  };
  img.src = `${imagePath}.jpg`;

  diagram.innerHTML = "";

  const systemNames = systemGroups[selectedSystemTab] || [];
  const { latestStatusMap, breakdownMap, daysDelayedMap } = getLatestStatusAndBreakdown(rows, systemNames);
  const currentPositionMap = positionMaps[selectedSystemTab] || {};
  const statusEmoji = { 0: "🟢", 1: "🟡", 2: "🔴" };

  const positionGroups = {};
  for (const [key, value] of Object.entries(currentPositionMap)) {
    if (Array.isArray(value)) {
      value.forEach(({ name, x, y }) => {
        const eqNorm = normalize(name);
        const status = latestStatusMap[eqNorm] ?? "0";
        const keyPos = `${x},${y}`;
        if (!positionGroups[keyPos]) positionGroups[keyPos] = [];
        positionGroups[keyPos].push({ name, x, y, status });
      });
    } else {
      const eqNorm = normalize(key);
      const status = latestStatusMap[eqNorm] ?? "0";
      const keyPos = `${value.x},${value.y}`;
      if (!positionGroups[keyPos]) positionGroups[keyPos] = [];
      positionGroups[keyPos].push({ name: key, x: value.x, y: value.y, status });
    }
  }

  for (const group of Object.values(positionGroups)) {
    const sorted = group.sort((a, b) => b.status - a.status);
    const { name, x, y } = sorted[0];
    drawStatusIndicator(name, x, y, latestStatusMap, breakdownMap, daysDelayedMap, statusEmoji);
  }

  const legend = document.createElement("div");
  legend.className = "legend";
  legend.innerHTML = `
    <div><span class="legend-dot operational"></span>🟢 Operational</div>
    <div><span class="legend-dot sustainable"></span>🟡 Sustainable</div>
    <div><span class="legend-dot breakdown"></span>🔴 Breakdown</div>
  `;
  diagram.appendChild(legend);
}


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
    const equipmentImage = container.querySelector("#equipment-image");
    const imageBtn = container.querySelector("#diagram-export-btn");

    // Initial table view
    imageBtn.textContent = "Equipment Sectional View and Parts List";

    // Toggle table ↔ image
    imageBtn.addEventListener("click", () => {
      if (detailTable.style.display !== "none") {
        // Keep original label safe
        let baseName = label.trim();

        // If label ends with just "A", "B", "1", or "2", strip it
        if (/\s+[A-Z0-9]$/i.test(baseName)) {
          baseName = baseName.replace(/\s+[A-Z0-9]$/i, "").trim();
        }

        const imgPath = `equipments/${encodeURIComponent(baseName)}.jpg`;
        const pdfPath = `equipments/${encodeURIComponent(baseName)}.pdf`;

        // Try PDF first
        fetch(pdfPath, { method: "HEAD" })
          .then(res => {
            if (res.ok) {
              // Show PDF in iframe
              imageContainer.innerHTML = `
            <iframe src="${pdfPath}" style="width:100%; height:80vh;" frameborder="0"></iframe>
          `;
            } else {
              // Show image
              imageContainer.innerHTML = `
            <img id="equipment-image" src="${imgPath}" alt="Equipment Image"
                 style="max-width:100%; max-height:80vh; object-fit:contain; border-radius:10px; box-shadow:0 0 10px #ccc;">
          `;
            }
            detailTable.style.display = "none";
            imageContainer.style.display = "block";
            imageBtn.textContent = "Table View";
          })
          .catch(() => {
            // Fallback to image if fetch fails
            imageContainer.innerHTML = `
          <img id="equipment-image" src="${imgPath}" alt="Equipment Image"
               style="max-width:100%; max-height:80vh; object-fit:contain; border-radius:10px; box-shadow:0 0 10px #ccc;">
        `;
            detailTable.style.display = "none";
            imageContainer.style.display = "block";
            imageBtn.textContent = "Table View";
          });

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





function autoRefreshFromSheet() {
  fetch(sheetURL)
    .then((res) => res.text())
    .then((csvText) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          rows = results.data;

          // Update the diagram display
          if (typeof updateDiagram === "function") {
            updateDiagram();
          }

          const modal = document.getElementById("diagram-modal");
          const isModalOpen = modal && !modal.classList.contains("hidden");

          if (isModalOpen) {
            if (currentDiagramEquipment && typeof updateDiagramModalTable === "function") {
              updateDiagramModalTable();
            } else if (typeof showSystemEquipmentList === "function") {
              showSystemEquipmentList(selectedSystemTab, currentSystemFilter);
            }
          }

          // Optional: Update "Last Updated" display
          const updatedEl = document.getElementById("last-updated");
          if (updatedEl) {
            updatedEl.textContent = "Last updated: " + new Date().toLocaleTimeString();
          }
        },
      });
    })
    .catch((error) => {
      console.error("Error auto-refreshing data:", error);
    });
}

setInterval(autoRefreshFromSheet, 300000); // Refresh every 5 minutes


function showSystemEquipmentList(systemTabId, wrStatus = "") {
  const systemNames = systemGroups[systemTabId] || [];
  const tbody = document.getElementById("diagram-table-body");

  if (wrStatus && currentSystemFilter === wrStatus.toLowerCase()) {
    wrStatus = "";
    currentSystemFilter = "";
  } else {
    currentSystemFilter = wrStatus.toLowerCase();
  }

  const filtered = rows
    .filter((r) => systemNames.includes(r["System"]))
    .filter((r) =>
      wrStatus ? r["WR Status"]?.toLowerCase() === wrStatus.toLowerCase() : true
    )
    .sort((a, b) => new Date(b["Timestamp"]) - new Date(a["Timestamp"]));

  tbody.innerHTML = filtered
    .map((row) => {
      const rawImageURL = row[imageColumnKey]?.trim();
      let imageCell = "No image";

      if (rawImageURL) {
        const thumbURL = convertGoogleDriveLink(rawImageURL);
        imageCell = `
          <a href="${rawImageURL}" target="_blank" rel="noopener noreferrer">
            <img src="${thumbURL}" 
                 alt="Work Request Image"
                 style="width:100px; height:auto; border:1px solid #ccc; border-radius:6px; box-shadow:0 1px 4px rgba(0,0,0,0.1);" />
          </a>
        `;
      }

      return `
        <tr>
          <td>${formatDate(row["Timestamp"])}</td>
          <td>${row["Work Order Num"] || ""}</td>
          <td>${row["Equipment"] || ""}</td>
          <td>${row["Sub-Component"] || ""}</td>
          <td>${row["Brief Description of Problem or Work"] || ""}</td>
          <td>${row["Detailed Description"] || ""}</td>
          <td>${row["Severity"] || ""}</td>
          <td>${row["*Planning Remarks"] || ""}</td>
          <td>${row["WR Status"] || ""}</td>
          <td>${imageCell}</td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("diagram-modal-title").textContent = "EQUIPMENT LIST";
  document.getElementById("diagram-modal").classList.remove("hidden");

  const pendingBtn = document.getElementById("diagram-pending-btn");
  const doneBtn = document.getElementById("diagram-done-btn");

  pendingBtn.onclick = () => {
    showSystemEquipmentList(systemTabId, "Pending");
  };
  doneBtn.onclick = () => {
    showSystemEquipmentList(systemTabId, "Done");
  };

  updateFilterButtonStates();
}


function updateFilterButtonStates() {
  const pendingBtn = document.getElementById("diagram-pending-btn");
  const doneBtn = document.getElementById("diagram-done-btn");

  if (pendingBtn) {
    pendingBtn.classList.toggle("active", diagramWRStatus.toLowerCase() === "pending");
  }
  if (doneBtn) {
    doneBtn.classList.toggle("active", diagramWRStatus.toLowerCase() === "done");
  }
}


function resetDiagramModal() {
  currentDiagramEquipment = "";
  diagramWRStatus = "";
  currentSystemFilter = "";
  updateFilterButtonStates();
}

function getLatestStatusAndBreakdown(dataRows, systemNames) {
  const equipmentSet = new Set(
    dataRows
      .filter((r) => systemNames.includes(r["System"]))
      .map((r) => normalize(r["Equipment"]))
  );

  const latestStatusMap = {};
  const breakdownMap = {};
  const daysDelayedMap = {};
  const hasUnresolvedSustainable = {};
  const hasUnresolvedBreakdown = {};

  const currentPositionMap = positionMaps[selectedSystemTab] || {};
  for (const key of Object.keys(currentPositionMap)) {
    const eq = normalize(key);
    latestStatusMap[eq] = "0"; // default to operational
    breakdownMap[eq] = 0;
    daysDelayedMap[eq] = 0;
    hasUnresolvedSustainable[eq] = false;
    hasUnresolvedBreakdown[eq] = false;
  }

  const seenLatestStatus = new Set();

  for (let i = dataRows.length - 1; i >= 0; i--) {
    const row = dataRows[i];
    const eq = normalize(row["Equipment"]);
    if (!equipmentSet.has(eq)) continue;

    const currentStatus = row["Current Status"];
    const wrStatus = (row["WR Status"] || "").trim().toLowerCase();
    const delayText = (row["Days Delayed"] || "").toLowerCase();
    const breakdownCount = row["Breakdown Count"];

    // ✅ Get latest Current Status
    if (["0", "1", "2"].includes(currentStatus)) {
      const current = parseInt(currentStatus);
      const prev = parseInt(latestStatusMap[eq] ?? "0");

      // Prioritize breakdown > sustainable > operational
      if (current > prev) {
        latestStatusMap[eq] = currentStatus;
      }

      seenLatestStatus.add(eq);
    }

    // ✅ Track breakdowns
    if (breakdownCount?.toString().trim() === "1") {
      breakdownMap[eq] = (breakdownMap[eq] || 0) + 1;
    }

    // ✅ Check if there's any pending sustainable status
    if (currentStatus === "1" && wrStatus !== "done") {
      hasUnresolvedSustainable[eq] = true;
    }

    // ✅ Check if there's any pending breakdown status
    if (currentStatus === "2" && wrStatus !== "done") {
      hasUnresolvedBreakdown[eq] = true;
    }

    // ✅ Update max delay
    if (!wrStatus.includes("done") && (delayText.includes("pending") || delayText.includes("delayed"))) {
      const match = delayText.match(/(\d+)/);
      const delay = match ? parseInt(match[1]) : 0;
      if (!isNaN(delay) && delay > (daysDelayedMap[eq] || 0)) {
        daysDelayedMap[eq] = delay;
      }
    }
  }

  // ✅ Override green to yellow if any unresolved sustainable WR exists
  for (const eq of Object.keys(latestStatusMap)) {
    if (latestStatusMap[eq] === "0" && hasUnresolvedSustainable[eq]) {
      latestStatusMap[eq] = "1";
    }
  }

  // ✅ Override to breakdown if any pending breakdown WR exists (even if not latest)
  for (const eq of Object.keys(latestStatusMap)) {
    if (hasUnresolvedBreakdown[eq]) {
      latestStatusMap[eq] = "2";
    }
  }

  return { latestStatusMap, breakdownMap, daysDelayedMap };
}


