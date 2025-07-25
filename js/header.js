document.addEventListener("DOMContentLoaded", () => {
  // ✅ Replace with your actual repo name
  const repoName = "dasboard";

  // Strip trailing slash and split
  const path = location.pathname.replace(/\/$/, "");
  const parts = path.split("/").filter((p) => p !== "" && p !== repoName);
  const depth = parts.length;
  const basePath = "../".repeat(depth);

  // Load Navbar
  fetch(basePath + "navbar.html")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((data) => {
      document.getElementById("main-header").innerHTML = data;

      // Fix relative links in navbar
      document.querySelectorAll("#navbar a").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("#")) {
          link.setAttribute("href", basePath + href);
        }
      });

      // Navbar toggle and scroll behavior
      const navbar = document.getElementById("navbar");
      const hamburger = document.getElementById("hamburger");
      const navRight = document.querySelector(".nav-right");

      window.addEventListener("scroll", () => {
        if (navbar) {
          navbar.classList.toggle("scrolled", window.scrollY > 50);
        }
      });

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

  // Load Footer
  fetch(basePath + "footer.html")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((data) => {
      document.getElementById("main-footer").innerHTML = data;
    })
    .catch((error) => {
      console.error("❌ Failed to load footer:", error);
    });

  // 🛠️ Debug info (optional, can remove later)
  console.log("📂 Current path:", location.pathname);
  console.log("🔁 Calculated basePath:", basePath);
});
