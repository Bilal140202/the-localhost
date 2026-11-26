import os
import sys
import urllib.request
import json

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

if not TOKEN or not CHAT_ID:
    print("Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables must be set.", file=sys.stderr)
    sys.exit(1)

VIDEO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "the_localhost_ep1_3d.mp4")
RELEASE_URL = os.environ.get("RELEASE_URL", "https://github.com/Bilal140202/the-localhost/releases")

def send_notification():
    text = (
        "🚀 The Localhost — New 3D Release Live!\n\n"
        f"📦 Download & Assets:\n{RELEASE_URL}"
    )
    data = json.dumps({"chat_id": CHAT_ID, "text": text}).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{TOKEN}/sendMessage",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        print("Telegram response:", resp.read().decode("utf-8"))

if __name__ == "__main__":
    send_notification()
