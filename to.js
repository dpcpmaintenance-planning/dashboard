function showImage(type) {
    const narra = document.getElementById("narra-img");
    const aborlan = document.getElementById("aborlan-img");
    const btnNarra = document.getElementById("btn-narra");
    const btnAborlan = document.getElementById("btn-aborlan");

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