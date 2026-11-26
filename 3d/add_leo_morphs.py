import json
import struct
import math
import os

GLB_PATH = r"D:\project\New folder\the-localhost\3d\leo_model.glb"

def add_morphs():
    with open(GLB_PATH, "rb") as f:
        magic, version, total_len = struct.unpack("<3I", f.read(12))
        assert magic == 0x46546C67, "Not a valid GLB"
        json_len, json_type = struct.unpack("<2I", f.read(8))
        gltf = json.loads(f.read(json_len).decode("utf-8"))
        bin_len, bin_type = struct.unpack("<2I", f.read(8))
        bin_data = bytearray(f.read(bin_len))

    prim = gltf["meshes"][0]["primitives"][0]
    pos_acc_idx = prim["attributes"]["POSITION"]
    pos_acc = gltf["accessors"][pos_acc_idx]
    pos_bv = gltf["bufferViews"][pos_acc["bufferView"]]
    pos_off = pos_bv.get("byteOffset", 0) + pos_acc.get("byteOffset", 0)
    count = pos_acc["count"]

    verts = [struct.unpack_from("<3f", bin_data, pos_off + i * 12) for i in range(count)]

    # Build 3 sculpted morph target delta arrays
    jaw_deltas = []
    blink_deltas = []
    brow_deltas = []

    for x, y, z in verts:
        # 1. jawOpen: mouth slit ~ y=1.648, chin ~ y=1.57, front z > 0.045, |x| < 0.065
        dx, dy, dz = 0.0, 0.0, 0.0
        if 1.54 <= y <= 1.662 and abs(x) < 0.070 and z > 0.045:
            # Lower lip & chin move down; upper lip (~1.652..1.662) lifts slightly
            if y >= 1.650:
                wx = max(0.0, 1.0 - abs(x) / 0.038)
                wz = max(0.0, min(1.0, (z - 0.09) / 0.035))
                dy = 0.0045 * wx * wz
            else:
                # Smooth bell across mouth width and vertical jaw hinge
                wx = max(0.0, 1.0 - (abs(x) / 0.065) ** 1.6)
                wy = 1.0 if y >= 1.585 else max(0.0, (y - 1.54) / 0.045)
                wz = max(0.0, min(1.0, (z - 0.045) / 0.055))
                w = wx * wy * wz
                dy = -0.028 * w
                dz = -0.007 * w
        jaw_deltas.append((dx, dy, dz))

        # 2. eyeBlink: upper eyelids around y=1.720..1.738, 0.013 < |x| < 0.052, z > 0.092
        bx, by, bz = 0.0, 0.0, 0.0
        if 1.720 <= y <= 1.739 and 0.013 <= abs(x) <= 0.052 and z > 0.092:
            wx = math.sin(min(1.0, max(0.0, (abs(x) - 0.013) / 0.039)) * math.pi)
            wy = max(0.0, (y - 1.720) / 0.019)
            by = -0.011 * wx * wy
        blink_deltas.append((bx, by, bz))

        # 3. browAngry: inner/mid brows around y=1.742..1.765, |x| < 0.055, z > 0.095
        rx, ry, rz = 0.0, 0.0, 0.0
        if 1.742 <= y <= 1.766 and abs(x) < 0.055 and z > 0.095:
            wx = max(0.0, 1.0 - abs(x) / 0.055)
            ry = -0.009 * wx
            rx = (-0.003 if x > 0 else 0.003) * wx
        brow_deltas.append((rx, ry, rz))

    # Align bin_data to 4 bytes
    while len(bin_data) % 4 != 0:
        bin_data.append(0)

    def append_target(deltas):
        offset = len(bin_data)
        min_v = [min(d[i] for d in deltas) for i in range(3)]
        max_v = [max(d[i] for d in deltas) for i in range(3)]
        for dx, dy, dz in deltas:
            bin_data.extend(struct.pack("<3f", dx, dy, dz))
        bv_idx = len(gltf["bufferViews"])
        gltf["bufferViews"].append({
            "buffer": 0,
            "byteOffset": offset,
            "byteLength": count * 12,
            "target": 34962
        })
        acc_idx = len(gltf["accessors"])
        gltf["accessors"].append({
            "bufferView": bv_idx,
            "byteOffset": 0,
            "componentType": 5126,
            "count": count,
            "type": "VEC3",
            "min": min_v,
            "max": max_v
        })
        return {"POSITION": acc_idx}

    prim["targets"] = [
        append_target(jaw_deltas),
        append_target(blink_deltas),
        append_target(brow_deltas),
    ]
    gltf["meshes"][0].setdefault("extras", {})["targetNames"] = ["jawOpen", "eyeBlink", "browAngry"]
    gltf["buffers"][0]["byteLength"] = len(bin_data)

    json_bytes = bytearray(json.dumps(gltf, separators=(",", ":")).encode("utf-8"))
    while len(json_bytes) % 4 != 0:
        json_bytes.extend(b" ")
    while len(bin_data) % 4 != 0:
        bin_data.append(0)

    new_total = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
    with open(GLB_PATH, "wb") as f:
        f.write(struct.pack("<3I", 0x46546C67, 2, new_total))
        f.write(struct.pack("<2I", len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack("<2I", len(bin_data), 0x004E4942))
        f.write(bin_data)

    print(f"Injected 3 morph targets into {GLB_PATH} ({new_total / 1024:.1f} KB)")

if __name__ == "__main__":
    add_morphs()
