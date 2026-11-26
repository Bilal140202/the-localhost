import asyncio
import json
import math
import os
import random
import struct
import subprocess
import wave
import edge_tts

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(BASE_DIR, "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

SR = 24000

# Hinglish Script with exact comedic structure (Setup -> Slap -> Pause/Laugh -> Punchline!)
# Stage 1 computes exact durations via TTS, Stage 2 lays out non-overlapping timeline automatically!
SCRIPT_BEATS = [
    # (id, speaker, voice, rate, pitch, gap_before, laugh_after_s, laugh_intensity, applause, text_tts, subtitle_roman)
    ("01_aarav_intro", "aarav", "hi-IN-MadhurNeural", "+4%", "+0Hz", 3.0, 0.0, 0.0, False,
     "यार रोहन, कॉलेज का पहला दिन है! बस आज कोई लफड़ा ना हो, full chill vibes!",
     "Yaar Rohan, college ka pehla din hai! Bas aaj koi lafda na ho, full chill vibes!"),
    # SLAP 1 happens right here (accident from Aarav's excited gesture!)
    ("02_rohan_slap1", "rohan", "hi-IN-MadhurNeural", "+10%", "+12Hz", 0.65, 1.4, 0.24, False,
     "आउच! भाई, तूने अभी-अभी मुझे बैकहैंड थप्पड़ मारा?!",
     "OUCH! Bhai, tune abhi-abhi mujhe backhand thappad maara?!"),
    ("03_aarav_excuse", "aarav", "hi-IN-MadhurNeural", "+6%", "+2Hz", 0.15, 0.0, 0.0, False,
     "अरे वो तो एक्साइटमेंट में लग गया! अंदर चल, यहाँ सब बहुत शरीफ़ लोग हैं!",
     "Arre woh toh excitement mein lag gaya! Andar chal, yahan sab bahut shareef log hain!"),
    # SLAP 2 happens right as Senior bursts out!
    ("04_senior_slap2", "senior", "hi-IN-MadhurNeural", "+2%", "-16Hz", 0.35, 0.0, 0.0, False,
     "अबे चिंटू! मेरा असाइनमेंट कहाँ है?!",
     "Abe Chintu! Mera assignment kahan hai?!"),
    ("05_senior_oops", "senior", "hi-IN-MadhurNeural", "-4%", "-14Hz", 0.55, 1.5, 0.28, False,
     "अरे... तू चिंटू नहीं है? सॉरी छोटे, सेम हेयरकट है!",
     "Arre... tu Chintu nahi hai? Sorry chote, same haircut hai!"),
    ("06_rohan_haircut", "rohan", "hi-IN-MadhurNeural", "+12%", "+14Hz", 0.15, 1.3, 0.25, False,
     "मेरा हेयरकट मेरी जान ले लेगा आज! मैं अब हर इंसान से दस फुट दूर चलूंगा!",
     "Mera haircut meri jaan le lega aaj! Main ab har insaan se 10 foot door chalunga!"),
    # SLAP 3 (Object: Swinging Canteen Door WHACKS Rohan mid-walk!)
    ("07_aarav_door", "aarav", "hi-IN-MadhurNeural", "+8%", "+2Hz", 0.75, 1.6, 0.30, False,
     "ब्रो, अब तो नॉन-लिविंग दरवाज़ों को भी तुझसे प्रॉब्लम है!",
     "Bro, ab toh non-living darwaazon ko bhi tujhse problem hai!"),
    ("08_rohan_safe", "rohan", "hi-IN-MadhurNeural", "+6%", "+10Hz", 0.20, 0.0, 0.0, False,
     "चलो फाइनली, ओपन एयर कैंटीन! यहाँ ना कोई सीनियर है, ना कोई दरवाज़ा...",
     "Chalo finally, open-air canteen! Yahan na koi senior hai, na koi darwaaza..."),
    # SLAP 4 (Animal: Campus Monkey swings down & slaps Rohan cleanly across the cheek!)
    ("09_rohan_curse", "rohan", "hi-IN-MadhurNeural", "+10%", "+16Hz", 0.75, 1.9, 0.34, False,
     "यूनिवर्स ने मेरे गाल पर क्या कॉन्ट्रैक्ट साइन किया है?! एक बंदर भी मार के चला गया!",
     "Universe ne mere gaal par kya contract sign kiya hai?! Ek bandar bhi maar ke chala gaya!"),
    ("10_aarav_finale", "aarav", "hi-IN-MadhurNeural", "+4%", "+0Hz", 0.15, 2.8, 0.36, True,
     "वेलकम टू कॉलेज लाइफ ब्रो! चल, गरमा-गरम समोसा खाते हैं!",
     "Welcome to college life bro! Chal, garma-garam samosa khaate hain!"),
]

async def gen_tts_and_measure():
    durs = {}
    for bid, spk, voice, rate, pitch, _, _, _, _, text_tts, _ in SCRIPT_BEATS:
        mp3_path = os.path.join(AUDIO_DIR, f"{bid}.mp3")
        wav_path = os.path.join(AUDIO_DIR, f"{bid}.wav")
        if not os.path.exists(wav_path):
            comm = edge_tts.Communicate(text_tts, voice, rate=rate, pitch=pitch)
            await comm.save(mp3_path)
            subprocess.run([
                "ffmpeg", "-y", "-v", "error", "-i", mp3_path,
                "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", wav_path
            ], check=True)
        with wave.open(wav_path, "rb") as w:
            durs[bid] = w.getnframes() / w.getframerate()
    return durs

def read_wav_mono(path):
    with wave.open(path, "rb") as w:
        n = w.getnframes()
        raw = w.readframes(n)
    return [s / 32768.0 for s in struct.unpack(f"<{n}h", raw)]

def add_slap_sfx(buf, t_sec, pitch_mult=1.0):
    rng = random.Random(int(t_sec * 100))
    i0 = int(t_sec * SR)
    dur_s = 0.24
    n = int(dur_s * SR)
    for k in range(n):
        idx = i0 + k
        if idx >= len(buf): break
        t = k / SR
        crack = rng.uniform(-1.0, 1.0) * math.exp(-t * 48.0) * 0.72
        thump = math.sin(2 * math.pi * (145 * pitch_mult * math.exp(-t * 14)) * t) * math.exp(-t * 25.0) * 0.55
        buf[idx] += crack + thump

def add_note(buf, start_s, dur_s, freq, amp=0.12, wave_type="pluck"):
    i0 = int(start_s * SR)
    n = int(dur_s * SR)
    for k in range(n):
        idx = i0 + k
        if idx >= len(buf): break
        t = k / SR
        env = math.exp(-t * (5.5 if wave_type == "pluck" else 3.0))
        if wave_type == "bass":
            val = math.sin(2 * math.pi * freq * t) + 0.35 * math.sin(4 * math.pi * freq * t)
        else:
            val = (math.sin(2 * math.pi * freq * t) +
                   0.45 * math.sin(4 * math.pi * freq * t) +
                   0.2 * math.sin(6 * math.pi * freq * t))
        buf[idx] += val * amp * env

def add_audience_laugh(buf, start_s, dur_s, intensity=0.25, with_applause=False):
    rng = random.Random(int(start_s * 100))
    i0 = int(start_s * SR)
    n = int(dur_s * SR)
    voices = [(rng.uniform(165, 360), rng.uniform(5.0, 7.3), rng.uniform(0, 6.28), rng.uniform(0.03, 0.22)) for _ in range(15)]
    prev_lp = 0.0
    for k in range(n):
        idx = i0 + k
        if idx >= len(buf): break
        t = k / SR
        env = min(1.0, t / 0.16) * min(1.0, max(0.0, (dur_s - t) / 0.50))
        s = 0.0
        for f0, rate, ph, dly in voices:
            if t < dly: continue
            syl = max(0.0, math.sin(2 * math.pi * rate * (t - dly) + ph)) ** 1.6
            s += math.sin(2 * math.pi * f0 * (1.0 - 0.16 * (t / dur_s)) * t + ph) * syl * 0.08
        noise = rng.uniform(-1.0, 1.0)
        if with_applause:
            s += noise * (0.14 + 0.16 * (0.5 + 0.5 * math.sin(2 * math.pi * 8.5 * t)))
        else:
            s += noise * 0.08
        prev_lp = prev_lp * 0.72 + s * 0.28
        buf[idx] += prev_lp * intensity * env

def build_all():
    durs = asyncio.run(gen_tts_and_measure())

    # Compute exact zero-overlap timeline automatically!
    cursor = 0.0
    timeline = []
    slap_events = []

    for idx, (bid, spk, _, _, _, gap_before, laugh_after, laugh_int, applause, _, sub) in enumerate(SCRIPT_BEATS):
        # Slap 1 triggers right before 02_rohan_slap1
        if bid == "02_rohan_slap1":
            slap_events.append(("slap1_accident", cursor + 0.15))
        # Slap 2 triggers right before 05_senior_oops (right as Senior finishes yelling)
        elif bid == "05_senior_oops":
            slap_events.append(("slap2_senior", cursor + 0.12))
        # Slap 3 triggers right before 07_aarav_door (Canteen Door WHACK!)
        elif bid == "07_aarav_door":
            slap_events.append(("slap3_door", cursor + 0.20))
        # Slap 4 triggers right before 09_rohan_curse (Monkey WHACK!)
        elif bid == "09_rohan_curse":
            slap_events.append(("slap4_monkey", cursor + 0.20))

        start = round(cursor + gap_before, 3)
        dur = round(durs[bid], 3)
        end = round(start + dur, 3)
        laugh_start = round(end + 0.08, 3) if laugh_after > 0 else None
        laugh_end = round(laugh_start + laugh_after, 3) if laugh_after > 0 else None

        timeline.append({
            "id": bid, "speaker": spk, "start": start, "end": end, "dur": dur,
            "laugh_start": laugh_start, "laugh_end": laugh_end,
            "laugh_int": laugh_int, "applause": applause, "subtitle": sub
        })
        cursor = end + (laugh_after if laugh_after > 0 else 0.05)

    outro_start = round(cursor + 0.2, 3)
    total_dur = round(outro_start + 3.8, 2)
    total_samples = int(total_dur * SR)

    print("=== COMPUTED HINGLISH EPISODE TIMELINE ===")
    for item in timeline:
        print(f"  {item['id']:18s} [{item['speaker']:6s}] {item['start']:5.2f}s -> {item['end']:5.2f}s | laugh={item['laugh_start']}..{item['laugh_end']}")
    print("Slaps:", slap_events)
    print(f"Outro: {outro_start:.2f}s -> {total_dur:.2f}s")

    aarav_buf = [0.0] * total_samples
    rohan_buf = [0.0] * total_samples
    senior_buf = [0.0] * total_samples
    sfx_buf = [0.0] * total_samples
    music_buf = [0.0] * total_samples
    laugh_buf = [0.0] * total_samples

    for item in timeline:
        samples = read_wav_mono(os.path.join(AUDIO_DIR, f"{item['id']}.wav"))
        i0 = int(item["start"] * SR)
        tgt = aarav_buf if item["speaker"] == "aarav" else (rohan_buf if item["speaker"] == "rohan" else senior_buf)
        for k, val in enumerate(samples):
            if i0 + k < total_samples:
                tgt[i0 + k] += val
        if item["laugh_start"] is not None:
            add_audience_laugh(laugh_buf, item["laugh_start"], item["laugh_end"] - item["laugh_start"], item["laugh_int"], item["applause"])

    for sname, ts in slap_events:
        add_slap_sfx(sfx_buf, ts, pitch_mult=(0.8 if "door" in sname else (1.2 if "monkey" in sname else 1.0)))

    # Upbeat Friends/College Acoustic-Funk Intro (0.0 - 3.0s) & Outro (outro_start - total_dur)
    intro_chords = [
        (0.00, [261.63, 329.63, 392.00, 523.25]),
        (0.55, [392.00, 493.88, 587.33]),
        (1.10, [293.66, 369.99, 440.00, 587.33]),
        (1.65, [220.00, 261.63, 329.63, 440.00]),
        (2.20, [261.63, 392.00, 523.25]),
    ]
    for st, freqs in intro_chords:
        for j, f in enumerate(freqs):
            add_note(music_buf, st + j * 0.04, 0.55, f, amp=0.11, wave_type="pluck")
        add_note(music_buf, st, 0.4, freqs[0] / 2.0, amp=0.16, wave_type="bass")

    # Gentle peppy college campus bass groove during non-laugh dialogue stretches
    t = 3.1
    idx = 0
    groove_notes = [130.81, 146.83, 164.81, 196.00]
    while t < outro_start - 0.5:
        in_laugh = any(it["laugh_start"] and it["laugh_start"] - 0.4 <= t <= it["laugh_end"] for it in timeline)
        in_slap = any(abs(t - ts) < 0.45 for _, ts in slap_events)
        if not in_laugh and not in_slap:
            add_note(music_buf, t, 0.30, groove_notes[idx % len(groove_notes)], amp=0.055, wave_type="bass")
        t += 0.44
        idx += 1

    # Outro stinger
    for j, (dt, freqs) in enumerate([(0.0, [261.63, 329.63, 392.00]), (0.5, [293.66, 349.23, 440.00]), (1.0, [392.00, 493.88, 587.33]), (1.55, [261.63, 392.00, 523.25, 659.25])]):
        for k, f in enumerate(freqs):
            add_note(music_buf, outro_start + dt + k * 0.03, 0.75, f, amp=0.12, wave_type="pluck")
        add_note(music_buf, outro_start + dt, 0.45, freqs[0] / 2.0, amp=0.17, wave_type="bass")

    master_path = os.path.join(BASE_DIR, "master_audio.wav")
    raw_bytes = bytearray()
    for i in range(total_samples):
        s = aarav_buf[i] * 0.95 + rohan_buf[i] * 0.95 + senior_buf[i] * 0.95 + sfx_buf[i] + music_buf[i] + laugh_buf[i]
        s = max(-0.98, min(0.98, s))
        raw_bytes.extend(struct.pack("<h", int(s * 32767)))

    with wave.open(master_path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(raw_bytes)

    fps = 30
    total_frames = int(total_dur * fps)
    hop = SR // fps

    def calc_env(buf):
        return [round(math.sqrt(sum(x * x for x in buf[f * hop : (f + 1) * hop]) / max(1, hop)), 4) for f in range(total_frames)]

    meta = {
        "total_dur": total_dur,
        "total_frames": total_frames,
        "outro_start": outro_start,
        "timeline": timeline,
        "slap_events": slap_events
    }
    with open(os.path.join(BASE_DIR, "timeline_meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    with open(os.path.join(BASE_DIR, "audio_envelope.js"), "w", encoding="utf-8") as f:
        f.write(f"window.TIMELINE_META = {json.dumps(meta)};\n")
        f.write(f"window.AARAV_ENVELOPE = {json.dumps(calc_env(aarav_buf))};\n")
        f.write(f"window.ROHAN_ENVELOPE = {json.dumps(calc_env(rohan_buf))};\n")
        f.write(f"window.SENIOR_ENVELOPE = {json.dumps(calc_env(senior_buf))};\n")

    print(f"Master audio written: {master_path} ({total_dur}s, {total_frames} frames)")

if __name__ == "__main__":
    build_all()
