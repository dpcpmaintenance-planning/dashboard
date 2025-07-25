
document.addEventListener("DOMContentLoaded", () => {
  const baseURL = "https://dpcpmaintenance-planning.github.io/dashboard/";

  // ===== LOAD NAVBAR =====
  fetch(baseURL + "navbar.html")
    .then((res) => {
      if (!res.ok) throw new Error(`Navbar fetch failed: HTTP ${res.status}`);
      return res.text();
    })
    .then((data) => {
      document.getElementById("main-header").innerHTML = data;

      // Fix relative links in navbar
      document.querySelectorAll("#navbar a").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("#")) {
          link.setAttribute("href", baseURL + href.replace(/^\.\/|^\//, ""));
        }
      });

      // Scroll effect
      const navbar = document.getElementById("navbar");
      window.addEventListener("scroll", () => {
        if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 50);
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

      // Dropdown toggle
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

      // Close dropdowns
      document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown").forEach((dropdown) => {
          dropdown.style.display = "none";
        });
      });
    })
    .catch((error) => {
      console.error("❌ Failed to load navbar:", error);
    });

  // ===== LOAD FOOTER =====
  fetch(baseURL + "footer.html")
    .then((res) => {
      if (!res.ok) throw new Error(`Footer fetch failed: HTTP ${res.status}`);
      return res.text();
    })
    .then((data) => {
      document.getElementById("main-footer").innerHTML = data;
    })
    .catch((error) => {
      console.error("❌ Failed to load footer:", error);
    });
});
