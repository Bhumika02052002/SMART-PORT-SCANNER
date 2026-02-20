import socket
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import Flask, request, jsonify, send_from_directory

# Tell Flask to serve files from current folder
app = Flask(__name__, static_folder='.', template_folder='.')

# Common port services
COMMON_SERVICES = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    3306: "MySQL",
    8080: "HTTP-Alt"
}


# ------------------ ROUTES ------------------

# Homepage
@app.route("/")
def home():
    return send_from_directory(".", "index.html")

# Serve CSS
@app.route("/style.css")
def serve_css():
    return send_from_directory(".", "style.css")

# Serve JS
@app.route("/script.js")
def serve_js():
    return send_from_directory(".", "script.js")


# ------------------ SCAN LOGIC ------------------

def scan_port(target, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)

        result = sock.connect_ex((target, port))

        if result == 0:
            service = COMMON_SERVICES.get(port, "Unknown")
            banner = grab_banner(sock, port)
            sock.close()

            return {
                "port": port,
                "service": service,
                "banner": banner
            }

        sock.close()

    except:
        pass

    return None


def grab_banner(sock, port):
    try:
        if port == 80:
            sock.send(b"GET / HTTP/1.1\r\nHost: test\r\n\r\n")
            banner = sock.recv(1024).decode(errors="ignore")
            return banner.split("\n")[0]

        banner = sock.recv(1024).decode(errors="ignore")
        return banner.strip()

    except:
        return "No banner"


@app.route("/scan", methods=["POST"])
def scan():
    data = request.json
    target = data.get("target")
    start_port = int(data.get("start_port"))
    end_port = int(data.get("end_port"))

    open_ports = []

    with ThreadPoolExecutor(max_workers=100) as executor:
        futures = [
            executor.submit(scan_port, target, port)
            for port in range(start_port, end_port + 1)
        ]

        for future in as_completed(futures):
            result = future.result()
            if result:
                open_ports.append(result)

    return jsonify({
        "open_ports": sorted(open_ports, key=lambda x: x["port"])
    })


if __name__ == "__main__":
    app.run(debug=True)