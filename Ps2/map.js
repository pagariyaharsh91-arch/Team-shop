// map.js - Location redirect functionality
// Frontend-only: Opens Google Maps location link when map button is clicked

document.addEventListener("DOMContentLoaded", () => {
    const mapBtn = document.getElementById("mapBtn");
    if (!mapBtn) return;

    mapBtn.addEventListener("click", () => {
        window.open("https://share.google/3F6fcjAN8FlrfQq56", "_blank");
    });
});
