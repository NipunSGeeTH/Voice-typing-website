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

// Modified settings for mobile devices
if (isMobile) {
    recognition.continuous = false; // Change to false for mobile
    recognition.interimResults = false; // Change to false for mobile
    // Add a longer speechEndTimeout
   recognition.speechEndTimeout = 100; 
} else {
    recognition.continuous = true;
    recognition.interimResults = true;
}

let finalTranscript = "";
let selectedLang = "en-US";
let isListening = false;

// Language selection
langButtons.forEach((button) => {
    button.addEventListener("click", () => {
        recognition.stop();
        isListening = false;
        langButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        selectedLang = button.getAttribute("data-lang");
        recognition.lang = selectedLang;
        
        updateStatus(`Language set to ${button.innerText}`, "ready");
        statusIndicator.style.background="#06ff49";
    });
});

// Modified start button handler for mobile
startBtn.addEventListener("click", () => {
    try {
        if (!isListening) {
            recognition.start();
            isListening = true;
            updateStatus("Listening... Speak now", "listening");
            startBtn.style.display = "none";
            stopBtn.style.display = "block";
            statusIndicator.style.background = "red";
        }
    } catch (error) {
        console.error("Error starting recognition:", error);
        updateStatus("Error starting recognition. Please try again.", "error");
    }
});

// Modified stop button handler
stopBtn.addEventListener("click", () => {
    recognition.stop();
    isListening = false;
    startBtn.style.display = "block";
    stopBtn.style.display = "none";
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

// Modified recognition results handler
recognition.onresult = (event) => {
    if (isMobile) {
        // For mobile: append only final results
        const transcript = event.results[0][0].transcript;
        finalTranscript += transcript + " ";
        output.value = finalTranscript;
    } else {
        // For desktop: handle both interim and final results
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + " ";
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        output.value = finalTranscript + interimTranscript;
    }
};

// Modified end event handler for mobile
recognition.onend = () => {
    statusIndicator.classList.remove("listening");
    if (isMobile && isListening) {
        // Automatically restart recognition on mobile if still in listening mode
        setTimeout(() => {
            try {
                recognition.start();
            } catch (error) {
                console.error("Error restarting recognition:", error);
                isListening = false;
                startBtn.style.display = "block";
                stopBtn.style.display = "none";
                updateStatus("Recognition ended. Please start again.", "ready");
            }
        }, 250);
    }
};

recognition.onerror = (event) => {
    console.error("Recognition error:", event.error);
    updateStatus(`Error: ${event.error}`, "error");
    isListening = false;
    startBtn.style.display = "block";
    stopBtn.style.display = "none";
};

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
