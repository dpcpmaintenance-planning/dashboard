document.querySelector(".scroll-arrow").addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector("#next-section");

    if (target) {
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
});
