import http.server
import json
import os
import socketserver
import subprocess
import threading

PORT = 8101
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
AUDIO_PATH = os.path.join(DIRECTORY, "master_audio.wav")
OUTPUT_VIDEO = os.path.join(DIRECTORY, "kampus_kaand_ep1_3d.mp4")

with open(os.path.join(DIRECTORY, "timeline_meta.json"), "r", encoding="utf-8") as f:
    TOTAL_FRAMES = json.load(f)["total_frames"]

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
            if frame_count % 120 == 0:
                print(f"[Kampus Kaand 3D] Processed {frame_count}/{TOTAL_FRAMES} frames ({(frame_count/TOTAL_FRAMES)*100:.1f}%)")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
        elif self.path == "/done":
            print(f"[Kampus Kaand 3D] All {frame_count} frames received! Finalizing MP4...")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
            done_event.set()
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass

socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", PORT), RenderHandler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
chrome_args = [
    chrome_path,
    "--headless=new",
    "--use-gl=angle",
    "--enable-webgl",
    "--window-size=1280,720",
    "--autoplay-policy=no-user-gesture-required",
    f"http://127.0.0.1:{PORT}/render_worker.html"
]

print(f"[Kampus Kaand 3D] Launching Chrome WebGL render engine ({TOTAL_FRAMES} frames)...")
chrome_proc = subprocess.Popen(chrome_args)

finished = done_event.wait(timeout=720)
if not finished:
    print("[Kampus Kaand 3D] Warning: Render timed out!")

try:
    chrome_proc.terminate()
except Exception:
    pass

ffmpeg_proc.stdin.close()
ffmpeg_proc.wait()
httpd.shutdown()

if os.path.exists(OUTPUT_VIDEO):
    size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)
    print(f"[Kampus Kaand 3D] SUCCESS! Rendered: {OUTPUT_VIDEO} ({size_mb:.2f} MB)")
else:
    print("[Kampus Kaand 3D] FAILED: Output video not found.")
