function startFlipClock() {
    function updateClock() {
        const now = new Date();
        const timeParts = {
            hours: now.getHours().toString().padStart(2, "0"),
            minutes: now.getMinutes().toString().padStart(2, "0"),
            seconds: now.getSeconds().toString().padStart(2, "0"),
        };

        ["hours", "minutes", "seconds"].forEach(part => {
            const el = document.querySelector(`#militaryClock .${part}`);
            if (el.textContent !== timeParts[part]) {
                el.classList.remove("flip");
                void el.offsetWidth; // trigger reflow
                el.classList.add("flip");

                // Change number at half animation (0.2s)
                setTimeout(() => {
                    el.textContent = timeParts[part];
                }, 200);
            }
        });

        // Sync to next exact second
        const delay = 1000 - now.getMilliseconds();
        setTimeout(updateClock, delay);
    }

    updateClock();
}

startFlipClock();
