import http.server
import socketserver
import subprocess
import os
import sys
import threading
import time

PORT = 8099
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
AUDIO_PATH = os.path.join(DIRECTORY, "master_audio.wav")
OUTPUT_VIDEO = os.path.join(DIRECTORY, "the_localhost_ep1_3d.mp4")

# FFmpeg process streaming JPEG frames from stdin
cmd = [
    "ffmpeg", "-y",
    "-f", "image2pipe",
    "-r", "30",
    "-vcodec", "mjpeg",
    "-i", "pipe:0",
    "-i", AUDIO_PATH,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "22",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    OUTPUT_VIDEO
]

ffmpeg_proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
done_event = threading.Event()
frame_count = 0

class RenderHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        global frame_count
        if self.path.startswith("/frame"):
            length = int(self.headers.get("Content-Length", 0))
            data = self.rfile.read(length)
            ffmpeg_proc.stdin.write(data)
            frame_count += 1
            if frame_count % 60 == 0:
                print(f"[3D Render] Processed {frame_count}/864 frames ({(frame_count/864)*100:.1f}%)")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
        elif self.path == "/done":
            print(f"[3D Render] All {frame_count} frames received! Finalizing video...")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
            done_event.set()
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass # Suppress HTTP access logging

def run_server(httpd):
    httpd.serve_forever()

print("[3D Render] Starting local render server on port", PORT)
socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", PORT), RenderHandler)
server_thread = threading.Thread(target=run_server, args=(httpd,), daemon=True)
server_thread.start()

# Launch Headless Chrome with WebGL enabled
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
chrome_args = [
    chrome_path,
    "--headless=new",
    "--use-gl=angle",
    "--enable-webgl",
    "--window-size=720,1280",
    "--autoplay-policy=no-user-gesture-required",
    f"http://127.0.0.1:{PORT}/render_worker.html"
]

print("[3D Render] Launching Chrome WebGL render engine...")
chrome_proc = subprocess.Popen(chrome_args)

# Wait for completion or timeout
finished = done_event.wait(timeout=450)
if not finished:
    print("[3D Render] Warning: Render timed out!")

try:
    chrome_proc.terminate()
except Exception:
    pass

ffmpeg_proc.stdin.close()
ffmpeg_proc.wait()
httpd.shutdown()

if os.path.exists(OUTPUT_VIDEO):
    size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)
    print(f"[3D Render] SUCCESS! Rendered 3D video: {OUTPUT_VIDEO} ({size_mb:.2f} MB)")
else:
    print("[3D Render] FAILED: Output video not found.")
