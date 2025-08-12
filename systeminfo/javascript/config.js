

// Selected system to show buttons for
// Modal elements
// Modal elements
const pdfModal = document.getElementById("pdfModal");
const pdfFrame = document.getElementById("pdfFrame");
const pdfCloseBtn = document.getElementById("pdfCloseBtn");

// Utility normalize function
function normalize(str) {
  return String(str).trim().toLowerCase().replace(/\s+/g, "");
}

// Render diagram + transparent buttons
function renderDiagram(systemKey) {
  const diagramContainer = document.getElementById("diagram-container");
  diagramContainer.innerHTML = ""; // clear old content

  const img = document.createElement("img");
  img.src = `images/${systemKey}.png`;
  img.alt = systemKey;
  img.style.width = "100%";
  img.style.position = "relative";
  diagramContainer.appendChild(img);

  (Object.entries(positionMaps[systemKey] || {})).forEach(([equipment, pos]) => {
    const btn = document.createElement("button");
    btn.style.position = "absolute";
    btn.style.left = `${pos.x}px`;
    btn.style.top = `${pos.y}px`;
    btn.style.width = "80px";
    btn.style.height = "20px";
    btn.style.background = "transparent";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.zIndex = 1; // keep under modal
    btn.title = equipment;

    btn.addEventListener("click", () => {
      openPDFModal(systemKey, equipment);
    });

    diagramContainer.appendChild(btn);
  });
}

// Open PDF modal
function openPDFModal(systemKey, equipment) {
  let fileId = equipmentPDFs[systemKey]?.[equipment];

  if (!fileId) {
    const normEquip = normalize(equipment);
    const eqps = equipmentPDFs[systemKey];
    if (eqps) {
      for (const [key, id] of Object.entries(eqps)) {
        if (normEquip.includes(normalize(key))) {
          fileId = id;
          break;
        }
      }
    }
  }

  if (!fileId) {
    alert("No PDF assigned to this equipment.");
    return;
  }

  const url = `https://drive.google.com/file/d/${fileId}/preview`;

  // Reset frame before showing
  pdfFrame.src = "";
  pdfModal.style.display = "none";

  setTimeout(() => {
    pdfFrame.src = url;
    pdfModal.style.display = "block";

    // Lock background scroll
    document.body.classList.add("modal-open");
  }, 50);
}

function closePDFModal() {
  pdfModal.style.display = "none";
  pdfFrame.src = "";

  // Unlock background scroll
  document.body.classList.remove("modal-open");
}



// Event listeners (always active)
pdfCloseBtn.addEventListener("click", closePDFModal);
pdfModal.addEventListener("click", (e) => {
  if (e.target === pdfModal) {
    closePDFModal();
  }
});

// Initial load
renderDiagram("bottom-ash");