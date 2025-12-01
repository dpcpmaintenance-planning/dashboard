document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const iframeContainer = document.querySelector(".iframe-container");
    const iframe = document.getElementById("tab-iframe");
    const loader = document.getElementById("iframe-loader");

    // Resize iframe to fit content
    function autoResizeIframe() {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeHeight = iframeDoc.body.scrollHeight;
            iframe.style.height = iframeHeight + 20 + "px"; // add padding
        } catch (error) {
            console.warn("Cross-origin iframe resizing failed.");
        }
    }

    // Click handler for each tab
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            tabButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            loader.style.display = "block";
            iframeContainer.classList.add("fade-in");

            iframe.src = btn.getAttribute("data-src");

            iframe.addEventListener(
                "load",
                () => {
                    loader.style.display = "none";
                    iframeContainer.classList.remove("fade-in");
                    autoResizeIframe();
                },
                { once: true }
            );
        });
    });

    // 🔁 Trigger click on the first tab to ensure iframe matches
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
});
