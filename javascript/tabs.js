document.addEventListener("DOMContentLoaded", () => {
    const tabs = [
        ["equipments", "Equipment List"],
        ["bottom-ash", "Bottom Ash System"],
        ["combustion", "Combustion System"],
        ["wts", "Water Treatment"],
        ["sws", "Steam and Water"],
        ["sccws", "Seawater & CCW"],
        ["cbhs", "Coal & Biomass Handling"],
        ["cas", "Compressed Air"],
        ["fps", "Fire Protection"],
        ["tls", "Turbine Lubrication"],
        ["cs", "Chlorination System"],
        ["electrical", "MV & LV Electrical System"],
        ["substation", "Substation"],
        ["heavy-equipment", "Heavy Equipment"],
        ["switchyard", "Switchyard"],
        ["le", "Lifting Equipment"],
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
