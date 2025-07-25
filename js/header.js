window.addEventListener("DOMContentLoaded", () => {
  const basePath = "/dashboard/"; // Adjust this if your repo name is different

  // ========== LOAD NAVBAR ==========
  fetch(basePath + "navbar.html")
    .then((res) => {
      if (!res.ok) throw new Error(`Navbar fetch failed: HTTP ${res.status}`);
      return res.text();
    })
    .then((data) => {
      const header = document.getElementById("main-header");
      if (header) header.innerHTML = data;

      // Scroll effect
      const navbar = document.getElementById("navbar");
      window.addEventListener("scroll", () => {
        if (navbar) {
          navbar.classList.toggle("scrolled", window.scrollY > 50);
        }
      });

      // Hamburger toggle
      const hamburger = document.getElementById("hamburger");
      const navRight = document.querySelector(".nav-right");
      if (hamburger && navRight) {
        hamburger.addEventListener("click", (e) => {
          e.stopPropagation();
          navRight.classList.toggle("active");
          hamburger.classList.toggle("open");
        });
        document.addEventListener("click", (e) => {
          if (!navRight.contains(e.target) && !hamburger.contains(e.target)) {
            navRight.classList.remove("active");
            hamburger.classList.remove("open");
          }
        });
      }

      // Dropdowns
      const dropdownWrappers = document.querySelectorAll(".dropdown-wrapper");
      dropdownWrappers.forEach((wrapper) => {
        const dropdown = wrapper.querySelector(".dropdown");
        wrapper.addEventListener("click", (e) => {
          e.stopPropagation();
          document.querySelectorAll(".dropdown").forEach((d) => {
            if (d !== dropdown) d.style.display = "none";
          });
          dropdown.style.display =
            dropdown.style.display === "block" ? "none" : "block";
        });
      });

      document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown").forEach((d) => {
          d.style.display = "none";
        });
      });
    })
    .catch((error) => {
      console.error("❌ Failed to load navbar:", error);
    });

  // ========== LOAD FOOTER ==========
  fetch(basePath + "footer.html")
    .then((res) => {
      if (!res.ok) throw new Error(`Footer fetch failed: HTTP ${res.status}`);
      return res.text();
    })
    .then((data) => {
      const footer = document.getElementById("main-footer");
      if (footer) footer.innerHTML = data;
    })
    .catch((error) => {
      console.error("❌ Failed to load footer:", error);
    });
});
