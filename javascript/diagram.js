function updateDiagramModalTable() {
  const tbody = document.getElementById("diagram-table-body");

  const filtered = rows
    .filter((r) =>
      currentDiagramEquipment
        ? normalize(r["Equipment"]) === normalize(currentDiagramEquipment)
        : true
    )
    .filter((r) =>
      diagramWRStatus
        ? r["WR Status"]?.toLowerCase() === diagramWRStatus.toLowerCase()
        : true
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

  // Rebind buttons each time
  const pendingBtn = document.getElementById("diagram-pending-btn");
  const doneBtn = document.getElementById("diagram-done-btn");

  pendingBtn.onclick = () => {
    if (currentDiagramEquipment) {
      diagramWRStatus = "Pending";
      updateDiagramModalTable();
    } else {
      showSystemEquipmentList(selectedSystemTab, "Pending");
    }
  };

  doneBtn.onclick = () => {
    if (currentDiagramEquipment) {
      diagramWRStatus = "Done";
      updateDiagramModalTable();
    } else {
      showSystemEquipmentList(selectedSystemTab, "Done");
    }
  };

  updateFilterButtonStates();
}



function updateDiagram() {
  const diagram = document.getElementById("diagram");
  const container = document.querySelector(".diagram-container");

  diagramWRStatus = "";
  currentSystemFilter = "";

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

  diagram.innerHTML = `
  <a href="systeminfo/systeminfo.html" class="equipment-list-button">
    EQUIPMENT INFORMATION
  </a>
`;

  const systemNames = systemGroups[selectedSystemTab] || [];
  const { latestStatusMap, breakdownMap, daysDelayedMap } = getLatestStatusAndBreakdown(rows, systemNames);
  const currentPositionMap = positionMaps[selectedSystemTab] || {};
  const statusEmoji = { 0: "🟢", 1: "🟡", 2: "🔴" };

  // Group items by x/y to determine which status should be shown
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

  // Draw only highest-priority per position
  for (const group of Object.values(positionGroups)) {
    // Sort: Breakdown (2) > Sustainable (1) > Operational (0)
    const sorted = group.sort((a, b) => b.status - a.status);
    const { name, x, y } = sorted[0]; // show highest priority status
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

  const statusLabels = {
    "0": "Operational",
    "1": "Sustainable",
    "2": "Breakdown"
  };
  const readableStatus = statusLabels[status] || "Unknown";

  const div = document.createElement("div");
  div.className =
    "status-indicator " +
    (status === "2" ? "breakdown" :
      status === "1" ? "sustainable" : "operational");

  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
  div.style.zIndex = status === "2" ? 3 : status === "1" ? 2 : 1;

  div.title = `
📌 ${label}
📊 Status: ${readableStatus}
💥 Breakdowns: ${breakdown}
⏱️ Days in Queue: ${daysDelayed}
  `.trim();

  // Emoji circle icon
  const emoji = encodeURIComponent(statusEmoji[status]);
  div.style.backgroundImage = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='28'>${emoji}</text></svg>")`;

  // Show breakdown count as badge
  if (breakdown !== undefined && breakdown !== null) {
    div.innerHTML = `<div class="count">${breakdown}</div>`;
  } else {
    div.innerHTML = `<div class="count">0</div>`;
  }


  div.addEventListener("click", () => {
    currentDiagramEquipment = label;
    diagramWRStatus = "";
    updateDiagramModalTable();
    document.getElementById("diagram-modal-title").textContent = label;
    document.getElementById("diagram-modal").classList.remove("hidden");
    updateFilterButtonStates();
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

  const isDiagramMode = !!currentDiagramEquipment;

  pendingBtn.classList.toggle(
    "active",
    isDiagramMode
      ? diagramWRStatus.toLowerCase() === "pending"
      : currentSystemFilter === "pending"
  );

  doneBtn.classList.toggle(
    "active",
    isDiagramMode
      ? diagramWRStatus.toLowerCase() === "done"
      : currentSystemFilter === "done"
  );
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


