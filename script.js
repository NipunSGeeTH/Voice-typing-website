const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const clearBtn = document.getElementById("clear-btn");
const copyBtn = document.getElementById("copy-btn");
const langButtons = document.querySelectorAll(".lang-btn");
const output = document.getElementById("output");
const status = document.getElementById("status");
const statusIndicator = document.querySelector(".status-indicator");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Check if the user is on a mobile device
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
// For mobile devices, disable continuous and interim results to avoid repetition
if (isMobile) {
    recognition.continuous = true;
    recognition.interimResults = true;
} else {
    recognition.continuous = true;
    recognition.interimResults = true;
}
let finalTranscript = "";
let selectedLang = "en-US";

// Language selection
langButtons.forEach((button) => {
    button.addEventListener("click", () => {
        recognition.stop();
        langButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        selectedLang = button.getAttribute("data-lang");
        recognition.lang = selectedLang;
        
        updateStatus(`Language set to ${button.innerText}`, "ready");
        statusIndicator.style.background="#06ff49";
    });
});

startBtn.addEventListener("click", () => {
    try {
        recognition.start();
        updateStatus("Listening... Speak now", "listening");
        startBtn.style.display = "none"; // Hide button
        stopBtn.style.display="block";
        statusIndicator.style.background="red";
    } catch (error) {
        console.error("Error starting recognition:", error);
        updateStatus("Error starting recognition. Please try again.", "error");
    }
});

// Stop listening
stopBtn.addEventListener("click", () => {
    recognition.stop();
    startBtn.style.display = "block";
    stopBtn.style.display="none";
    updateStatus("Stopped listening", "ready");
});

// Clear text
clearBtn.addEventListener("click", () => {
    finalTranscript = "";
    output.value = "";
    updateStatus("Text cleared", "ready");
});

// Copy text
copyBtn.addEventListener("click", () => {
    if (output.value) {
        navigator.clipboard.writeText(output.value)
            .then(() => {
                updateStatus("Text copied to clipboard!", "success");
                setTimeout(() => updateStatus("Click Start to begin speaking...", "ready"), 2000);
            })
            .catch(() => {
                updateStatus("Failed to copy text", "error");
            });
    }
});

// Recognition results
recognition.onresult = (event) => {
    let interimTranscript = "";
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
        } else {
            interimTranscript += event.results[i][0].transcript;
        }
    }
    
    output.value = finalTranscript + interimTranscript;
};

// Error handling
recognition.onerror = (event) => {
    console.error("Recognition error:", event.error);
    updateStatus(`Error: ${event.error}`, "error");
};

recognition.onend = () => {
    statusIndicator.classList.remove("listening");
};

// Helper function to update status with visual feedback
function updateStatus(message, type) {
    status.innerText = message;
    statusIndicator.classList.remove("listening");
    
    switch (type) {
        case "listening":
            statusIndicator.classList.add("listening");
            break;
        case "error":
            statusIndicator.style.background = "var(--error-color)";
            setTimeout(() => {
                statusIndicator.style.background = "#cbd5e1";
            }, 2000);
            break;
        case "success":
            statusIndicator.style.background = "var(--success-color)";
            setTimeout(() => {
                statusIndicator.style.background = "#cbd5e1";
            }, 2000);
            break;
        default:
            statusIndicator.style.background = "#cbd5e1";
    }
}
