// ============================
// MAIN DROPDOWN TOGGLE (CLICK)
// ============================
const dropdownWrappers = document.querySelectorAll(".dropdown-wrapper");

dropdownWrappers.forEach((wrapper) => {
  const dropdown = wrapper.querySelector(".dropdown");
  const toggle = wrapper.querySelector(".dropdown-toggle");

  if (toggle) {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // stop bubbling to document

      // Close other main dropdowns
      document.querySelectorAll(".dropdown-wrapper .dropdown").forEach((d) => {
        if (d !== dropdown) d.style.display = "none";
      });

      // Toggle current main dropdown
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });
  }
});

// ============================
// CLICK OUTSIDE → CLOSE MAIN DROPDOWNS
// ============================
document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-wrapper .dropdown").forEach((dropdown) => {
    dropdown.style.display = "none";
  });
});

// ============================
// SUBMENU (DPTPP PMS) OPENS ON HOVER
// ============================
// No JS needed! CSS handles submenu hover.
