
const narra = document.getElementById("narra-img");
const aborlan = document.getElementById("aborlan-img");
const btnNarra = document.getElementById("btn-narra");
const btnAborlan = document.getElementById("btn-aborlan");

function showImage(type) {
    if (type === "narra") {
        narra.classList.remove("hidden");
        aborlan.classList.add("hidden");
        btnNarra.classList.add("hidden");
        btnAborlan.classList.remove("hidden");
    } else if (type === "aborlan") {
        aborlan.classList.remove("hidden");
        narra.classList.add("hidden");
        btnAborlan.classList.add("hidden");
        btnNarra.classList.remove("hidden");
    }
}

// === Pan-on-hover for both images ===
const panImages = document.querySelectorAll(".pan-image");

panImages.forEach((img) => {
    const wrapper = img.parentElement;

    wrapper.addEventListener("mousemove", (e) => {
        if (img.classList.contains("hidden")) return;

        const rect = wrapper.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        img.style.transform = `scale(1.3) translate(-${x - 50}%, -${y - 50}%)`;
    });

    wrapper.addEventListener("mouseleave", () => {
        img.style.transform = "scale(1) translate(0, 0)";
    });
});

