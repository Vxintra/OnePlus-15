const sceneCount = 5;
let currentScene = 1;
let currentRotation = -24;
let isDragging = false;
let startX = 0;
let startRotation = currentRotation;
let hasDragged = false;
let toastTimer;

const phone = document.querySelector("#phone");
const previousButton = document.querySelector("#previous-button");
const nextButton = document.querySelector("#next-button");
const exploreButton = document.querySelector("#explore-button");
const currentPage = document.querySelector("#current-page");
const toast = document.querySelector("#toast");

const cameraButton = document.querySelector("#camera-button");
const settleButton = document.querySelector("#settle-button");
const cameraModal = document.querySelector("#camera-modal");
const modalClose = document.querySelector("#modal-close");
const captureButton = document.querySelector("#capture-button");
const soundButton = document.querySelector("#sound-button");

let soundEnabled = false;

function getSceneInput(scene) {
    return document.querySelector(`#scene-${scene}`);
}

function updatePhoneTransform() {
    phone.style.transform = `
        rotateY(${currentRotation}deg)
        rotateX(6deg)
        rotateZ(-5deg)
    `;
}

function updateNavigation() {
    currentPage.textContent = String(currentScene).padStart(2, "0");

    previousButton.disabled = currentScene === 1;
    nextButton.disabled = currentScene === sceneCount;

    document.querySelectorAll(".content-panel").forEach((panel) => {
        panel.setAttribute(
            "aria-hidden",
            panel.dataset.scene === String(currentScene) ? "false" : "true"
        );
    });
}

function goToScene(scene) {
    const safeScene = Math.max(1, Math.min(sceneCount, scene));

    currentScene = safeScene;
    getSceneInput(safeScene).checked = true;
    updateNavigation();

    if (soundEnabled) {
        playInterfaceSound();
    }
}

function showToast(message) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function openCameraMode() {
    cameraModal.classList.add("open");
    cameraModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();
    showToast("Camera mode activated");
}

function closeCameraMode() {
    cameraModal.classList.remove("open");
    cameraModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    cameraButton?.focus();
}

function activateNeverSettle() {
    document.body.classList.add("settle-active");
    phone.classList.add("settle-active");

    showToast("Going Beyond The Ordinary.");

    setTimeout(() => {
        document.body.classList.remove("settle-active");
        phone.classList.remove("settle-active");
    }, 1500);
}

function playInterfaceSound() {
    // Lightweight click feedback without requiring an audio file.
    if (!soundEnabled) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.frequency.value = 440;
    oscillator.type = "sine";

    gain.gain.setValueAtTime(0.04, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.08);
}

function spinPhone() {
    currentRotation += 180;
    updatePhoneTransform();

    if (soundEnabled) {
        playInterfaceSound();
    }
}

previousButton.addEventListener("click", () => {
    goToScene(currentScene - 1);
});

nextButton.addEventListener("click", () => {
    goToScene(currentScene + 1);
});

document.querySelectorAll(".page-buttons label").forEach((label) => {
    label.addEventListener("click", () => {
        const targetScene = Number(label.htmlFor.replace("scene-", ""));
        goToScene(targetScene);
    });
});

exploreButton.addEventListener("click", () => {
    document.querySelector(".content-area").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    showToast("Explore the OnePlus 15");
});

cameraButton?.addEventListener("click", openCameraMode);
settleButton?.addEventListener("click", activateNeverSettle);

modalClose.addEventListener("click", closeCameraMode);

captureButton.addEventListener("click", () => {
    captureButton.textContent = "Frame captured ✓";
    showToast("Concept frame captured");

    setTimeout(() => {
        captureButton.textContent = "Captured";
    }, 1800);
});

cameraModal.addEventListener("click", (event) => {
    if (event.target === cameraModal) {
        closeCameraMode();
    }
});

soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundButton.classList.toggle("active", soundEnabled);
    soundButton.textContent = soundEnabled ? "●" : "◌";
    soundButton.setAttribute(
        "aria-label",
        soundEnabled ? "Disable interface sound" : "Enable interface sound"
    );

    showToast(soundEnabled ? "Interface sound enabled" : "Interface sound disabled");
});

phone.addEventListener("pointerdown", (event) => {
    isDragging = true;
    hasDragged = false;
    startX = event.clientX;
    startRotation = currentRotation;

    phone.setPointerCapture(event.pointerId);
});

phone.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const distance = event.clientX - startX;

    if (Math.abs(distance) > 5) {
        hasDragged = true;
    }

    currentRotation = startRotation + distance * 0.65;
    updatePhoneTransform();
});

phone.addEventListener("pointerup", (event) => {
    if (!isDragging) return;

    isDragging = false;
    phone.releasePointerCapture(event.pointerId);

    if (!hasDragged) {
        spinPhone();
    }
});

phone.addEventListener("pointercancel", () => {
    isDragging = false;
});

phone.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        event.preventDefault();
        currentRotation -= 25;
        updatePhoneTransform();
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        currentRotation += 25;
        updatePhoneTransform();
    }

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        spinPhone();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cameraModal.classList.contains("open")) {
        closeCameraMode();
        return;
    }

    if (event.key === "ArrowLeft" && !cameraModal.classList.contains("open")) {
        goToScene(currentScene - 1);
    }

    if (event.key === "ArrowRight" && !cameraModal.classList.contains("open")) {
        goToScene(currentScene + 1);
    }
});

document.querySelectorAll('input[name="scene"]').forEach((input) => {
    input.addEventListener("change", () => {
        currentScene = Number(input.value);
        updateNavigation();
    });
});

updatePhoneTransform();
updateNavigation();