document.addEventListener("DOMContentLoaded", () => {
    const backToTop = document.querySelector(".back-to-top");

    if (!backToTop) return;

    // Scroll to top smoothly on click
    backToTop.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // Show or hide the button
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTop.classList.add("visible");
        } else {
            backToTop.classList.remove("visible");
        }
    });
});
