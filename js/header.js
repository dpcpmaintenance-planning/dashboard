
window.addEventListener("DOMContentLoaded", () => {
  // Auto-detect GitHub repo name if hosted on GitHub Pages
  const repoName = location.hostname === "dpcpmaintenance-planning.github.io"
    ? location.pathname.split("/")[1]
    : "";

  // Normalize path
  const path = location.pathname.replace(/\/$/, "");
  const endsWithFile = /\.\w+$/.test(path);
  const cleanPath = endsWithFile ? path.substring(0, path.lastIndexOf("/")) : path;

  // Compute depth based on path
  const parts = cleanPath.split("/").filter(p => p !== "" && p !== repoName);
  const depth = parts.length;

  const basePath = depth === 0 ? "./" : "../".repeat(depth);

  console.log("🌐 Repo:", repoName);
  console.log("📂 Path:", location.pathname);
  console.log("🧹 Clean Path:", cleanPath);
  console.log("🔁 Base Path:", basePath);

  // ========== LOAD NAVBAR ==========
  fetch(basePath + "navbar.html")
    .then(res => {
      if (!res.ok) throw new Error(`Navbar fetch failed: HTTP ${res.status}`);
      return res.text();
    })
    .then(data => {
      const header = document.getElementById("main-header");
      if (header) header.innerHTML = data;

      // Fix relative links
      document.querySelectorAll("#navbar a").forEach(link => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("#")) {
          link.setAttribute("href", basePath + href);
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

      // Dropdown logic scoped to NAVBAR only
      const navbarElement = document.getElementById("navbar");
      if (navbarElement) {
        const dropdownWrappers = navbarElement.querySelectorAll(".dropdown-wrapper");

        dropdownWrappers.forEach((wrapper) => {
          const dropdown = wrapper.querySelector(".dropdown");
          wrapper.addEventListener("click", (e) => {
            e.stopPropagation();

            dropdownWrappers.forEach((otherWrapper) => {
              if (otherWrapper !== wrapper) {
                const otherDropdown = otherWrapper.querySelector(".dropdown");
                if (otherDropdown) otherDropdown.style.display = "none";
              }
            });

            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
          });
        });

        document.addEventListener("click", () => {
          dropdownWrappers.forEach((wrapper) => {
            const dropdown = wrapper.querySelector(".dropdown");
            if (dropdown) dropdown.style.display = "none";
          });
        });
      }
    })
    .catch((error) => {
      console.error("❌ Failed to load navbar:", error);
    });

  // ========== LOAD FOOTER ==========
  fetch(basePath + "footer.html")
    .then(res => {
      if (!res.ok) throw new Error(`Footer fetch failed: HTTP ${res.status}`);
      return res.text();
    })
    .then(data => {
      const footer = document.getElementById("main-footer");
      if (footer) footer.innerHTML = data;
    })
    .catch((error) => {
      console.error("❌ Failed to load footer:", error);
    });
});

