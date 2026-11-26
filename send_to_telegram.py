import os
import sys
import json
import urllib.request
import urllib.parse

def send_telegram_video(bot_token, chat_id, video_path, caption=""):
    if not os.path.exists(video_path):
        print(f"❌ File not found: {video_path}")
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendVideo"
    
    # Boundary for multipart/form-data
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    
    data = bytearray()
    
    # chat_id field
    data.extend(f"--{boundary}\r\n".encode("utf-8"))
    data.extend(f'Content-Disposition: form-data; name="chat_id"\r\n\r\n'.encode("utf-8"))
    data.extend(f"{chat_id}\r\n".encode("utf-8"))
    
    # caption field
    if caption:
        data.extend(f"--{boundary}\r\n".encode("utf-8"))
        data.extend(f'Content-Disposition: form-data; name="caption"\r\n\r\n'.encode("utf-8"))
        data.extend(f"{caption}\r\n".encode("utf-8"))
        
    # video file field
    filename = os.path.basename(video_path)
    data.extend(f"--{boundary}\r\n".encode("utf-8"))
    data.extend(f'Content-Disposition: form-data; name="video"; filename="{filename}"\r\n'.encode("utf-8"))
    data.extend(b"Content-Type: video/mp4\r\n\r\n")
    
    with open(video_path, "rb") as f:
        data.extend(f.read())
    data.extend(b"\r\n")
    
    # end boundary
    data.extend(f"--{boundary}--\r\n".encode("utf-8"))
    
    req = urllib.request.Request(url, data=data)
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    
    try:
        print(f"📤 Uploading {filename} to Telegram chat {chat_id}...")
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            if result.get("ok"):
                print("✅ Video sent to Telegram successfully!")
                return True
            else:
                print(f"❌ Telegram Error: {result.get('description')}")
                return False
    except Exception as e:
        print(f"❌ Failed to send: {e}")
        return False

if __name__ == "__main__":
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat = os.environ.get("TELEGRAM_CHAT_ID")
    
    if len(sys.argv) >= 3:
        token = sys.argv[1]
        chat = sys.argv[2]
        
    video_file = r"d:\project\New folder\the-localhost\the_localhost_ep1_real_animation.mp4"
    caption_text = "🎬 The Localhost — Episode 1: 'The Dish Dilemma'\n\nLeo: 'Chip... why is the sink empty, but the trash weighs 40 pounds?'\n\n#Sitcom #TheLocalhost #Shorts"
    
    if not token or not chat:
        print("Usage: python send_to_telegram.py <BOT_TOKEN> <CHAT_ID>")
        print("Or set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.")
        sys.exit(1)
        
    send_telegram_video(token, chat, video_file, caption_text)
