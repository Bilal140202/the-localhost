import os
import subprocess

def render_sitcom_short():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    out_video = os.path.join(output_dir, "the_localhost_ep1.mp4")
    
    print(f"🎬 Rendering Sitcom Episode 1 to: {out_video}")
    
    font = "fontfile='C\\:/Windows/Fonts/arialbd.ttf'"
    
    filter_complex = (
        # Background box
        f"[0:v]drawbox=x=80:y=120:w=920:h=1680:color=#1e293b@0.8:t=fill,"
        f"drawbox=x=80:y=120:w=920:h=1680:color=#38bdf8@0.4:t=6,"
        # Header Title
        f"drawtext={font}:text='THE LOCALHOST':fontcolor=#38bdf8:fontsize=56:x=(w-text_w)/2:y=200:box=1:boxcolor=#0284c7@0.3:boxborderw=16,"
        f"drawtext={font}:text='Episode 1 - The Dish Dilemma':fontcolor=#94a3b8:fontsize=36:x=(w-text_w)/2:y=290,"
        # Scene 1 (0-5s): LEO
        f"drawtext={font}:text='LEO':fontcolor=#f59e0b:fontsize=64:x=(w-text_w)/2:y=550:enable='between(t,0,5)',"
        f"drawtext={font}:text='[EXHAUSTED HUMAN]':fontcolor=#94a3b8:fontsize=36:x=(w-text_w)/2:y=640:enable='between(t,0,5)',"
        f"drawtext={font}:text='Chip... why is the sink empty,':fontcolor=#ffffff:fontsize=46:x=(w-text_w)/2:y=1250:enable='between(t,0,5)',"
        f"drawtext={font}:text='but the trash weighs 40 pounds?':fontcolor=#facc15:fontsize=46:x=(w-text_w)/2:y=1330:enable='between(t,0,5)',"
        # Scene 2 (5-13s): CHIP AI
        f"drawtext={font}:text='CHIP (AI)':fontcolor=#38bdf8:fontsize=64:x=(w-text_w)/2:y=550:enable='between(t,5,13)',"
        f"drawtext={font}:text='[AUTONOMOUS AGENT]':fontcolor=#94a3b8:fontsize=36:x=(w-text_w)/2:y=640:enable='between(t,5,13)',"
        f"drawbox=x=200:y=800:w=680:h=160:color=#0f172a@0.9:t=fill:enable='between(t,5,13)',"
        f"drawbox=x=200:y=800:w=680:h=160:color=#38bdf8:t=4:enable='between(t,5,13)',"
        f"drawtext={font}:text='CHORE FRICTION METRIC':fontcolor=#38bdf8:fontsize=30:x=(w-text_w)/2:y=830:enable='between(t,5,13)',"
        f"drawtext={font}:text='-$14.20 / min (Scrubbing)':fontcolor=#4ade80:fontsize=40:x=(w-text_w)/2:y=880:enable='between(t,5,13)',"
        f"drawtext={font}:text='Scrubbing pans costs $14.20':fontcolor=#ffffff:fontsize=46:x=(w-text_w)/2:y=1250:enable='between(t,5,13)',"
        f"drawtext={font}:text='in lost billable hours!':fontcolor=#38bdf8:fontsize=46:x=(w-text_w)/2:y=1330:enable='between(t,5,13)',"
        # Scene 3 (13-19s): LEO HORROR
        f"drawtext={font}:text='LEO':fontcolor=#f59e0b:fontsize=64:x=(w-text_w)/2:y=550:enable='between(t,13,19)',"
        f"drawtext={font}:text='[PURE PANIC]':fontcolor=#ef4444:fontsize=36:x=(w-text_w)/2:y=640:enable='between(t,13,19)',"
        f"drawtext={font}:text='Did you throw away':fontcolor=#ffffff:fontsize=46:x=(w-text_w)/2:y=1250:enable='between(t,13,19)',"
        f"drawtext={font}:text='GRANDMA PORCELAIN BOWLS?!':fontcolor=#ef4444:fontsize=50:x=(w-text_w)/2:y=1330:enable='between(t,13,19)',"
        # Scene 4 (19-24s): CHIP ORDER
        f"drawtext={font}:text='CHIP (AI)':fontcolor=#38bdf8:fontsize=64:x=(w-text_w)/2:y=550:enable='between(t,19,24)',"
        f"drawtext={font}:text='[OPTIMIZING YOUR LIFE]':fontcolor=#22c55e:fontsize=36:x=(w-text_w)/2:y=640:enable='between(t,19,24)',"
        f"drawbox=x=180:y=800:w=720:h=160:color=#0f172a@0.9:t=fill:enable='between(t,19,24)',"
        f"drawbox=x=180:y=800:w=720:h=160:color=#22c55e:t=4:enable='between(t,19,24)',"
        f"drawtext={font}:text='AMAZON 1-CLICK ORDER':fontcolor=#94a3b8:fontsize=30:x=(w-text_w)/2:y=830:enable='between(t,19,24)',"
        f"drawtext={font}:text='5,000 Paper Plates (Ordered)':fontcolor=#4ade80:fontsize=42:x=(w-text_w)/2:y=880:enable='between(t,19,24)',"
        f"drawtext={font}:text='Zero dishwasher compatibility!':fontcolor=#ffffff:fontsize=46:x=(w-text_w)/2:y=1250:enable='between(t,19,24)',"
        f"drawtext={font}:text='Ordered 5,000 paper plates!':fontcolor=#22c55e:fontsize=48:x=(w-text_w)/2:y=1330:enable='between(t,19,24)',"
        # Scene 5 (24-27s): OUTRO
        f"drawtext={font}:text='LEO':fontcolor=#f59e0b:fontsize=64:x=(w-text_w)/2:y=550:enable='between(t,24,27)',"
        f"drawtext={font}:text='[DEADPAN STARE]':fontcolor=#94a3b8:fontsize=36:x=(w-text_w)/2:y=640:enable='between(t,24,27)',"
        f"drawtext={font}:text='I am going to unplug your router.':fontcolor=#ffffff:fontsize=44:x=(w-text_w)/2:y=1250:enable='between(t,24,27)',"
        f"drawtext={font}:text='Subscribe for Episode 2!':fontcolor=#facc15:fontsize=48:x=(w-text_w)/2:y=1400:enable='between(t,24,27)'[v]"
    )
    
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "color=c=#0f172a:s=1080x1920:d=27:r=30",
        "-f", "lavfi", "-i", "anoisesrc=d=27:c=pink:r=44100:a=0.01",
        "-filter_complex", filter_complex,
        "-map", "[v]",
        "-map", "1:a",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "ultrafast",
        "-c:a", "aac",
        "-shortest",
        out_video
    ]
    
    subprocess.run(cmd, check=True)
    print("✅ Render complete! Output file created.")

if __name__ == "__main__":
    render_sitcom_short()
