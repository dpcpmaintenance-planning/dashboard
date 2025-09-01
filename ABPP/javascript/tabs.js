document.addEventListener("DOMContentLoaded", () => {
    const tabs = [
        ["equipments", "Equipment List"],
        ["cs", "Cooling System"],
        ["es", "Exhaust System"],
        ["fos1", "Fuel Oil System 1"],
        ["fos2", "Fuel Oil System 2"],
        ["fos3", "Fuel Oil System 3"],
        ["los", "Lube Oil System"],
    ];

    const container = document.getElementById("tabs-container");
    container.innerHTML = tabs
        .map(([id, label], i) =>
            `<button class="tab-button${i === 0 ? " active" : ""}" data-tab="${id}">
        ${label}
      </button>`
        ).join("");

    container.addEventListener("click", (e) => {
        if (e.target.classList.contains("tab-button")) {
            document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            if (typeof showTab === "function") {
                showTab(e, e.target.dataset.tab);
            }
        }
    });
});
