/* ===============================
   CYBER RECON DASHBOARD SCRIPT
================================= */

/* ---------- HERO TYPING EFFECT ---------- */

const heroText = "Scan networks. Analyze services. Learn ethically.";
let heroIndex = 0;

function typeHero() {
    if (heroIndex < heroText.length) {
        document.querySelector(".typing-text").innerHTML += heroText.charAt(heroIndex);
        heroIndex++;
        setTimeout(typeHero, 35);
    }
}

typeHero();


/* ---------- TERMINAL TYPING FUNCTION ---------- */

function typeLine(text, delay = 15) {
    const terminal = document.getElementById("results");
    const line = document.createElement("p");
    line.classList.add("terminal-text");
    terminal.appendChild(line);

    let i = 0;

    function typing() {
        if (i < text.length) {
            line.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, delay);
        }
    }

    typing();
}


/* ---------- RISK LEVEL DETECTION ---------- */

function getRiskLevel(port) {
    const highRisk = [21, 23, 25, 3306];
    const mediumRisk = [22, 80, 8080];

    if (highRisk.includes(port)) return "HIGH";
    if (mediumRisk.includes(port)) return "MEDIUM";
    return "LOW";
}


/* ---------- START SCAN FUNCTION ---------- */

function startScan() {

    const target = document.getElementById("target").value.trim();
    const scanMode = document.getElementById("scan_mode").value;

    let startPort = document.getElementById("start_port").value;
    let endPort = document.getElementById("end_port").value;

    if (scanMode === "quick") {
        startPort = 1;
        endPort = 1024;
    }

    if (scanMode === "full") {
        startPort = 1;
        endPort = 65535;
    }

    if (!target) {
        alert("Please enter a valid target.");
        return;
    }

    if (!startPort || !endPort) {
        alert("Please enter port range.");
        return;
    }

    startPort = parseInt(startPort);
    endPort = parseInt(endPort);

    if (startPort < 1 || endPort > 65535 || startPort > endPort) {
        alert("Invalid port range. Must be between 1 - 65535.");
        return;
    }

    const terminal = document.getElementById("results");
    const loader = document.getElementById("loader");
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");

    terminal.innerHTML = "";
    loader.classList.remove("hidden");
    progressContainer.classList.remove("hidden");
    progressBar.style.width = "0%";

    const scanStartTime = Date.now();

    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += 4;
            progressBar.style.width = progress + "%";
        }
    }, 180);

    fetch("/scan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            target: target,
            start_port: startPort,
            end_port: endPort
        })
    })
    .then(response => response.json())
    .then(data => {

        clearInterval(progressInterval);
        progressBar.style.width = "100%";

        setTimeout(() => {
            loader.classList.add("hidden");
            progressContainer.classList.add("hidden");
        }, 500);

        const scanEndTime = Date.now();
        const duration = ((scanEndTime - scanStartTime) / 1000).toFixed(2);
        const now = new Date().toLocaleTimeString();

        typeLine(`[${now}] Recon scan completed.`);
        typeLine(`Target: ${target}`);
        typeLine(`Port Range: ${startPort} - ${endPort}`);
        typeLine(`Scan Duration: ${duration} seconds`);
        typeLine("==========================================");

        if (!data.open_ports || data.open_ports.length === 0) {
            typeLine("[!] No open ports detected.");
        } else {

            typeLine(`[+] ${data.open_ports.length} Open Port(s) Found:`);
            typeLine("------------------------------------------");

            data.open_ports.forEach((item, index) => {

                setTimeout(() => {

                    const risk = getRiskLevel(item.port);

                    typeLine(`→ Port ${item.port} is OPEN`);
                    typeLine(`   Service: ${item.service || "Unknown"}`);
                    typeLine(`   Risk Level: ${risk}`);
                    
                    if (item.banner && item.banner !== "No banner") {
                        typeLine(`   Banner: ${item.banner}`);
                    }

                    typeLine("------------------------------------------");

                }, index * 400);
            });
        }
    })
    .catch(error => {
        clearInterval(progressInterval);
        loader.classList.add("hidden");
        progressContainer.classList.add("hidden");
        typeLine("[!] Error occurred during scan.");
        console.error(error);
    });
}


/* ---------- MATRIX BACKGROUND EFFECT ---------- */

const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const letters = "01";
const fontSize = 14;
let columns = canvas.width / fontSize;
let drops = [];

for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0ea5e9";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

setInterval(drawMatrix, 33);


/* ---------- RESPONSIVE CANVAS FIX ---------- */

window.addEventListener("resize", () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    columns = canvas.width / fontSize;
    drops = [];

    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
});