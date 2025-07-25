window.addEventListener("DOMContentLoaded", () => {
    // ✅ Set your GitHub repo name (must match URL repo folder)
    const repoName = "dashboard";

    // Determine current path and relative depth
    const path = location.pathname.replace(/\/$/, "");
    const parts = path.split("/").filter((p) => p !== "" && p !== repoName);
    const depth = parts.length;
    const basePath = "../".repeat(depth);

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

            // Adjust internal links inside the navbar
            document.querySelectorAll("#navbar a").forEach((link) => {
                const href = link.getAttribute("href");
                if (href && !href.startsWith("http") && !href.startsWith("#")) {
                    link.setAttribute("href", basePath + href);
                }
            });

            // Navbar scroll effect
            const navbar = document.getElementById("navbar");
            window.addEventListener("scroll", () => {
                if (navbar) {
                    navbar.classList.toggle("scrolled", window.scrollY > 50);
                }
            });

            // Hamburger menu toggle
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

            // Dropdown behavior
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