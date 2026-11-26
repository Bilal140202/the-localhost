// V•A•U•L•T  Z•E•R•O — 16:9 Widescreen 3D Action/Heist Sitcom Engine
// Hybrid Continuous Dolly + Multi-Cam Punchline Cuts, Isolated Lip-Sync & Laugh Pauses

(function(root) {
  const VaultZero3D = {};

  VaultZero3D.init = function(canvas, width, height) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b12);
    scene.fog = new THREE.FogExp2(0x070b12, 0.032);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 7.0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // --- LIGHTING (Secret Underground Lab) ---
    scene.add(new THREE.HemisphereLight(0xcbe7ff, 0x111827, 0.95));

    const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.8);
    keyLight.position.set(4.0, 7.0, 5.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimCyan = new THREE.DirectionalLight(0x00f0ff, 1.2);
    rimCyan.position.set(-5.0, 4.0, -3.5);
    scene.add(rimCyan);

    const vaultGlow = new THREE.PointLight(0x22c55e, 2.0, 8);
    vaultGlow.position.set(0.3, 1.6, -1.6);
    scene.add(vaultGlow);

    const laserLight = new THREE.PointLight(0xff1133, 1.8, 7);
    laserLight.position.set(0.2, 1.2, 1.3);
    scene.add(laserLight);

    // --- SECRET UNDERGROUND LAB ENVIRONMENT ---
    const lab = new THREE.Group();

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.25, metalness: 0.5 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    lab.add(floor);

    const grid = new THREE.GridHelper(20, 40, 0x0ea5e9, 0x172030);
    grid.position.y = 0.01;
    lab.add(grid);

    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 8),
      new THREE.MeshStandardMaterial({ color: 0x0b101b, roughness: 0.85, metalness: 0.2 })
    );
    backWall.position.set(0, 4, -3.5);
    backWall.receiveShadow = true;
    lab.add(backWall);

    // Flanking Containment Pods
    [-2.8, 2.8].forEach(px => {
      const pod = new THREE.Group();
      pod.position.set(px, 0, -2.5);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.62, 0.35, 20),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 })
      );
      base.position.y = 0.175;
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 2.2, 20),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8, transparent: true, opacity: 0.25,
          emissive: 0x0284c7, emissiveIntensity: 0.5, roughness: 0.1
        })
      );
      glass.position.y = 1.45;
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.25, 20),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 })
      );
      cap.position.y = 2.65;
      pod.add(base, glass, cap);
      lab.add(pod);
    });

    // Pressurized Bio-Vault (Center-Back)
    const bioVault = new THREE.Group();
    bioVault.position.set(0.3, 0, -1.8);

    const vaultFrame = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.95, 2.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 })
    );
    vaultFrame.position.y = 1.25;
    vaultFrame.position.z = -0.35;
    vaultFrame.castShadow = true;
    bioVault.add(vaultFrame);

    const vaultPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.48, 0.95, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })
    );
    vaultPedestal.position.set(0, 0.475, 0.1);
    bioVault.add(vaultPedestal);

    // The "Classified Core": Glowing Artisanal Sourdough Starter Jar + DO NOT EAT label!
    const sourdoughJar = new THREE.Group();
    sourdoughJar.position.set(0, 1.12, 0.1);
    const jarGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.28, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfef3c7, transparent: true, opacity: 0.85,
        emissive: 0x22c55e, emissiveIntensity: 0.45, roughness: 0.15
      })
    );
    const jarLid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    jarLid.position.y = 0.16;
    const labelBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.144, 0.144, 0.09, 16),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    sourdoughJar.add(jarGlass, jarLid, labelBand);
    bioVault.add(sourdoughJar);

    // Animated Sliding Vault Door
    const vaultDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 1.9, 0.14),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a, metalness: 0.9, roughness: 0.2,
        emissive: 0x0ea5e9, emissiveIntensity: 0.15
      })
    );
    vaultDoor.position.set(0, 1.15, 0.48);
    bioVault.add(vaultDoor);
    lab.add(bioVault);

    // Holographic Security Terminal (Left)
    const terminal = new THREE.Group();
    terminal.position.set(-1.35, 0, 0.25);
    terminal.rotation.y = 0.35;
    const termStand = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 1.05, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    termStand.position.y = 0.525;
    termStand.castShadow = true;
    const termScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.44),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    termScreen.position.set(0, 1.32, 0.05);
    termScreen.rotation.x = -0.25;
    terminal.add(termStand, termScreen);
    lab.add(terminal);

    // Red Laser Grid Beams (shut off at t=8.6s when Pip hacks the password)
    const laserGroup = new THREE.Group();
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xff1133, transparent: true, opacity: 0.85 });
    [0.55, 1.05, 1.55].forEach((ly, idx) => {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 4.6, 8), laserMat);
      beam.rotation.z = Math.PI / 2 + (idx - 1) * 0.12;
      beam.position.set(0.2, ly, 1.15 + (idx % 2) * 0.2);
      laserGroup.add(beam);
    });
    lab.add(laserGroup);
    scene.add(lab);

    // --- RIGGED 3D CHARACTERS ---
    const loader = new THREE.GLTFLoader();
    function loadGLB(url) {
      return new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
    }

    let vexRoot = null, vexMixer = null, vexActions = {}, vexHeadBone = null, vexVisorBar = null;
    let pipRoot = null, pipMixer = null, pipActions = {}, pipMorphMeshes = [], pipHeadBone = null;

    const ready = Promise.all([
      loadGLB('vex_soldier.glb'),
      loadGLB('pip_hacker.glb'),
      loadGLB('leo_idle.glb'),
      loadGLB('leo_talk.glb'),
      loadGLB('leo_expr.glb')
    ]).then(([vexGltf, pipGltf, idleGltf, talkGltf, exprGltf]) => {
      // 1. VEX (Veteran Spec-Ops Soldier)
      vexRoot = vexGltf.scene;
      vexRoot.position.set(0.55, 0, 0.55);
      vexRoot.rotation.y = -0.35;
      vexRoot.scale.setScalar(0.95);
      vexRoot.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
        if (obj.isBone && obj.name === 'mixamorig:Head') {
          vexHeadBone = obj;
        }
      });
      scene.add(vexRoot);

      // Glowing tactical HUD voice-modulator bar on Vex's helmet visor
      if (vexHeadBone) {
        vexVisorBar = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, 0.014, 0.02),
          new THREE.MeshBasicMaterial({ color: 0x00f0ff })
        );
        vexVisorBar.position.set(0, 0.06, 0.145);
        vexHeadBone.add(vexVisorBar);
      }

      vexMixer = new THREE.AnimationMixer(vexRoot);
      vexGltf.animations.forEach(clip => {
        const act = vexMixer.clipAction(clip);
        vexActions[clip.name] = act;
        act.play();
        act.setEffectiveWeight(clip.name === 'Idle' ? 1.0 : 0.0);
      });

      // 2. PIP (Nervous Tech Hacker with Sculpted Lip-Sync Morphs)
      pipRoot = pipGltf.scene;
      pipRoot.position.set(-1.15, 0, -0.15);
      pipRoot.rotation.y = 0.55;
      pipRoot.scale.setScalar(0.95);
      let pipLeftHand = null;
      pipRoot.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          if (obj.morphTargetDictionary && obj.morphTargetInfluences) {
            pipMorphMeshes.push(obj);
          }
        }
        if (obj.isBone) {
          if (obj.name === 'Head') pipHeadBone = obj;
          if (obj.name === 'LeftHand') pipLeftHand = obj;
        }
      });
      scene.add(pipRoot);

      // Cyber glasses on Pip's Head bone
      if (pipHeadBone) {
        const gGroup = new THREE.Group();
        gGroup.position.set(0, 0.088, 0.112);
        const fMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3, metalness: 0.6 });
        const lMat = new THREE.MeshStandardMaterial({ color: 0x34d399, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
        [-0.034, 0.034].forEach(xp => {
          const ring = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.032, 0.006), fMat);
          ring.position.x = xp;
          const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.036, 0.024), lMat);
          lens.position.set(xp, 0, 0.004);
          gGroup.add(ring, lens);
        });
        pipHeadBone.add(gGroup);
      }

      // Glowing holo-tablet in Pip's LeftHand
      if (pipLeftHand) {
        const tablet = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.015, 0.24),
          new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        tablet.position.set(0, 0.05, 0.08);
        pipLeftHand.add(tablet);
      }

      pipMixer = new THREE.AnimationMixer(pipRoot);
      if (idleGltf.animations.length) { pipActions.idle = pipMixer.clipAction(idleGltf.animations[0]); pipActions.idle.play(); }
      if (talkGltf.animations.length) { pipActions.talk = pipMixer.clipAction(talkGltf.animations[0]); pipActions.talk.play(); }
      if (exprGltf.animations.length) { pipActions.expr = pipMixer.clipAction(exprGltf.animations[0]); pipActions.expr.play(); }
    });

    function setBlendedWeights(actionsMap, prevName, nextName, p) {
      Object.keys(actionsMap).forEach(name => {
        const act = actionsMap[name];
        if (!act) return;
        if (prevName === nextName) act.setEffectiveWeight(name === nextName ? 1.0 : 0.0);
        else if (name === nextName) act.setEffectiveWeight(p);
        else if (name === prevName) act.setEffectiveWeight(1.0 - p);
        else act.setEffectiveWeight(0.0);
      });
    }

    function setMorph(meshes, names, val) {
      meshes.forEach(m => names.forEach(n => {
        const idx = m.morphTargetDictionary[n];
        if (idx !== undefined) m.morphTargetInfluences[idx] = val;
      }));
    }

    function getSmoothedAmp(env, time) {
      if (!env || !env.length) return 0;
      const f = time * 30;
      const i0 = Math.min(env.length - 1, Math.max(0, Math.floor(f) - 1));
      const i1 = Math.min(env.length - 1, Math.max(0, Math.floor(f)));
      const i2 = Math.min(env.length - 1, Math.max(0, Math.floor(f) + 1));
      return (env[i0] * 0.25 + env[i1] * 0.5 + env[i2] * 0.25);
    }

    function lerp(a, b, t) { return a + (b - a) * t; }
    function smoothstep(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

    VaultZero3D.cameraMode = 'director';
    VaultZero3D.setCameraMode = function(mode) { VaultZero3D.cameraMode = mode; };

    // --- 45.0s DIRECTOR CUT TIMELINE ---
    VaultZero3D.updateFrame = function(time) {
      const vexAmp = getSmoothedAmp(root.VEX_ENVELOPE, time);
      const pipAmp = getSmoothedAmp(root.PIP_ENVELOPE, time);
      const vexLip = Math.min(1.0, Math.max(0.0, (vexAmp - 0.012) * 4.5));
      const pipLip = Math.min(1.0, Math.max(0.0, (pipAmp - 0.012) * 4.5));

      // Lasers shut off at 8.6s
      const lasersOn = time < 8.6;
      laserGroup.visible = lasersOn;
      laserLight.intensity = lasersOn ? (1.5 + Math.sin(time * 12) * 0.3) : 0.0;

      // Bio-vault door slides open at 22.0s
      const doorOpenP = smoothstep((time - 22.0) / 1.1);
      vaultDoor.position.x = doorOpenP * 1.15;
      vaultGlow.intensity = 1.2 + doorOpenP * 2.2;
      sourdoughJar.rotation.y = time * 0.8;

      // Character states & laugh-pause freezes (characters NEVER talk over audience laughs!)
      let vexState = 'Idle', vexPrev = 'Idle', vexBlend = 1.0;
      let pipState = 'idle', pipPrev = 'idle', pipBlend = 1.0;
      let pipBrow = 0.2;

      if (time < 3.0) {
        vexState = 'Walk'; vexPrev = 'Walk';
        if (vexRoot) vexRoot.position.set(0.55, 0, lerp(1.6, 0.55, smoothstep(time / 2.8)));
      } else if (time < 7.9) {
        if (vexRoot) vexRoot.position.set(0.55, 0, 0.55);
        vexState = 'Idle'; vexPrev = 'Walk'; vexBlend = Math.min(1.0, (time - 3.0) / 0.3);
        pipState = 'idle';
      } else if (time < 8.6) {
        pipState = 'expr'; pipPrev = 'idle'; pipBlend = Math.min(1.0, (time - 7.9) / 0.3);
        pipBrow = 0.6;
      } else if (time < 16.0) {
        pipState = 'talk'; pipPrev = 'expr'; pipBlend = Math.min(1.0, (time - 8.6) / 0.3);
        pipBrow = 0.4;
      } else if (time < 17.5) {
        // LAUGH PAUSE 1 (16.0 - 17.5s)
        pipState = 'idle'; pipPrev = 'talk'; pipBlend = Math.min(1.0, (time - 16.0) / 0.25);
        pipBrow = 0.1;
      } else if (time < 22.0) {
        pipState = 'idle';
        pipBrow = 0.3;
      } else if (time < 23.2) {
        // Vault opens!
        vexState = 'Walk'; vexPrev = 'Idle'; vexBlend = Math.min(1.0, (time - 22.0) / 0.3);
        if (vexRoot) vexRoot.position.set(lerp(0.55, 0.35, smoothstep((time - 22.0) / 1.1)), 0, lerp(0.55, -0.65, smoothstep((time - 22.0) / 1.1)));
      } else if (time < 28.6) {
        if (vexRoot) vexRoot.position.set(0.35, 0, -0.65);
        vexState = 'Idle'; vexPrev = 'Walk'; vexBlend = Math.min(1.0, (time - 23.2) / 0.3);
        pipState = 'expr'; pipPrev = 'idle'; pipBlend = Math.min(1.0, (time - 23.2) / 0.3);
        pipBrow = 0.85;
      } else if (time < 30.4) {
        // LAUGH PAUSE 2 (28.6 - 30.4s)
        pipState = 'idle'; pipPrev = 'expr'; pipBlend = Math.min(1.0, (time - 28.6) / 0.25);
      } else if (time < 35.75) {
        pipState = 'idle';
        pipBrow = 0.4;
      } else if (time < 37.35) {
        // LAUGH PAUSE 3 (35.75 - 37.35s)
        pipState = 'idle';
      } else if (time < 43.65) {
        pipState = 'talk'; pipPrev = 'idle'; pipBlend = Math.min(1.0, (time - 37.35) / 0.25);
        pipBrow = 0.0;
      } else {
        // LAUGH PAUSE 4 + APPLAUSE + OUTRO (43.65 - 50.0s)
        pipState = 'idle'; pipPrev = 'talk'; pipBlend = Math.min(1.0, (time - 43.65) / 0.3);
      }

      if (vexMixer) {
        setBlendedWeights(vexActions, vexPrev, vexState, vexBlend);
        vexMixer.setTime(time);
        if (vexRoot) {
          if (time >= 43.65) vexRoot.rotation.y = lerp(-0.35, 0.05, smoothstep((time - 43.65) / 0.4));
          else if (time >= 16.0 && time < 22.0) vexRoot.rotation.y = -0.95;
          else if (time >= 22.0 && time < 30.4) vexRoot.rotation.y = Math.PI;
          else vexRoot.rotation.y = -0.35;
        }
        if (vexVisorBar) {
          vexVisorBar.scale.set(1.0, 0.5 + vexLip * 3.5, 1.0);
          vexVisorBar.material.color.setHex(vexLip > 0.1 ? 0x00ffff : 0x0284c7);
        }
        if (vexHeadBone) {
          vexHeadBone.rotation.x += vexLip * 0.06;
        }
      }

      if (pipMixer) {
        setBlendedWeights(pipActions, pipPrev, pipState, pipBlend);
        pipMixer.setTime(time);
        const blinkCycle = time % 3.2;
        const blinkVal = (blinkCycle > 3.05 && blinkCycle < 3.17) ? 1.0 : 0.0;
        setMorph(pipMorphMeshes, ['eyeBlink'], blinkVal);
        setMorph(pipMorphMeshes, ['jawOpen'], pipLip * 0.95);
        setMorph(pipMorphMeshes, ['browAngry'], pipBrow);
        if (pipHeadBone) {
          pipHeadBone.rotation.x += pipLip * 0.05;
        }
      }

      // --- HYBRID SITCOM DOLLY + PUNCHLINE CUTS CAMERA ---
      if (VaultZero3D.cameraMode === 'director') {
        if (time < 8.6) {
          const p = smoothstep(time / 8.6);
          camera.position.set(lerp(1.4, -0.1, p), lerp(2.6, 1.55, p), lerp(6.4, 3.8, p));
          camera.lookAt(lerp(0.2, -0.2, p), 1.25, 0.1);
        } else if (time < 16.0) {
          const p = smoothstep((time - 8.6) / 7.4);
          camera.position.set(lerp(-0.45, -0.58, p), 1.54, lerp(1.55, 1.35, p));
          camera.lookAt(-1.15, 1.48, -0.15);
        } else if (time < 17.5) {
          camera.position.set(-0.25, 1.58, 1.45);
          camera.lookAt(0.55, 1.48, 0.55);
        } else if (time < 22.0) {
          const p = (time - 17.5) / 4.5;
          camera.position.set(lerp(-0.25, -0.15, p), 1.58, lerp(1.45, 1.28, p));
          camera.lookAt(0.55, 1.48, 0.55);
        } else if (time < 28.6) {
          const p = smoothstep((time - 22.0) / 6.6);
          camera.position.set(lerp(-0.6, 0.15, p), 1.62, lerp(2.2, 1.4, p));
          camera.lookAt(0.3, 1.15, -1.7);
        } else if (time < 30.4) {
          camera.position.set(0.3, 1.25, -0.65);
          camera.lookAt(0.3, 1.12, -1.7);
        } else if (time < 35.75) {
          const p = (time - 30.4) / 5.35;
          camera.position.set(lerp(-0.3, 0.0, p), 1.55, 1.8);
          camera.lookAt(0.1, 1.35, -0.6);
        } else if (time < 43.65) {
          const p = (time - 35.75) / 7.9;
          camera.position.set(-0.55, 1.52, lerp(1.45, 1.25, p));
          camera.lookAt(-1.15, 1.48, -0.15);
        } else if (time < 46.0) {
          camera.position.set(0.45, 1.56, 1.65);
          camera.lookAt(0.55, 1.48, 0.55);
        } else {
          const p = smoothstep((time - 46.0) / 4.0);
          camera.position.set(0.0, lerp(1.6, 2.8, p), lerp(3.4, 6.8, p));
          camera.lookAt(0.0, 1.2, -0.5);
        }
      }

      renderer.render(scene, camera);
    };

    VaultZero3D.ready = ready;
    VaultZero3D.camera = camera;
    VaultZero3D.scene = scene;
    VaultZero3D.renderer = renderer;
    return VaultZero3D;
  };

  root.VaultZero3D = VaultZero3D;
})(typeof window !== 'undefined' ? window : this);
