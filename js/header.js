window.addEventListener("DOMContentLoaded", () => {
  const repoName = "dashboard";

  // Remove trailing slash
  const path = location.pathname.replace(/\/$/, "");

  // Detect if path ends with a file (e.g. index.html)
  const endsWithFile = /\.\w+$/.test(path);

  // Remove the file if it exists to compute directory depth
  const cleanPath = endsWithFile ? path.substring(0, path.lastIndexOf("/")) : path;

  // Get depth (excluding repo name)
  const parts = cleanPath.split("/").filter((p) => p !== "" && p !== repoName);
  const depth = parts.length;

  // Compute base path
  const basePath = depth === 0 ? "./" : "../".repeat(depth);

  console.log("📂 Current path:", location.pathname);
  console.log("🧠 Clean path:", cleanPath);
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

      // Fix relative links in navbar
      document.querySelectorAll("#navbar a").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("#")) {
          link.setAttribute("href", basePath + href);
        }
      });

      // Scroll and menu logic...
      const navbar = document.getElementById("navbar");
      window.addEventListener("scroll", () => {
        if (navbar) {
          navbar.classList.toggle("scrolled", window.scrollY > 50);
        }
      });

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
