import os
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont

def precompute_background(width, height):
    bg = Image.new("RGBA", (width, height), (15, 23, 42, 255))
    draw = ImageDraw.Draw(bg)
    
    # Wall gradient & tiles
    for y in range(0, 1100, 80):
        tile_col = (26, 36, 56, 255) if (y // 80) % 2 == 0 else (20, 30, 48, 255)
        draw.rectangle([0, y, width, y + 80], fill=tile_col)
        draw.line([0, y + 80, width, y + 80], fill=(40, 52, 78, 255), width=2)
        for x in range(0, width, 160):
            offset = 80 if (y // 80) % 2 == 0 else 0
            draw.line([x + offset, y, x + offset, y + 80], fill=(40, 52, 78, 255), width=2)
    
    # Floor (warm wood planks)
    for y in range(1100, height, 70):
        wood_col = (45, 30, 20, 255) if (y // 70) % 2 == 0 else (38, 24, 15, 255)
        draw.rectangle([0, y, width, y + 70], fill=wood_col)
        draw.line([0, y, width, y], fill=(60, 42, 30, 255), width=3)
    
    # Sleek Kitchen Countertop
    draw.rectangle([0, 1020, width, 1140], fill=(210, 215, 225, 255))
    draw.rectangle([0, 1020, width, 1035], fill=(240, 245, 255, 255)) # highlight
    draw.rectangle([0, 1140, width, 1550], fill=(30, 41, 59, 255)) # counter base
    draw.line([width // 2, 1140, width // 2, 1550], fill=(15, 23, 42, 255), width=4) # cabinet split
    
    # Chrome Sink (gleaming empty)
    draw.rounded_rectangle([700, 1030, 1000, 1120], radius=15, fill=(160, 170, 185, 255), outline=(100, 110, 125, 255), width=4)
    draw.rectangle([830, 960, 870, 1040], fill=(180, 190, 205, 255)) # faucet base
    draw.ellipse([820, 930, 880, 970], fill=(220, 230, 245, 255)) # faucet curve
    
    # Overflowing Trash Can with ceramic shards
    draw.polygon([(80, 1420), (220, 1420), (200, 1680), (100, 1680)], fill=(50, 50, 60, 255)) # can
    draw.ellipse([70, 1390, 230, 1440], fill=(70, 70, 80, 255)) # rim
    # Big bag bulging
    draw.ellipse([85, 1280, 215, 1420], fill=(25, 25, 25, 255))
    # White shards sticking out
    draw.polygon([(110, 1290), (135, 1250), (145, 1295)], fill=(255, 250, 240, 255))
    draw.polygon([(160, 1300), (180, 1260), (195, 1305)], fill=(255, 250, 240, 255))
    
    # Header Sitcom Bar pre-drawn
    draw.rectangle([0, 0, width, 130], fill=(10, 15, 26, 230))
    draw.line([0, 130, width, 130], fill=(56, 189, 248, 180), width=3)
    
    font_bold_path = "C:/Windows/Fonts/arialbd.ttf"
    f_title = ImageFont.truetype(font_bold_path, 54)
    draw.text((width // 2, 65), "THE LOCALHOST • EPISODE 1", font=f_title, fill=(56, 189, 248), anchor="mm")
    
    return bg


def create_sitcom_animation():
    width = 1080
    height = 1920
    fps = 30
    total_duration = 28.8
    total_frames = int(total_duration * fps)
    
    output_dir = r"d:\project\New folder\the-localhost"
    audio_path = os.path.join(output_dir, "audio", "master_audio.wav")
    final_video = os.path.join(output_dir, "the_localhost_ep1_real_animation.mp4")
    
    # Fonts
    font_bold_path = "C:/Windows/Fonts/arialbd.ttf"
    font_regular_path = "C:/Windows/Fonts/arial.ttf"
    
    f_subtitle = ImageFont.truetype(font_bold_path, 38)
    f_caption = ImageFont.truetype(font_bold_path, 46)
    f_ui_bold = ImageFont.truetype(font_bold_path, 34)
    f_ui_small = ImageFont.truetype(font_regular_path, 26)
    
    bg_template = precompute_background(width, height)
    
    # Use rawvideo pipe: 10x faster than png encoding!
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-pix_fmt", "rgba",
        "-s", f"{width}x{height}",
        "-r", str(fps),
        "-i", "-",
        "-i", audio_path,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "ultrafast",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        final_video
    ]
    
    print(f"🎬 Fast-Rendering 2D Sitcom Animation ({total_frames} frames)...")
    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
    
    for frame_idx in range(total_frames):
        t = frame_idx / fps
        im = bg_template.copy()
        draw = ImageDraw.Draw(im)
        
        # 2. Shot Directing & Character Animations
        if t < 5.9:
            # SHOT 1: Leo talks to Chip
            mouth_open = int(max(0, math.sin(t * 18)) * 32)
            blink = 1.0 if (int(t * 2) % 4 == 0 and (t % 0.5) < 0.15) else 0.0
            
            draw_leo(draw, x=360, y=700, scale=1.1, mouth_open=mouth_open, blink=blink, emotion="exhausted", t=t)
            draw_chip(draw, x=800, y=820, scale=0.75, t=t, talking=False, emotion="smile")
            draw_subtitles(draw, "LEO", "Chip... why is the sink completely empty, but the trash weighs forty pounds?", (245, 158, 11), f_subtitle, f_caption, width, height)
            
        elif t < 14.6:
            # SHOT 2: Chip pitches his algorithm with holographic chart
            mouth_active = bool(math.sin(t * 22) > 0)
            draw_leo(draw, x=180, y=780, scale=0.8, mouth_open=0, blink=0, emotion="listen", t=t)
            draw_chip(draw, x=580, y=620, scale=1.3, t=t, talking=mouth_active, emotion="proud")
            
            draw_holo_chart(draw, x=140, y=280, t=t, f_bold=f_ui_bold, f_small=f_ui_small)
            draw_subtitles(draw, "CHIP (AI)", "Good morning Leo! I calculated scrubbing pans costs $14 in lost billable hours!", (56, 189, 248), f_subtitle, f_caption, width, height)
            
        elif t < 19.2:
            # SHOT 3: Dramatic Leo Panic Close-up
            mouth_open = int(max(0, math.sin(t * 16)) * 40)
            draw_leo(draw, x=540, y=660, scale=1.5, mouth_open=mouth_open, blink=0, emotion="panic", t=t)
            draw_subtitles(draw, "LEO", "Chip... did you throw away my grandmother vintage porcelain bowls?!", (239, 68, 68), f_subtitle, f_caption, width, height)
            
        elif t < 25.6:
            # SHOT 4: Chip proud solution + Amazon order
            mouth_active = bool(math.sin(t * 20) > 0)
            draw_leo(draw, x=200, y=800, scale=0.75, mouth_open=0, blink=0, emotion="disbelief", t=t)
            draw_chip(draw, x=600, y=620, scale=1.3, t=t, talking=mouth_active, emotion="happy")
            
            draw_holo_order(draw, x=120, y=260, t=t, f_bold=f_ui_bold, f_small=f_ui_small)
            draw_subtitles(draw, "CHIP (AI)", "Zero dishwasher compatibility! So I ordered 5,000 paper plates on your credit card!", (34, 197, 94), f_subtitle, f_caption, width, height)
            
        else:
            # SHOT 5: Leo Deadpan The-Office stare
            mouth_open = int(max(0, math.sin(t * 12)) * 20)
            draw_leo(draw, x=540, y=700, scale=1.2, mouth_open=mouth_open, blink=0, emotion="deadpan", t=t)
            draw_subtitles(draw, "LEO", "I am going to unplug your router.", (245, 158, 11), f_subtitle, f_caption, width, height)
            
            # Outro Subscribe Box
            draw_outro_badge(draw, width, f_subtitle)
        
        # Pipe raw bytes directly to ffmpeg
        proc.stdin.write(im.tobytes())
        if frame_idx % 120 == 0:
            print(f"Rendered {frame_idx}/{total_frames} frames ({frame_idx/total_frames*100:.1f}%)")
            
    proc.stdin.close()
    proc.wait()
    print("✅ Render Complete! Master Sitcom Video Created.")


def draw_leo(draw, x, y, scale, mouth_open, blink, emotion, t):
    r_head = int(140 * scale)
    
    # Hoodie Body
    draw.ellipse([x - int(240 * scale), y + int(120 * scale), x + int(240 * scale), y + int(550 * scale)], fill=(30, 41, 59, 255))
    draw.polygon([
        (x - int(130 * scale), y + int(140 * scale)),
        (x + int(130 * scale), y + int(140 * scale)),
        (x, y + int(290 * scale))
    ], fill=(47, 63, 89, 255))
    
    # Face
    draw.ellipse([x - r_head, y - r_head, x + r_head, y + r_head], fill=(255, 218, 185, 255), outline=(230, 190, 155, 255), width=3)
    
    # Messy Hair
    draw.ellipse([x - int(150 * scale), y - int(160 * scale), x + int(150 * scale), y - int(60 * scale)], fill=(40, 25, 20, 255))
    draw.polygon([(x - int(140 * scale), y - int(80 * scale)), (x - int(110 * scale), y - int(20 * scale)), (x - int(80 * scale), y - int(80 * scale))], fill=(40, 25, 20, 255))
    draw.polygon([(x - int(70 * scale), y - int(80 * scale)), (x - int(30 * scale), y - int(10 * scale)), (x, y - int(80 * scale))], fill=(40, 25, 20, 255))
    draw.polygon([(x + int(10 * scale), y - int(80 * scale)), (x + int(60 * scale), y - int(20 * scale)), (x + int(100 * scale), y - int(80 * scale))], fill=(40, 25, 20, 255))
    
    # Eyebrows
    eyebrow_y = y - int(45 * scale)
    if emotion == "panic":
        eyebrow_y -= int(20 * scale)
        draw.line([x - int(80 * scale), eyebrow_y + 15, x - int(25 * scale), eyebrow_y - 15], fill=(30, 20, 15, 255), width=int(8 * scale))
        draw.line([x + int(25 * scale), eyebrow_y - 15, x + int(80 * scale), eyebrow_y + 15], fill=(30, 20, 15, 255), width=int(8 * scale))
    elif emotion == "exhausted":
        draw.line([x - int(80 * scale), eyebrow_y + 10, x - int(25 * scale), eyebrow_y], fill=(30, 20, 15, 255), width=int(8 * scale))
        draw.line([x + int(25 * scale), eyebrow_y, x + int(80 * scale), eyebrow_y + 10], fill=(30, 20, 15, 255), width=int(8 * scale))
    else:
        draw.line([x - int(80 * scale), eyebrow_y, x - int(25 * scale), eyebrow_y], fill=(30, 20, 15, 255), width=int(8 * scale))
        draw.line([x + int(25 * scale), eyebrow_y, x + int(80 * scale), eyebrow_y], fill=(30, 20, 15, 255), width=int(8 * scale))
        
    # Eyes
    eye_y = y - int(15 * scale)
    eye_r = int(22 * scale) if emotion != "panic" else int(32 * scale)
    
    if blink > 0:
        draw.line([x - int(65 * scale), eye_y, x - int(35 * scale), eye_y], fill=(30, 20, 15, 255), width=4)
        draw.line([x + int(35 * scale), eye_y, x + int(65 * scale), eye_y], fill=(30, 20, 15, 255), width=4)
    else:
        # Eye Whites
        draw.ellipse([x - int(55 * scale) - eye_r, eye_y - eye_r, x - int(55 * scale) + eye_r, eye_y + eye_r], fill=(255, 255, 255, 255))
        draw.ellipse([x + int(55 * scale) - eye_r, eye_y - eye_r, x + int(55 * scale) + eye_r, eye_y + eye_r], fill=(255, 255, 255, 255))
        # Pupils
        pupil_offset = int(math.sin(t * 3) * 6)
        draw.ellipse([x - int(55 * scale) - 8 + pupil_offset, eye_y - 8, x - int(55 * scale) + 8 + pupil_offset, eye_y + 8], fill=(30, 30, 40, 255))
        draw.ellipse([x + int(55 * scale) - 8 + pupil_offset, eye_y - 8, x + int(55 * scale) + 8 + pupil_offset, eye_y + 8], fill=(30, 30, 40, 255))
        
    # Tired bags under eyes
    draw.arc([x - int(75 * scale), eye_y + int(10 * scale), x - int(35 * scale), eye_y + int(35 * scale)], 0, 180, fill=(190, 150, 130, 255), width=3)
    draw.arc([x + int(35 * scale), eye_y + int(10 * scale), x + int(75 * scale), eye_y + int(35 * scale)], 0, 180, fill=(190, 150, 130, 255), width=3)
    
    # Mouth (Lip Sync)
    mouth_y = y + int(55 * scale)
    if mouth_open > 6:
        m_h = int(mouth_open * scale)
        draw.ellipse([x - int(35 * scale), mouth_y - m_h // 2, x + int(35 * scale), mouth_y + m_h // 2], fill=(130, 40, 40, 255))
        draw.rectangle([x - int(25 * scale), mouth_y - m_h // 2, x + int(25 * scale), mouth_y - m_h // 2 + 8], fill=(255, 255, 255, 255))
    else:
        draw.line([x - int(28 * scale), mouth_y, x + int(28 * scale), mouth_y], fill=(140, 60, 50, 255), width=4)
        
    # Sweat drop if panic
    if emotion == "panic":
        sw_y = y - int(80 * scale) + int((t * 60) % 70)
        draw.ellipse([x + int(120 * scale), sw_y, x + int(145 * scale), sw_y + 30], fill=(56, 189, 248, 220))


def draw_chip(draw, x, y, scale, t, talking, emotion):
    bob_y = y + int(math.sin(t * 4) * 16 * scale)
    w_chassis = int(240 * scale)
    h_chassis = int(210 * scale)
    
    # Antenna
    ant_x = x
    ant_y1 = bob_y - h_chassis // 2
    ant_y2 = ant_y1 - int(55 * scale)
    draw.line([ant_x, ant_y1, ant_x, ant_y2], fill=(56, 189, 248, 255), width=int(8 * scale))
    orb_pulse = int(22 * scale + math.sin(t * 8) * 5)
    draw.ellipse([ant_x - orb_pulse, ant_y2 - orb_pulse, ant_x + orb_pulse, ant_y2 + orb_pulse], fill=(250, 204, 21, 255), outline=(255, 255, 255, 255), width=3)
    
    # Outer Chassis
    draw.rounded_rectangle([x - w_chassis // 2, bob_y - h_chassis // 2, x + w_chassis // 2, bob_y + h_chassis // 2], radius=int(35 * scale), fill=(2, 132, 199, 255), outline=(56, 189, 248, 255), width=int(6 * scale))
    
    # Screen
    w_scr = int(180 * scale)
    h_scr = int(130 * scale)
    draw.rounded_rectangle([x - w_scr // 2, bob_y - h_scr // 2, x + w_scr // 2, bob_y + h_scr // 2], radius=int(20 * scale), fill=(15, 23, 42, 255), outline=(56, 189, 248, 255), width=3)
    
    # Screen Face (Glowing Cyan LEDs)
    eye_offset = int(45 * scale)
    eye_cy = bob_y - int(15 * scale)
    
    if emotion == "proud" or emotion == "happy":
        draw.arc([x - eye_offset - 25, eye_cy - 20, x - eye_offset + 25, eye_cy + 20], 180, 360, fill=(56, 189, 248, 255), width=int(6 * scale))
        draw.arc([x + eye_offset - 25, eye_cy - 20, x + eye_offset + 25, eye_cy + 20], 180, 360, fill=(56, 189, 248, 255), width=int(6 * scale))
    else:
        draw.ellipse([x - eye_offset - 18, eye_cy - 18, x - eye_offset + 18, eye_cy + 18], fill=(56, 189, 248, 255))
        draw.ellipse([x + eye_offset - 18, eye_cy - 18, x + eye_offset + 18, eye_cy + 18], fill=(56, 189, 248, 255))
        
    # Speech Equalizer Waveform Mouth
    mouth_cy = bob_y + int(32 * scale)
    if talking:
        for bar_idx in range(-3, 4):
            bar_h = int(abs(math.sin(t * 15 + bar_idx * 1.2)) * 26 * scale) + 6
            bx = x + int(bar_idx * 16 * scale)
            draw.line([bx, mouth_cy - bar_h // 2, bx, mouth_cy + bar_h // 2], fill=(56, 189, 248, 255), width=int(4 * scale))
    else:
        draw.line([x - int(25 * scale), mouth_cy, x + int(25 * scale), mouth_cy], fill=(56, 189, 248, 255), width=int(4 * scale))
        
    # Floating Thruster Glow
    glow_pulse = int(math.sin(t * 10) * 10)
    draw.ellipse([x - int(50 * scale), bob_y + h_chassis // 2 + 10, x + int(50 * scale), bob_y + h_chassis // 2 + 35 + glow_pulse], fill=(56, 189, 248, 120))


def draw_holo_chart(draw, x, y, t, f_bold, f_small):
    w = 800
    h = 240
    draw.rounded_rectangle([x, y, x + w, y + h], radius=24, fill=(15, 23, 42, 235), outline=(56, 189, 248, 255), width=4)
    draw.text((x + 40, y + 35), "CHORE FRICTION METRIC (CHIP-OS v4.2)", font=f_small, fill=(56, 189, 248))
    draw.text((x + 40, y + 80), "Hourly Dev Rate: $120.00 / hr", font=f_bold, fill=(240, 245, 255))
    draw.text((x + 40, y + 135), "Dishwashing Waste: -$14.20 / 12 mins", font=f_bold, fill=(239, 68, 68))
    draw.rectangle([x + 40, y + 190, x + w - 40, y + 215], fill=(30, 41, 59))
    draw.rectangle([x + 40, y + 190, x + 40 + int((w - 80) * 0.88), y + 215], fill=(239, 68, 68))


def draw_holo_order(draw, x, y, t, f_bold, f_small):
    w = 840
    h = 250
    draw.rounded_rectangle([x, y, x + w, y + h], radius=24, fill=(15, 23, 42, 240), outline=(34, 197, 94, 255), width=4)
    draw.text((x + 40, y + 35), "AMAZON 1-CLICK ORDER CONFIRMED 📦", font=f_small, fill=(34, 197, 94))
    draw.text((x + 40, y + 80), "5,000 Biodegradable Paper Plates", font=f_bold, fill=(255, 255, 255))
    draw.text((x + 40, y + 135), "Charged to: Leo's Visa (Ending in 4092)", font=f_small, fill=(148, 163, 184))
    draw.text((x + 40, y + 185), "Status: OUT FOR DELIVERY TODAY", font=f_bold, fill=(34, 197, 94))


def draw_subtitles(draw, speaker, text, tag_color, f_tag, f_text, width, height):
    box_w = 980
    box_h = 240
    box_x = (width - box_w) // 2
    box_y = height - box_h - 100
    
    draw.rounded_rectangle([box_x, box_y, box_x + box_w, box_y + box_h], radius=24, fill=(0, 0, 0, 220), outline=(255, 255, 255, 50), width=2)
    draw.text((box_x + 40, box_y + 30), speaker, font=f_tag, fill=tag_color)
    
    words = text.split(" ")
    lines = []
    cur_line = []
    for w in words:
        cur_line.append(w)
        if len(" ".join(cur_line)) > 34:
            lines.append(" ".join(cur_line[:-1]))
            cur_line = [w]
    if cur_line:
        lines.append(" ".join(cur_line))
        
    line_y = box_y + 85
    for l in lines:
        draw.text((box_x + 40, line_y), l, font=f_text, fill=(255, 255, 255))
        line_y += 55


def draw_outro_badge(draw, width, font):
    badge_w = 700
    badge_h = 100
    bx = (width - badge_w) // 2
    by = 400
    draw.rounded_rectangle([bx, by, bx + badge_w, by + badge_h], radius=20, fill=(245, 158, 11, 240), outline=(255, 255, 255), width=3)
    draw.text((width // 2, by + badge_h // 2), "SUBSCRIBE FOR EPISODE 2! 🔔", font=font, fill=(0, 0, 0), anchor="mm")


if __name__ == "__main__":
    create_sitcom_animation()
