const select = document.getElementById("pdf-select");
const iframe = document.getElementById("pdf-frame");

select.addEventListener("change", () => {
    const url = select.value;
    iframe.src = url || "";
});

