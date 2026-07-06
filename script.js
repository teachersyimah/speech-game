// Game Sentences Data Database Array
const sentences = [
    "The park is big and green.",
    "The library is quiet and clean.",
    "The market is busy and noisy.",
    "The shopping mall is huge and bright.",
    "The museum is old and interesting.",
    "The hospital is big and modern.",
    "The cinema is dark and comfortable.",
    "The playground is fun and colourful.",
    "The train station is busy and loud.",
    "The city park is peaceful and beautiful."
];

let currentLevel = 1;
let score = 0;
let totalLevels = sentences.length;

// Performance metrics time variables
let speechStartTime = 0;
let audioContext;

// UI Elements Catch
const car = document.getElementById("car");
const obstacle = document.getElementById("obstacle");
const sentenceDisplay = document.getElementById("sentence-display");
const feedbackMsg = document.getElementById("feedback-msg");
const progressBar = document.getElementById("progress-bar");
const levelIndicator = document.getElementById("level-indicator");
const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreDisplay = document.getElementById("final-score");

const micBtn = document.getElementById("mic-btn");
const retryBtn = document.getElementById("retry-btn");
const nextBtn = document.getElementById("next-btn");

// Initialization of Speech Recognition API Architecture
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
} else {
    alert("Web Speech API is not fully supported in this browser version. Please check permission setups.");
}

// Custom Sound Effects Synthesizer using Web Audio API Engine
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    initAudio();
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'success') {
        // Happy retro chime sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
    } else if (type === 'crash') {
        // Exploding retro noise sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(40, audioContext.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
        osc.start();
        osc.stop(audioContext.currentTime + 0.4);
    }
}

// Standard Game Loop Initialization
function loadLevel() {
    // Reset spatial assets classes positions
    car.className = "car-driving";
    obstacle.className = "obstacle-stopped";
    
    // Set text elements updates
    levelIndicator.innerText = `Level: ${currentLevel} / ${totalLevels}`;
    sentenceDisplay.innerText = sentences[currentLevel - 1];
    feedbackMsg.innerText = "Press the mic button and read aloud.";
    feedbackMsg.style.color = "#bdc3c7";
    
    // UI Progress Bar compute updates
    const percentage = ((currentLevel - 1) / totalLevels) * 100;
    progressBar.style.width = `${percentage === 0 ? 10 : percentage}%`;

    // Reset control buttons configuration parameters
    micBtn.classList.remove("hidden", "listening");
    micBtn.innerText = "🎤 Tap to Speak";
    retryBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
}

// String Similarity Logic (Levenshtein Distance Formulation matching 80% tolerance window rules)
function getSimilarityScore(str1, str2) {
    const s1 = str1.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
    const s2 = str2.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
    
    const words1 = s1.split(" ");
    const words2 = s2.split(" ");
    
    let matches = 0;
    words1.forEach(word => {
        if (words2.includes(word)) matches++;
    });
    
    return (matches / Math.max(words1.length, words2.length));
}

// Microphones Constraints activation pipeline execution 
async function startListeningEngine() {
    try {
        // Apply explicit hardware channel constraint filters
        await navigator.mediaDevices.getUserMedia({
            audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true }
        });
        
        initAudio();
        speechStartTime = Date.now();
        recognition.start();
    } catch (err) {
        feedbackMsg.innerText = "Microphone connection blocked. Check Chrome setting permissions.";
        feedbackMsg.style.color = "#e74c3c";
    }
}

// Recognition Event Listeners Processing
if (recognition) {
    recognition.onstart = () => {
        micBtn.classList.add("listening");
        micBtn.innerText = "🛑 Listening...";
    };

    recognition.onerror = () => {
        feedbackMsg.innerText = "Speech matching error. Let's try again.";
        micBtn.classList.remove("listening");
        micBtn.innerText = "🎤 Tap to Speak";
    };

    recognition.onend = () => {
        micBtn.classList.remove("listening");
        micBtn.innerText = "🎤 Tap to Speak";
    };

    recognition.onresult = (event) => {
        const speechDurationSec = (Date.now() - speechStartTime) / 1000;
        const spokenText = event.results[0][0].transcript;
        const targetText = sentences[currentLevel - 1];

        // Noise gate filtering handling parameters rules check
        if (speechDurationSec < 1.0) {
            // Ignore brief background noises completely
            feedbackMsg.innerText = "Background noise filtered.";
            return;
        }
        
        if (speechDurationSec < 2.0) {
            feedbackMsg.innerText = "Please speak clearly and try again.";
            feedbackMsg.style.color = "#f1c40f";
            micBtn.classList.add("hidden");
            retryBtn.classList.remove("hidden");
            return;
        }

        // Evaluate core sentence matrix matches using similarity algorithm engine
        const similarity = getSimilarityScore(spokenText, targetText);

        if (similarity >= 0.75) { 
            // SUCCESSFUL PASS EXECUTION ROUTINE
            score += 10;
            scoreDisplay.innerText = score;
            feedbackMsg.innerText = `Correct! +10 points (Spoke: "${spokenText}")`;
            feedbackMsg.style.color = "#2ecc71";
            
            playSound('success');
            car.classList.add("car-passing");
            obstacle.classList.add("obstacle-cleared");

            micBtn.classList.add("hidden");
            nextBtn.classList.remove("hidden");
        } else {
            // CRASH ROUTINE CHANNELS
            feedbackMsg.innerText = `Try again! (You said: "${spokenText}")`;
            feedbackMsg.style.color = "#e74c3c";
            
            playSound('crash');
            car.className = "car-crashed";

            micBtn.classList.add("hidden");
            retryBtn.classList.remove("hidden");
        }
    };
}

// Button Interface Trigger Layout Maps
micBtn.addEventListener("click", startListeningEngine);

retryBtn.addEventListener("click", () => {
    loadLevel();
});

nextBtn.addEventListener("click", () => {
    if (currentLevel < totalLevels) {
        currentLevel++;
        loadLevel();
    } else {
        // Complete final progress bar calculation cap rule update
        progressBar.style.width = "100%";
        setTimeout(() => {
            finalScoreDisplay.innerText = `Final Score: ${score}`;
            gameOverScreen.classList.remove("hidden");
        }, 600);
    }
});

// Primary Start execution loop line hook
loadLevel();