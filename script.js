// ========================================
// Smart Internet Usage Analyzer
// ========================================


// Analyzer status

let analyzing = false;


// Automatic update timer

let usageTimer = null;


// Previous network values

let previousDownload = 0;

let previousUpload = 0;

let previousTime = 0;


// Graph data

let graphTimes = [];

let graphTotals = [];


// ========================================
// Open Analyzer
// ========================================

function openAnalyzer() {

    document.getElementById("analyzer").scrollIntoView({
        behavior: "smooth"
    });

}



// ========================================
// START ANALYZING
// ========================================

async function startAnalyzing() {

    try {

        await fetch("/api/start", {
            method: "POST"
        });


        analyzing = true;


        // Reset previous values

        previousDownload = 0;

        previousUpload = 0;

        previousTime = 0;


        // Reset graph

        graphTimes = [];

        graphTotals = [];

        clearGraph();


        // Reset display

        document.getElementById("downloadData").textContent =
            "0 MB";


        document.getElementById("uploadData").textContent =
            "0 MB";


        document.getElementById("totalData").textContent =
            "0 MB";


        document.getElementById("totalTime").textContent =
            "0 Minutes";


        document.getElementById("downloadSpeed").textContent =
            "0 KB/s";


        document.getElementById("uploadSpeed").textContent =
            "0 KB/s";


        // Buttons

        document.getElementById("startBtn").disabled = true;

        document.getElementById("stopBtn").disabled = false;

        document.getElementById("refreshBtn").disabled = false;


        // Status

        document.getElementById("connectionStatus").textContent =
            "Analyzer Running";


        document.getElementById("statusDot")
            .classList.add("active");


        // Network message

        document.getElementById("networkMessage").textContent =
            "Internet usage monitoring is active.";


        // Alert

        document.getElementById("alertMessage").textContent =
            "Monitoring your data usage...";


        document.getElementById("alertBox")
            .classList.remove("warning", "danger");


        // Report

        document.getElementById("reportMessage").innerHTML =

            "<strong>Internet Usage Report</strong>" +

            "<br><br>" +

            "Monitoring has started from 0 MB.";


        // First data

        getUsage();


        // Clear old timer

        if (usageTimer !== null) {

            clearInterval(usageTimer);

        }


        // Update every 2 seconds

        usageTimer = setInterval(
            getUsage,
            2000
        );

    }


    catch (error) {

        console.error(
            "Start Error:",
            error
        );


        document.getElementById(
            "connectionStatus"
        ).textContent =
            "Backend Connection Error";

    }

}



// ========================================
// STOP ANALYZING
// ========================================

function stopAnalyzing() {

    analyzing = false;


    if (usageTimer !== null) {

        clearInterval(usageTimer);

        usageTimer = null;

    }


    document.getElementById("startBtn").disabled = false;

    document.getElementById("stopBtn").disabled = true;

    document.getElementById("refreshBtn").disabled = true;


    document.getElementById("connectionStatus").textContent =
        "Analyzer Stopped";


    document.getElementById("statusDot")
        .classList.remove("active");


    document.getElementById("networkMessage").textContent =
        "Internet usage monitoring has been stopped.";


    document.getElementById("reportMessage").innerHTML =

        "<strong>Analysis Stopped</strong>" +

        "<br><br>" +

        "The internet usage analyzer has been stopped by the user.";

}



// ========================================
// GET USAGE
// ========================================

async function getUsage() {

    if (!analyzing) {

        return;

    }


    try {

        const response =
            await fetch("/api/usage");


        const data =
            await response.json();


        console.log(
            "Backend Data:",
            data
        );


        // ================================
        // DATA DISPLAY
        // ================================

        document.getElementById(
            "downloadData"
        ).textContent =
            data.download + " MB";


        document.getElementById(
            "uploadData"
        ).textContent =
            data.upload + " MB";


        document.getElementById(
            "totalData"
        ).textContent =
            data.total + " MB";


        document.getElementById(
            "totalTime"
        ).textContent =
            data.time + " Minutes";



        // ================================
        // SPEED CALCULATION
        // ================================

        calculateSpeed(data);



        // ================================
        // GRAPH
        // ================================

        updateGraph(data);



        // ================================
        // DATA ALERT
        // ================================

        updateDataAlert(data);



        // ================================
        // REPORT
        // ================================

        generateReport(data);

    }


    catch (error) {

        console.error(
            "Backend Error:",
            error
        );


        document.getElementById(
            "connectionStatus"
        ).textContent =
            "Backend Connection Error";


        document.getElementById(
            "networkMessage"
        ).textContent =
            "Unable to connect to Python backend.";

    }

}



// ========================================
// REAL-TIME SPEED
// ========================================

function calculateSpeed(data) {


    const currentTime =
        data.time * 60;


    // First reading

    if (previousTime === 0) {

        previousDownload = data.download;

        previousUpload = data.upload;

        previousTime = currentTime;


        return;

    }


    const timeDifference =
        currentTime - previousTime;


    if (timeDifference <= 0) {

        return;

    }


    const downloadDifference =
        data.download - previousDownload;


    const uploadDifference =
        data.upload - previousUpload;


    // MB per second

    const downloadMBps =
        downloadDifference /
        timeDifference;


    const uploadMBps =
        uploadDifference /
        timeDifference;


    // Convert MB/s to KB/s

    const downloadKBps =
        Math.max(
            0,
            downloadMBps * 1024
        );


    const uploadKBps =
        Math.max(
            0,
            uploadMBps * 1024
        );


    document.getElementById(
        "downloadSpeed"
    ).textContent =
        downloadKBps.toFixed(2) + " KB/s";


    document.getElementById(
        "uploadSpeed"
    ).textContent =
        uploadKBps.toFixed(2) + " KB/s";


    // Save current values

    previousDownload = data.download;

    previousUpload = data.upload;

    previousTime = currentTime;

}



// ========================================
// GRAPH
// ========================================

function updateGraph(data) {


    graphTimes.push(data.time);

    graphTotals.push(data.total);


    // Keep only latest 30 points

    if (graphTimes.length > 30) {

        graphTimes.shift();

        graphTotals.shift();

    }


    drawGraph();

}



// ========================================
// CLEAR GRAPH
// ========================================

function clearGraph() {

    const canvas =
        document.getElementById("usageChart");


    const ctx =
        canvas.getContext("2d");


    const width =
        canvas.clientWidth;


    const height =
        canvas.clientHeight;


    canvas.width =
        width * window.devicePixelRatio;


    canvas.height =
        height * window.devicePixelRatio;


    ctx.scale(
        window.devicePixelRatio,
        window.devicePixelRatio
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // Empty graph message

    ctx.fillStyle = "#929bb5";

    ctx.font = "16px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "Start analyzer to display graph",
        width / 2,
        height / 2
    );

}



// ========================================
// DRAW GRAPH
// ========================================

function drawGraph() {


    const canvas =
        document.getElementById("usageChart");


    const ctx =
        canvas.getContext("2d");


    const width =
        canvas.clientWidth;


    const height =
        canvas.clientHeight;


    canvas.width =
        width * window.devicePixelRatio;


    canvas.height =
        height * window.devicePixelRatio;


    ctx.scale(
        window.devicePixelRatio,
        window.devicePixelRatio
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // Graph margins

    const left =
        55;

    const right =
        20;

    const top =
        25;

    const bottom =
        45;


    const graphWidth =
        width - left - right;


    const graphHeight =
        height - top - bottom;


    // Background

    ctx.fillStyle =
        "#11182d";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // No data

    if (graphTotals.length === 0) {

        ctx.fillStyle =
            "#929bb5";

        ctx.font =
            "16px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Start analyzer to display graph",
            width / 2,
            height / 2
        );

        return;

    }


    // Maximum value

    let maxValue =
        Math.max(...graphTotals);


    if (maxValue === 0) {

        maxValue = 1;

    }


    // ================================
    // GRID LINES
    // ================================

    ctx.strokeStyle =
        "#292f4b";

    ctx.lineWidth = 1;


    for (
        let i = 0;
        i <= 5;
        i++
    ) {

        const y =
            top +
            (graphHeight / 5) * i;


        ctx.beginPath();

        ctx.moveTo(
            left,
            y
        );

        ctx.lineTo(
            width - right,
            y
        );

        ctx.stroke();


        // Y-axis label

        const value =
            maxValue -
            (maxValue / 5) * i;


        ctx.fillStyle =
            "#929bb5";

        ctx.font =
            "12px Arial";

        ctx.textAlign =
            "right";


        ctx.fillText(
            value.toFixed(1) + " MB",
            left - 8,
            y + 4
        );

    }



    // ================================
    // GRAPH LINE
    // ================================

    ctx.beginPath();


    graphTotals.forEach(
        (value, index) => {

            let x;


            if (
                graphTotals.length === 1
            ) {

                x =
                    left +
                    graphWidth / 2;

            }

            else {

                x =
                    left +
                    (
                        index /
                        (graphTotals.length - 1)
                    ) *
                    graphWidth;

            }


            const y =
                top +
                graphHeight -
                (
                    value /
                    maxValue
                ) *
                graphHeight;


            if (index === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            }

            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }
    );


    ctx.strokeStyle =
        "#8b7cff";

    ctx.lineWidth = 3;

    ctx.stroke();



    // ================================
    // POINTS
    // ================================

    graphTotals.forEach(
        (value, index) => {

            let x;


            if (
                graphTotals.length === 1
            ) {

                x =
                    left +
                    graphWidth / 2;

            }

            else {

                x =
                    left +
                    (
                        index /
                        (graphTotals.length - 1)
                    ) *
                    graphWidth;

            }


            const y =
                top +
                graphHeight -
                (
                    value /
                    maxValue
                ) *
                graphHeight;


            ctx.beginPath();


            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#9d91ff";

            ctx.fill();

        }
    );



    // ================================
    // X AXIS LABEL
    // ================================

    ctx.fillStyle =
        "#929bb5";

    ctx.font =
        "12px Arial";

    ctx.textAlign =
        "center";


    ctx.fillText(
        "Monitoring Time",
        width / 2,
        height - 12
    );

}



// ========================================
// DATA USAGE ALERT
// ========================================

function updateDataAlert(data) {


    const alertBox =
        document.getElementById("alertBox");


    const alertMessage =
        document.getElementById("alertMessage");


    alertBox.classList.remove(
        "warning",
        "danger"
    );


    // Less than 100 MB

    if (data.total < 100) {

        alertMessage.textContent =

            "Your current data usage is normal. No alert.";

    }


    // 100 MB - 500 MB

    else if (data.total < 500) {

        alertBox.classList.add(
            "warning"
        );


        alertMessage.textContent =

            "Warning: Your data usage is increasing. Keep monitoring your internet activity.";

    }


    // Above 500 MB

    else {

        alertBox.classList.add(
            "danger"
        );


        alertMessage.textContent =

            "High Data Usage Alert: Your internet usage has crossed 500 MB.";

    }

}



// ========================================
// USAGE REPORT
// ========================================

function generateReport(data) {


    const reportMessage =
        document.getElementById(
            "reportMessage"
        );


    let usageLevel;

    let suggestion;


    // Low

    if (data.total < 50) {

        usageLevel = "Low";


        suggestion =

            "Your current internet usage is low. Continue monitoring your usage.";

    }


    // Moderate

    else if (data.total < 500) {

        usageLevel = "Moderate";


        suggestion =

            "Your internet usage is moderate. Keep an eye on high-data activities.";

    }


    // High

    else {

        usageLevel = "High";


        suggestion =

            "Your internet usage is high. Consider reducing unnecessary streaming and large downloads.";

    }



    reportMessage.innerHTML = `

        <strong>Internet Usage Report</strong>

        <br><br>

        Download Data:
        <strong>${data.download} MB</strong>

        <br>

        Upload Data:
        <strong>${data.upload} MB</strong>

        <br>

        Total Data:
        <strong>${data.total} MB</strong>

        <br>

        Monitoring Time:
        <strong>${data.time} Minutes</strong>

        <br><br>

        Usage Level:
        <strong>${usageLevel}</strong>

        <br><br>

        💡 ${suggestion}

    `;

}



// ========================================
// WINDOW RESIZE
// ========================================

window.addEventListener(
    "resize",
    function () {

        if (graphTotals.length === 0) {

            clearGraph();

        }

        else {

            drawGraph();

        }

    }
);


// ========================================
// INITIAL GRAPH
// ========================================

window.addEventListener(
    "load",
    function () {

        clearGraph();

    }
);