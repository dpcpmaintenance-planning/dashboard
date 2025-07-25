window.addEventListener("DOMContentLoaded", () => {
  // ✅ Adjust this if repo name changes
  const repoName = "dashboard";

  // Remove trailing slash and split path
  const path = location.pathname.replace(/\/$/, "");
  const parts = path.split("/").filter((p) => p !== "" && p !== repoName);
  const depth = parts.length;

  // Compute relative path (../) based on depth
  const basePath = depth === 0 ? "./" : "../".repeat(depth);

  console.log("📂 Current path:", location.pathname);
  console.log("🔁 basePath:", basePath);

  // ========== LOAD NAVBAR ==========
  fetch(basePath + "navbar.html")
    .then((res) => {
      if (!res.ok) throw new Error(`Navbar fetch failed: HTTP ${res.status}`);
      return res.text();
    })
    .then((data) => {
      const header = document.getElementById("main-header");
      if (header) header.innerHTML = data;

      // 🔗 Adjust internal navbar links to work relatively
      document.querySelectorAll("#navbar a").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("#")) {
          link.setAttribute("href", basePath + href);
        }
      });

      // 🔽 SCROLL NAVBAR EFFECT
      const navbar = document.getElementById("navbar");
      window.addEventListener("scroll", () => {
        if (navbar) {
          navbar.classList.toggle("scrolled", window.scrollY > 50);
        }
      });

      // 🍔 HAMBURGER MENU TOGGLE
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

      // ⬇️ DROPDOWN LOGIC
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

      // Hide dropdowns on body click
      document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown").forEach((dropdown) => {
          dropdown.style.display = "none";
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
