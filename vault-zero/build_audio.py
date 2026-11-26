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
TOTAL_DUR = 50.0
TOTAL_SAMPLES = int(TOTAL_DUR * SR)

LINES = [
    # (id, speaker, voice, rate, pitch, start_sec, text)
    ("line1_vex", "vex", "en-US-AndrewNeural", "-5%", "-6Hz", 3.00,
     "Lasers are live, Pip. Tell me you bypassed the biometric firewall."),
    ("line2_pip", "pip", "en-US-EricNeural", "+10%", "+14Hz", 8.60,
     "I bypassed it! Okay, technically I guessed the password. It was Password one two three."),
    ("line3_vex", "vex", "en-US-AndrewNeural", "-5%", "-6Hz", 17.50,
     "A top-secret subterranean bio-vault uses Password one two three."),
    ("line4_pip", "pip", "en-US-EricNeural", "+10%", "+14Hz", 23.20,
     "Wait... why is the classified bio-core in a Tupperware container labeled DO NOT EAT?"),
    ("line5_vex", "vex", "en-US-AndrewNeural", "-5%", "-6Hz", 30.40,
     "We just dodged forty-two thermal lasers... for the Director's artisanal sourdough starter."),
    ("line6_pip", "pip", "en-US-EricNeural", "+10%", "+14Hz", 37.35,
     "To be fair, it smells incredible. Do we grab the butter, or trigger the self-destruct?"),
]

async def gen_tts():
    for lid, spk, voice, rate, pitch, start, text in LINES:
        mp3_path = os.path.join(AUDIO_DIR, f"{lid}.mp3")
        wav_path = os.path.join(AUDIO_DIR, f"{lid}.wav")
        if not os.path.exists(wav_path):
            comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            await comm.save(mp3_path)
            subprocess.run([
                "ffmpeg", "-y", "-v", "error", "-i", mp3_path,
                "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", wav_path
            ], check=True)
        with wave.open(wav_path, "rb") as w:
            dur = w.getnframes() / w.getframerate()
        print(f"  [{lid}] start={start:.2f}s dur={dur:.2f}s end={start+dur:.2f}s")

def read_wav_mono(path):
    with wave.open(path, "rb") as w:
        n = w.getnframes()
        raw = w.readframes(n)
    return [s / 32768.0 for s in struct.unpack(f"<{n}h", raw)]

def add_note(buf, start_s, dur_s, freq, amp=0.15, wave_type="pluck"):
    i0 = int(start_s * SR)
    n = int(dur_s * SR)
    for k in range(n):
        idx = i0 + k
        if idx >= len(buf):
            break
        t = k / SR
        env = math.exp(-t * (6.0 if wave_type == "pluck" else 3.0))
        if wave_type == "bass":
            val = math.sin(2 * math.pi * freq * t) + 0.35 * math.sin(4 * math.pi * freq * t)
        elif wave_type == "pluck":
            val = (math.sin(2 * math.pi * freq * t) +
                   0.5 * math.sin(4 * math.pi * freq * t) +
                   0.25 * math.sin(6 * math.pi * freq * t))
        else:
            val = math.sin(2 * math.pi * freq * t)
        buf[idx] += val * amp * env

def add_audience_laugh(buf, start_s, dur_s, intensity=0.22, with_applause=False):
    rng = random.Random(int(start_s * 100))
    i0 = int(start_s * SR)
    n = int(dur_s * SR)
    # Layer 14 distinct audience voices with syllabic "ha-ha-ha" bursts
    voices = []
    for _ in range(14):
        voices.append((
            rng.uniform(160, 360),   # base formant pitch
            rng.uniform(4.8, 7.2),   # laugh syllable rate Hz
            rng.uniform(0, 6.28),    # phase
            rng.uniform(0.05, 0.25)  # entry delay
        ))
    prev_lp = 0.0
    for k in range(n):
        idx = i0 + k
        if idx >= len(buf):
            break
        t = k / SR
        # Overall swell & tail
        attack = min(1.0, t / 0.18)
        decay = min(1.0, max(0.0, (dur_s - t) / 0.55))
        env = attack * decay

        s = 0.0
        for f0, rate, ph, dly in voices:
            if t < dly:
                continue
            syl = max(0.0, math.sin(2 * math.pi * rate * (t - dly) + ph)) ** 1.6
            pitch_drop = f0 * (1.0 - 0.18 * (t / dur_s))
            s += math.sin(2 * math.pi * pitch_drop * t + ph) * syl * 0.08
        # Add warm room breath / applause texture
        noise = rng.uniform(-1.0, 1.0)
        if with_applause:
            clap_mod = 0.5 + 0.5 * math.sin(2 * math.pi * 8.5 * t)
            s += noise * (0.14 + 0.16 * clap_mod)
        else:
            s += noise * 0.08
        # Gentle low-pass for warmth
        prev_lp = prev_lp * 0.72 + s * 0.28
        buf[idx] += prev_lp * intensity * env

def add_vault_hiss(buf, start_s, dur_s=1.1):
    rng = random.Random(42)
    i0 = int(start_s * SR)
    n = int(dur_s * SR)
    prev = 0.0
    for k in range(n):
        idx = i0 + k
        if idx >= len(buf):
            break
        t = k / SR
        env = min(1.0, t / 0.05) * math.exp(-t * 3.2)
        hiss = rng.uniform(-1.0, 1.0)
        prev = prev * 0.4 + hiss * 0.6
        buf[idx] += prev * 0.18 * env

def build_all():
    asyncio.run(gen_tts())

    vex_buf = [0.0] * TOTAL_SAMPLES
    pip_buf = [0.0] * TOTAL_SAMPLES
    music_buf = [0.0] * TOTAL_SAMPLES
    laugh_buf = [0.0] * TOTAL_SAMPLES

    # Place vocal tracks
    for lid, spk, _, _, _, start, _ in LINES:
        samples = read_wav_mono(os.path.join(AUDIO_DIR, f"{lid}.wav"))
        i0 = int(start * SR)
        target = vex_buf if spk == "vex" else pip_buf
        for k, val in enumerate(samples):
            if i0 + k < TOTAL_SAMPLES:
                target[i0 + k] += val

    # 1. Intro Friends-style Upbeat Sitcom Title Sting (0.0s - 3.0s)
    chords = [
        (0.00, [261.63, 329.63, 392.00, 523.25]), # C
        (0.55, [392.00, 493.88, 587.33]),         # G
        (1.10, [220.00, 261.63, 329.63, 440.00]), # Am
        (1.65, [174.61, 220.00, 261.63, 349.23]), # F
        (2.20, [261.63, 392.00, 523.25]),         # C resolve
    ]
    for st, freqs in chords:
        for j, f in enumerate(freqs):
            add_note(music_buf, st + j * 0.04, 0.55, f, amp=0.11, wave_type="pluck")
        add_note(music_buf, st, 0.4, freqs[0] / 2.0, amp=0.16, wave_type="bass")

    # 2. Subtle Stealth-Funk Underscore (cuts cleanly before punchline pauses!)
    bass_grooves = [
        (3.1, 7.8, [110.0, 110.0, 130.81, 146.83]),
        (8.7, 15.8, [110.0, 123.47, 130.81, 146.83]),
        (17.6, 21.8, [98.0, 110.0, 123.47, 130.81]),
        (23.3, 28.4, [110.0, 130.81, 146.83, 164.81]),
    ]
    for g_start, g_end, notes in bass_grooves:
        t = g_start
        idx = 0
        while t < g_end:
            add_note(music_buf, t, 0.32, notes[idx % len(notes)], amp=0.075, wave_type="bass")
            t += 0.42
            idx += 1

    # 3. Outro Sitcom Bass-Slap & Credits Guitar Stinger (46.0s - 50.0s)
    outro_chords = [
        (46.00, [261.63, 329.63, 392.00]),
        (46.50, [293.66, 349.23, 440.00]),
        (47.00, [392.00, 493.88, 587.33]),
        (47.55, [261.63, 392.00, 523.25, 659.25]),
    ]
    for st, freqs in outro_chords:
        for j, f in enumerate(freqs):
            add_note(music_buf, st + j * 0.03, 0.7, f, amp=0.12, wave_type="pluck")
        add_note(music_buf, st, 0.45, freqs[0] / 2.0, amp=0.17, wave_type="bass")

    # 4. Pneumatic Bio-Vault Hiss (22.0s)
    add_vault_hiss(music_buf, 22.0, 1.1)

    # 5. 3-Tier Studio Audience Laugh Track + Applause
    add_audience_laugh(laugh_buf, 16.0, 1.5, intensity=0.22, with_applause=False) # Password123 chuckle
    add_audience_laugh(laugh_buf, 28.6, 1.8, intensity=0.30, with_applause=False) # Tupperware DO NOT EAT laugh
    add_audience_laugh(laugh_buf, 35.75, 1.6, intensity=0.28, with_applause=False) # Sourdough starter laugh
    add_audience_laugh(laugh_buf, 43.65, 4.8, intensity=0.34, with_applause=True)  # Finale laugh + applause

    # Mix master_audio.wav
    master_path = os.path.join(BASE_DIR, "master_audio.wav")
    raw_bytes = bytearray()
    for i in range(TOTAL_SAMPLES):
        s = vex_buf[i] * 0.95 + pip_buf[i] * 0.95 + music_buf[i] + laugh_buf[i]
        s = max(-0.98, min(0.98, s))
        raw_bytes.extend(struct.pack("<h", int(s * 32767)))

    with wave.open(master_path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(raw_bytes)

    # Export isolated 30fps lip-sync envelopes for Vex & Pip!
    fps = 30
    total_frames = int(TOTAL_DUR * fps)
    hop = SR // fps

    def calc_env(buf):
        env = []
        for f in range(total_frames):
            seg = buf[f * hop : (f + 1) * hop]
            rms = math.sqrt(sum(x * x for x in seg) / max(1, len(seg)))
            env.append(round(rms, 4))
        return env

    vex_env = calc_env(vex_buf)
    pip_env = calc_env(pip_buf)

    env_js_path = os.path.join(BASE_DIR, "audio_envelope.js")
    with open(env_js_path, "w", encoding="utf-8") as f:
        f.write(f"window.VEX_ENVELOPE = {json.dumps(vex_env)};\n")
        f.write(f"window.PIP_ENVELOPE = {json.dumps(pip_env)};\n")

    print(f"Master audio written: {master_path} ({TOTAL_DUR}s)")
    print(f"Isolated lip-sync envelopes written: {env_js_path} ({total_frames} frames)")

if __name__ == "__main__":
    build_all()
