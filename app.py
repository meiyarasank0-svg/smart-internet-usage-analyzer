from flask import Flask, jsonify, send_from_directory
import psutil
import time


app = Flask(__name__)


# ========================================
# Network Statistics
# ========================================

start_stats = psutil.net_io_counters()

start_time = time.time()


# ========================================
# START MONITORING
# ========================================

@app.route("/api/start", methods=["POST"])
def start_monitoring():

    global start_stats
    global start_time


    # Take fresh network reading

    start_stats = psutil.net_io_counters()


    # Reset timer

    start_time = time.time()


    return jsonify({

        "message":
        "Monitoring started"

    })



# ========================================
# HOME PAGE
# ========================================

@app.route("/")
def home():

    return send_from_directory(
        ".",
        "index.html"
    )



# ========================================
# CSS
# ========================================

@app.route("/style.css")
def css():

    return send_from_directory(
        ".",
        "style.css"
    )



# ========================================
# JAVASCRIPT
# ========================================

@app.route("/script.js")
def javascript():

    return send_from_directory(
        ".",
        "script.js"
    )



# ========================================
# INTERNET USAGE API
# ========================================

@app.route("/api/usage")
def usage():

    current_stats = psutil.net_io_counters()


    # ================================
    # DOWNLOAD
    # ================================

    download_bytes = (

        current_stats.bytes_recv
        -
        start_stats.bytes_recv

    )


    # ================================
    # UPLOAD
    # ================================

    upload_bytes = (

        current_stats.bytes_sent
        -
        start_stats.bytes_sent

    )


    # ================================
    # TOTAL
    # ================================

    total_bytes = (

        download_bytes
        +
        upload_bytes

    )


    # ================================
    # CONVERT TO MB
    # ================================

    download_mb = round(

        download_bytes /
        (1024 * 1024),

        2

    )


    upload_mb = round(

        upload_bytes /
        (1024 * 1024),

        2

    )


    total_mb = round(

        total_bytes /
        (1024 * 1024),

        2

    )


    # ================================
    # MONITORING TIME
    # ================================

    running_seconds = int(

        time.time()
        -
        start_time

    )


    running_minutes = round(

        running_seconds / 60,

        2

    )


    # ================================
    # SEND DATA
    # ================================

    return jsonify({

        "download":
        download_mb,

        "upload":
        upload_mb,

        "total":
        total_mb,

        "time":
        running_minutes

    })



# ========================================
# START SERVER
# ========================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True

    )