// === Cleaned & Improved system.js ===
let rows = [];
let imageColumnKey = "";
let selectedSystemTab = "equipments";
let currentDiagramEquipment = "";
let diagramWRStatus = "";



function showTab(event, tabId) {
  // Remove active class from all buttons
  document.querySelectorAll(".tab-button").forEach((btn) =>
    btn.classList.remove("active")
  );

  if (event && event.target) {
    // When triggered by click event
    event.target.classList.add("active");
  } else {
    // When called programmatically: find the button by tabId
    const btn = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (btn) btn.classList.add("active");
  }

  // Set selected tab and update content
  selectedSystemTab = tabId;
  updateDiagram(); // Your function to update the displayed tab content
}





