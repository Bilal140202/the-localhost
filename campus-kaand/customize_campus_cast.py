import io
import json
import os
import struct
from PIL import Image, ImageDraw

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def customize_character(filename, shirt_rgb, hair_tint=None, accent_rgb=(255, 255, 255)):
    path = os.path.join(BASE_DIR, filename)
    with open(path, "rb") as f:
        magic, version, total_len = struct.unpack("<3I", f.read(12))
        jl, jt = struct.unpack("<2I", f.read(8))
        gltf = json.loads(f.read(jl).decode("utf-8"))
        bl, bt = struct.unpack("<2I", f.read(8))
        bin_data = bytearray(f.read(bl))

    img_info = gltf["images"][1]
    bv = gltf["bufferViews"][img_info["bufferView"]]
    off = bv.get("byteOffset", 0)
    length = bv["byteLength"]

    im = Image.open(io.BytesIO(bin_data[off : off + length])).convert("RGBA")
    px = im.load()

    # Recolor shirt region (x: 0..512, y: 512..820) preserving shading luminance!
    sr, sg, sb = shirt_rgb
    for y in range(512, 825):
        for x in range(0, 512):
            r, g, b, a = px[x, y]
            # Replace dark navy/black shirt base and old cyan pixels
            is_cyan = (b > 140 and r < 80)
            is_dark_shirt = (r < 95 and g < 95 and b < 115)
            if is_cyan:
                px[x, y] = (accent_rgb[0], accent_rgb[1], accent_rgb[2], a)
            elif is_dark_shirt:
                lum = max(0.25, (r * 0.3 + g * 0.5 + b * 0.2) / 55.0)
                nr = min(255, int(sr * lum))
                ng = min(255, int(sg * lum))
                nb = min(255, int(sb * lum))
                px[x, y] = (nr, ng, nb, a)

    # Optional hair tint (top-left hair swatch x: 0..512, y: 0..260 where brownish pixels live)
    if hair_tint is not None:
        hr, hg, hb = hair_tint
        for y in range(0, 260):
            for x in range(0, 512):
                r, g, b, a = px[x, y]
                if r < 90 and g < 75 and b < 60:
                    lum = max(0.3, (r + g + b) / 90.0)
                    px[x, y] = (min(255, int(hr * lum)), min(255, int(hg * lum)), min(255, int(hb * lum)), a)

    out_png = io.BytesIO()
    im.save(out_png, format="PNG", optimize=True)
    new_bytes = out_png.getvalue()

    # Replace buffer cleanly by appending new image slice and updating bufferView
    while len(bin_data) % 4 != 0:
        bin_data.append(0)
    new_off = len(bin_data)
    bin_data.extend(new_bytes)
    bv["byteOffset"] = new_off
    bv["byteLength"] = len(new_bytes)
    gltf["buffers"][0]["byteLength"] = len(bin_data)

    json_bytes = bytearray(json.dumps(gltf, separators=(",", ":")).encode("utf-8"))
    while len(json_bytes) % 4 != 0:
        json_bytes.extend(b" ")
    while len(bin_data) % 4 != 0:
        bin_data.append(0)

    new_total = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
    with open(path, "wb") as f:
        f.write(struct.pack("<3I", 0x46546C67, 2, new_total))
        f.write(struct.pack("<2I", len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack("<2I", len(bin_data), 0x004E4942))
        f.write(bin_data)
    print(f"Customized {filename}: shirt={shirt_rgb}, size={new_total/1024:.1f} KB")

if __name__ == "__main__":
    customize_character("aarav.glb", shirt_rgb=(215, 145, 20), hair_tint=(35, 22, 12), accent_rgb=(255, 255, 255))
    customize_character("rohan.glb", shirt_rgb=(35, 110, 215), hair_tint=(55, 35, 20), accent_rgb=(250, 204, 21))
    customize_character("senior.glb", shirt_rgb=(160, 25, 35), hair_tint=(18, 18, 22), accent_rgb=(255, 255, 255))
