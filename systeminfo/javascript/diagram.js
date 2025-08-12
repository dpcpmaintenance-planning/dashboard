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

  diagram.innerHTML = `<div onclick="currentDiagramEquipment=''; diagramWRStatus=''; showSystemEquipmentList('${selectedSystemTab}')"></div>`;

  const systemNames = systemGroups[selectedSystemTab] || [];
  const currentPositionMap = positionMaps[selectedSystemTab] || {};

  // Group items by x/y to avoid duplicates if needed
  const positionGroups = {};

  for (const [key, value] of Object.entries(currentPositionMap)) {
    if (Array.isArray(value)) {
      value.forEach(({ name, x, y }) => {
        const keyPos = `${x},${y}`;
        if (!positionGroups[keyPos]) positionGroups[keyPos] = [];
        positionGroups[keyPos].push({ name, x, y });
      });
    } else {
      const keyPos = `${value.x},${value.y}`;
      if (!positionGroups[keyPos]) positionGroups[keyPos] = [];
      positionGroups[keyPos].push({ name: key, x: value.x, y: value.y });
    }
  }

  // For each position group, just draw a button for the first equipment (no status sorting)
  for (const group of Object.values(positionGroups)) {
    const { name, x, y } = group[0];
    drawStatusIndicator(name, x, y);
  }

  // Remove legend since no status colors anymore
}

function drawStatusIndicator(label, x, y) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.style.position = "absolute";
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
  btn.style.padding = "4px 8px";
  btn.style.cursor = "pointer";

  btn.addEventListener("click", () => {
    const googleDrivePDFs = {
      "Close Cooling Pump": "1Q-UL9fYMiOerhu9HwvK50jI_a6uWXX16",
      "Bucket Elevator": "",
      // Add your mappings here
    };

    const fileId = googleDrivePDFs[label];
    if (!fileId) {
      alert("No PDF assigned for this equipment.");
      return;
    }

    const pdfFrame = document.getElementById("pdf-frame");
    const pdfModal = document.getElementById("pdf-modal");

    // Reset iframe before loading new PDF
    pdfFrame.src = "";
    setTimeout(() => {
      pdfFrame.src = `https://drive.google.com/file/d/${fileId}/preview`;
      pdfModal.classList.remove("hidden");
    }, 50); // Small delay ensures reload
  });

  document.getElementById("diagram").appendChild(btn);
}







