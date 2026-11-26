// The Localhost: 3D Sitcom Engine (Real Rigged GLB + Mocap Animations)
// Uses Three.js GLTFLoader, THREE.AnimationMixer, Morph Targets & Audio-Driven Lip-Sync

(function(root) {
  const Sitcom3D = {};

  Sitcom3D.init = function(canvas, width, height) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.03);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 5.5);

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
    renderer.toneMappingExposure = 1.1;

    // --- LIGHTING (3-Point + Cyber Neon) ---
    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x1a2234, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.8);
    keyLight.position.set(3.5, 6.5, 5.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.1);
    rimLight.position.set(-4.0, 4.0, -3.5);
    scene.add(rimLight);

    const cyanNeon = new THREE.PointLight(0x00f0ff, 1.4, 10);
    cyanNeon.position.set(-2.5, 3.2, 1.0);
    scene.add(cyanNeon);

    const purpleNeon = new THREE.PointLight(0xb026ff, 1.4, 10);
    purpleNeon.position.set(2.5, 3.2, 1.0);
    scene.add(purpleNeon);

    // --- ENVIRONMENT ---
    const room = new THREE.Group();

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshStandardMaterial({ color: 0x141822, roughness: 0.25, metalness: 0.45 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    room.add(floor);

    const gridHelper = new THREE.GridHelper(16, 32, 0x00f0ff, 0x1a2333);
    gridHelper.position.y = 0.01;
    room.add(gridHelper);

    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f131d, roughness: 0.85, metalness: 0.15 })
    );
    backWall.position.set(0, 4, -3);
    backWall.receiveShadow = true;
    room.add(backWall);

    const stripGeo = new THREE.BoxGeometry(14, 0.08, 0.05);
    const strip1 = new THREE.Mesh(stripGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    strip1.position.set(0, 5.5, -2.95);
    const strip2 = new THREE.Mesh(stripGeo, new THREE.MeshBasicMaterial({ color: 0xb026ff }));
    strip2.position.set(0, 2.8, -2.95);
    room.add(strip1, strip2);

    // Workstation Desk
    const desk = new THREE.Group();
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.1, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x1e2430, roughness: 0.4, metalness: 0.5 })
    );
    deskTop.position.set(-2.0, 1.1, -1.5);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    desk.add(deskTop);

    const mon1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.04), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    mon1.position.set(-2.2, 1.6, -1.5);
    const monScreen1 = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.56), new THREE.MeshBasicMaterial({ color: 0x00ffaa }));
    monScreen1.position.set(-2.2, 1.6, -1.47);
    desk.add(mon1, monScreen1);
    room.add(desk);
    scene.add(room);

    // --- KITCHEN SINK & OVERFLOWING TRASH (EPISODE 1 PROPS) ---
    const kitchenProp = new THREE.Group();
    kitchenProp.position.set(1.85, 0, -1.35);

    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.95, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.4, roughness: 0.5 })
    );
    counter.position.y = 0.475;
    counter.castShadow = true;
    counter.receiveShadow = true;
    kitchenProp.add(counter);

    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.46, 0.08, 1.06),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.3, roughness: 0.2 })
    );
    counterTop.position.y = 0.98;
    kitchenProp.add(counterTop);

    // Chrome sink basin & faucet
    const sinkBasin = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.04, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 })
    );
    sinkBasin.position.set(0, 1.01, 0);
    const faucet = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.02, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 })
    );
    faucet.position.set(0, 1.05, -0.2);
    kitchenProp.add(sinkBasin, faucet);

    // Overflowing trash bin beside counter with white porcelain shards
    const trashBin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.22, 0.72, 18),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 })
    );
    trashBin.position.set(-0.98, 0.36, 0.15);
    trashBin.castShadow = true;
    const trashBag = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 14, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
    );
    trashBag.position.set(-0.98, 0.72, 0.15);
    kitchenProp.add(trashBin, trashBag);

    for (let s = 0; s < 3; s++) {
      const shard = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.16, 4),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15 })
      );
      shard.position.set(-0.98 + (s - 1) * 0.08, 0.92, 0.15 + (s % 2) * 0.06);
      shard.rotation.set((s - 1) * 0.3, s * 0.7, (s - 1) * 0.4);
      kitchenProp.add(shard);
    }
    scene.add(kitchenProp);

    // Floating 3D Holographic Card (visible during Chip's optimization pitches)
    const holoGroup = new THREE.Group();
    holoGroup.position.set(0.85, 1.55, 0.15);
    const holoRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.012, 12, 36),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75 })
    );
    const holoCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true, transparent: true, opacity: 0.85 })
    );
    holoGroup.add(holoRing, holoCore);
    holoGroup.visible = false;
    scene.add(holoGroup);

    // --- AMBIENT CYBER DUST PARTICLES ---
    const particleCount = 90;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVels = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 6.0;
      particlePositions[i * 3 + 1] = 0.2 + Math.random() * 2.8;
      particlePositions[i * 3 + 2] = -2.0 + Math.random() * 3.5;
      particleVels.push({
        x: (Math.random() - 0.5) * 0.004,
        y: 0.002 + Math.random() * 0.005,
        z: (Math.random() - 0.5) * 0.004
      });
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const steamParticles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
      color: 0x67e8f9, size: 0.035, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending
    }));
    scene.add(steamParticles);

    // --- REAL RIGGED GLB CHARACTERS ---
    const loader = new THREE.GLTFLoader();

    let leoRoot = null;
    let leoMixer = null;
    let leoActions = {};
    let leoMorphMeshes = [];
    let leoHeadBone = null;
    let coffeeSteam = [];

    let chipRoot = null;
    let chipMixer = null;
    let chipActions = {};
    let chipMorphMeshes = [];
    let chipAntennaOrb = null;
    let chipMouthBar = null;

    function loadGLB(url) {
      return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
    }

    const ready = Promise.all([
      loadGLB('leo_model.glb'),
      loadGLB('leo_idle.glb'),
      loadGLB('leo_talk.glb'),
      loadGLB('leo_expr.glb'),
      loadGLB('chip_robot.glb')
    ]).then(([leoGltf, idleGltf, talkGltf, exprGltf, chipGltf]) => {
      // 1. Setup Leo (Ready Player Me Rigged Humanoid)
      leoRoot = leoGltf.scene;
      leoRoot.position.set(-0.72, 0, 0.28);
      leoRoot.rotation.y = 0.52;
      leoRoot.scale.setScalar(1.0);
      let leoRightHandBone = null;
      leoRoot.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          if (obj.morphTargetDictionary && obj.morphTargetInfluences) {
            leoMorphMeshes.push(obj);
          }
        }
        if (obj.isBone) {
          if (obj.name === 'Head') leoHeadBone = obj;
          if (obj.name === 'RightHand') leoRightHandBone = obj;
        }
      });
      scene.add(leoRoot);

      // Attach sleek rectangular glasses to Leo's Head bone
      if (leoHeadBone) {
        const glassesGroup = new THREE.Group();
        glassesGroup.position.set(0, 0.088, 0.112);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.3, metalness: 0.6 });
        const lensMat = new THREE.MeshStandardMaterial({
          color: 0x88e5ff, transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.1, side: THREE.DoubleSide
        });
        function makeLens(xPos) {
          const g = new THREE.Group();
          g.position.x = xPos;
          const top = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.005, 0.006), frameMat);
          top.position.y = 0.016;
          const bot = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.004, 0.006), frameMat);
          bot.position.y = -0.016;
          const outB = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.036, 0.006), frameMat);
          outB.position.x = xPos < 0 ? -0.021 : 0.021;
          const inB = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.036, 0.006), frameMat);
          inB.position.x = xPos < 0 ? 0.021 : -0.021;
          const temple = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.004, 0.09), frameMat);
          temple.position.set(xPos < 0 ? -0.021 : 0.021, 0.012, -0.046);
          const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.038, 0.028), lensMat);
          g.add(top, bot, outB, inB, temple, lens);
          return g;
        }
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.004, 0.006), frameMat);
        bridge.position.y = 0.01;
        glassesGroup.add(makeLens(-0.034), makeLens(0.034), bridge);
        leoHeadBone.add(glassesGroup);
      }

      // Attach steaming coffee mug to Leo's RightHand bone
      if (leoRightHandBone) {
        const mugGroup = new THREE.Group();
        mugGroup.position.set(0.02, 0.075, 0.035);
        mugGroup.rotation.set(Math.PI / 2, 0, -0.3);
        const mugMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25, metalness: 0.1 });
        const mugBody = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.095, 16), mugMat);
        const mugCoffee = new THREE.Mesh(new THREE.CircleGeometry(0.036, 14), new THREE.MeshBasicMaterial({ color: 0x3b1e0a }));
        mugCoffee.rotation.x = -Math.PI / 2;
        mugCoffee.position.y = 0.049;
        const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.007, 8, 14, Math.PI), mugMat);
        mugHandle.rotation.z = -Math.PI / 2;
        mugHandle.position.set(0.042, 0, 0);
        mugGroup.add(mugBody, mugCoffee, mugHandle);

        for (let i = 0; i < 4; i++) {
          const wisp = new THREE.Mesh(
            new THREE.SphereGeometry(0.016, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 })
          );
          wisp.position.set((i - 1.5) * 0.01, 0.07 + i * 0.03, 0);
          mugGroup.add(wisp);
          coffeeSteam.push(wisp);
        }
        leoRightHandBone.add(mugGroup);
      }

      leoMixer = new THREE.AnimationMixer(leoRoot);
      if (idleGltf.animations.length) {
        leoActions.idle = leoMixer.clipAction(idleGltf.animations[0]);
        leoActions.idle.play();
      }
      if (talkGltf.animations.length) {
        leoActions.talk = leoMixer.clipAction(talkGltf.animations[0]);
        leoActions.talk.play();
      }
      if (exprGltf.animations.length) {
        leoActions.expr = leoMixer.clipAction(exprGltf.animations[0]);
        leoActions.expr.play();
      }

      // 2. Setup Chip (Expressive Rigged 3D Robot)
      chipRoot = chipGltf.scene;
      chipRoot.position.set(0.82, 0, 0.35);
      chipRoot.rotation.y = -0.58;
      chipRoot.scale.setScalar(0.36);
      let chipHeadBone = null;
      chipRoot.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          if (obj.morphTargetDictionary && obj.morphTargetInfluences) {
            chipMorphMeshes.push(obj);
          }
        }
        if (obj.isBone && obj.name === 'Head') {
          chipHeadBone = obj;
        }
      });
      scene.add(chipRoot);

      // Attach glowing cyan beacon antenna & LED voice bar to Chip's Head bone
      if (chipHeadBone) {
        const antGroup = new THREE.Group();
        antGroup.position.set(0, 1.35, 0);
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.06, 0.45, 12),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
        );
        stem.position.y = 0.22;
        chipAntennaOrb = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x00f0ff })
        );
        chipAntennaOrb.position.y = 0.48;
        antGroup.add(stem, chipAntennaOrb);
        chipHeadBone.add(antGroup);

        // Glowing LED mouth bar for crisp robotic lip-sync
        chipMouthBar = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.08, 0.08),
          new THREE.MeshBasicMaterial({ color: 0x00f0ff })
        );
        chipMouthBar.position.set(0, 0.22, 0.78);
        chipHeadBone.add(chipMouthBar);
      }

      chipMixer = new THREE.AnimationMixer(chipRoot);
      chipGltf.animations.forEach(clip => {
        const act = chipMixer.clipAction(clip);
        chipActions[clip.name] = act;
        act.play();
        act.setEffectiveWeight(clip.name === 'Idle' ? 1 : 0);
      });
    });

    function setBlendedWeights(actionsMap, prevName, nextName, blendProgress) {
      Object.keys(actionsMap).forEach(name => {
        const act = actionsMap[name];
        if (!act) return;
        if (prevName === nextName) {
          act.setEffectiveWeight(name === nextName ? 1.0 : 0.0);
        } else if (name === nextName) {
          act.setEffectiveWeight(blendProgress);
        } else if (name === prevName) {
          act.setEffectiveWeight(1.0 - blendProgress);
        } else {
          act.setEffectiveWeight(0.0);
        }
      });
    }

    function setMorph(meshes, names, value) {
      meshes.forEach(m => {
        names.forEach(n => {
          const idx = m.morphTargetDictionary[n];
          if (idx !== undefined) {
            m.morphTargetInfluences[idx] = value;
          }
        });
      });
    }

    function getSmoothedAmp(env, time) {
      if (!env || !env.length) return 0;
      const f = time * 30;
      const i0 = Math.min(env.length - 1, Math.max(0, Math.floor(f) - 1));
      const i1 = Math.min(env.length - 1, Math.max(0, Math.floor(f)));
      const i2 = Math.min(env.length - 1, Math.max(0, Math.floor(f) + 1));
      return (env[i0] * 0.25 + env[i1] * 0.5 + env[i2] * 0.25);
    }

    // --- CAMERA MODE ---
    Sitcom3D.cameraMode = 'director';
    Sitcom3D.setCameraMode = function(mode) {
      Sitcom3D.cameraMode = mode;
    };

    // --- ANIMATION TIMELINE (EXACT MATCH TO master_audio.wav) ---
    // 0.0 - 5.9s  : Leo Line 1 ("Chip... why is the sink completely empty, but the trash weighs forty pounds?")
    // 5.9 - 14.6s : Chip Line 2 ("Scrubbing pans costs $14.20 in lost billable hours!")
    // 14.6 - 19.6s: Leo Line 3 ("Did you throw away Grandma's porcelain bowls?!")
    // 19.6 - 26.0s: Chip Line 4 ("Zero dishwasher compatibility! Ordered 5,000 paper plates!")
    // 26.0 - 28.8s: Leo Line 5 ("I am going to unplug your router.")
    Sitcom3D.updateFrame = function(time) {
      const env = root.AUDIO_ENVELOPE || [];
      const rawAmp = getSmoothedAmp(env, time);
      const lipAmp = Math.min(1.0, Math.max(0.0, (rawAmp - 0.015) * 4.2));

      // Animate coffee steam wisps & Chip antenna beacon
      coffeeSteam.forEach((wisp, idx) => {
        const cycle = (time * 0.9 + idx * 0.25) % 1.0;
        wisp.position.y = 0.06 + cycle * 0.14;
        wisp.position.x = Math.sin(time * 4 + idx) * 0.012;
        wisp.material.opacity = (1.0 - cycle) * 0.5;
      });
      if (chipAntennaOrb) {
        chipAntennaOrb.scale.setScalar(0.9 + Math.sin(time * 7.0) * 0.18);
      }

      // Ambient cyber particles
      const posAttr = particleGeo.attributes.position;
      const posArray = posAttr.array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 0] += particleVels[i].x;
        posArray[i * 3 + 1] += particleVels[i].y;
        posArray[i * 3 + 2] += particleVels[i].z;
        if (posArray[i * 3 + 1] > 3.2) {
          posArray[i * 3 + 1] = 0.2;
        }
      }
      posAttr.needsUpdate = true;

      // Hologram visibility & spin during Chip's explanations
      const showHolo = (time >= 5.9 && time < 14.6) || (time >= 19.6 && time < 26.0);
      holoGroup.visible = showHolo;
      if (showHolo) {
        holoGroup.position.y = 1.55 + Math.sin(time * 3.0) * 0.06;
        holoRing.rotation.y = time * 2.2;
        holoCore.rotation.x = time * 1.8;
        holoCore.rotation.y = time * 2.5;
      }

      // Beat-by-beat character acting, crossfading & lip-sync
      let leoState = 'idle', leoPrev = 'idle', leoBlend = 1.0;
      let chipState = 'Idle', chipPrev = 'Idle', chipBlend = 1.0;
      let leoSpeaking = false;
      let chipSpeaking = false;
      let leoBrow = 0.0;
      let chipAngry = 0.0, chipSurprised = 0.0, chipSad = 0.0;

      if (time < 5.9) {
        // Beat 1: Leo asks exasperatedly
        leoSpeaking = true;
        leoState = 'talk'; leoPrev = 'idle';
        leoBlend = Math.min(1.0, time / 0.35);
        leoBrow = 0.55;
        chipState = 'Idle'; chipPrev = 'Idle';
      } else if (time < 14.6) {
        // Beat 2: Chip pitches $14.20 metric
        chipSpeaking = true;
        const bt = time - 5.9;
        leoState = 'idle'; leoPrev = 'talk';
        leoBlend = Math.min(1.0, bt / 0.35);
        leoBrow = 0.35;
        chipState = bt < 4.5 ? 'Wave' : 'Yes';
        chipPrev = bt < 4.5 ? 'Idle' : 'Wave';
        chipBlend = Math.min(1.0, (bt < 4.5 ? bt : bt - 4.5) / 0.3);
        chipSurprised = 0.15 + lipAmp * 0.75;
      } else if (time < 19.6) {
        // Beat 3: Leo panics about Grandma's porcelain bowls
        leoSpeaking = true;
        const bt = time - 14.6;
        leoState = 'expr'; leoPrev = 'idle';
        leoBlend = Math.min(1.0, bt / 0.25);
        leoBrow = 0.95;
        chipState = 'No'; chipPrev = 'Yes';
        chipBlend = Math.min(1.0, bt / 0.25);
        chipAngry = 0.3;
      } else if (time < 26.0) {
        // Beat 4: Chip proudly announces 5,000 paper plates
        chipSpeaking = true;
        const bt = time - 19.6;
        leoState = 'idle'; leoPrev = 'expr';
        leoBlend = Math.min(1.0, bt / 0.3);
        leoBrow = 0.7;
        chipState = bt < 3.4 ? 'ThumbsUp' : 'Dance';
        chipPrev = bt < 3.4 ? 'No' : 'ThumbsUp';
        chipBlend = Math.min(1.0, (bt < 3.4 ? bt : bt - 3.4) / 0.3);
        chipSurprised = 0.2 + lipAmp * 0.8;
      } else {
        // Beat 5: Deadpan finale ("I am going to unplug your router.")
        leoSpeaking = time < 28.4;
        const bt = time - 26.0;
        leoState = 'idle'; leoPrev = 'idle';
        leoBrow = 1.0;
        chipState = 'Idle'; chipPrev = 'Dance';
        chipBlend = Math.min(1.0, bt / 0.3);
        chipSad = 0.85;
      }

      if (leoMixer) {
        setBlendedWeights(leoActions, leoPrev, leoState, leoBlend);
        leoMixer.setTime(time);

        // Turn Leo's body/head naturally toward Chip, or deadpan to camera at finale
        if (time >= 26.0) {
          const p = Math.min(1.0, (time - 26.0) / 0.35);
          leoRoot.rotation.y = 0.52 * (1.0 - p) + 0.08 * p;
        } else {
          leoRoot.rotation.y = 0.52;
        }

        // Morph targets: real sculpted 3D jawOpen lip-sync + blink + browAngry
        const blinkCycle = time % 3.4;
        const blinkVal = (blinkCycle > 3.24 && blinkCycle < 3.36) ? 1.0 : 0.0;
        const jawVal = leoSpeaking ? Math.min(1.0, lipAmp * 0.95) : 0.0;
        setMorph(leoMorphMeshes, ['eyeBlink'], blinkVal);
        setMorph(leoMorphMeshes, ['jawOpen'], jawVal);
        setMorph(leoMorphMeshes, ['browAngry'], leoBrow);

        if (leoHeadBone && time < 26.0) {
          leoHeadBone.rotation.y += leoSpeaking ? Math.sin(time * 3.0) * 0.04 : 0.06;
          leoHeadBone.rotation.x += leoSpeaking ? jawVal * 0.05 : 0.0;
        }
      }

      if (chipMixer) {
        if (!chipActions[chipState]) chipState = 'Idle';
        if (!chipActions[chipPrev]) chipPrev = 'Idle';
        setBlendedWeights(chipActions, chipPrev, chipState, chipBlend);
        chipMixer.setTime(time);
        setMorph(chipMorphMeshes, ['Angry'], chipAngry);
        setMorph(chipMorphMeshes, ['Surprised'], chipSurprised);
        setMorph(chipMorphMeshes, ['Sad'], chipSad);

        if (chipMouthBar) {
          const barScaleY = chipSpeaking ? (0.5 + lipAmp * 3.2) : 0.35;
          chipMouthBar.scale.set(1.0, barScaleY, 1.0);
          chipMouthBar.material.color.setHex(chipSpeaking ? 0x00ffff : (chipSad > 0.5 ? 0xf59e0b : 0x00aaff));
        }
      }

      // --- DIRECTOR CUT CAMERA CHOREOGRAPHY (7 TIGHT BEATS) ---
      if (Sitcom3D.cameraMode === 'showcase') {
        camera.position.set(0.05, 1.32, 5.25);
        camera.lookAt(0.05, 1.02, 0.3);
      } else if (Sitcom3D.cameraMode === 'director') {
        if (time < 2.2) {
          // Shot 1: Wide Establishing Two-Shot (Leo, Chip, Sink & Overflowing Trash)
          const p = time / 2.2;
          camera.position.set(-0.2 + p * 0.25, 1.58, 4.4 - p * 0.35);
          camera.lookAt(0.1, 1.15, 0.15);
        } else if (time < 5.9) {
          // Shot 2: Over-the-Shoulder Medium Close-Up on Leo
          const p = (time - 2.2) / 3.7;
          camera.position.set(-0.15 + p * 0.05, 1.56, 1.65 - p * 0.18);
          camera.lookAt(-0.70, 1.52, 0.28);
        } else if (time < 11.2) {
          // Shot 3: Medium Close-Up on Chip + Floating 3D Holo Chart
          const p = (time - 5.9) / 5.3;
          camera.position.set(0.35 + p * 0.12, 1.18, 2.05 - p * 0.15);
          camera.lookAt(0.82, 0.98, 0.35);
        } else if (time < 14.6) {
          // Shot 4: Quick Reaction Cutaway on Leo listening in disbelief
          const p = (time - 11.2) / 3.4;
          camera.position.set(-0.22, 1.58, 1.75 - p * 0.1);
          camera.lookAt(-0.72, 1.54, 0.28);
        } else if (time < 19.6) {
          // Shot 5: Dramatic Push-In Close-Up on Leo ("Grandma's porcelain bowls?!")
          const p = (time - 14.6) / 5.0;
          camera.position.set(-0.28, 1.57, 1.55 - p * 0.22);
          camera.lookAt(-0.72, 1.54, 0.28);
        } else if (time < 26.0) {
          // Shot 6: Low-Angle Hero Shot on Chip ("Ordered 5,000 paper plates!")
          const p = (time - 19.6) / 6.4;
          camera.position.set(0.42, 0.78 + p * 0.18, 1.95 - p * 0.15);
          camera.lookAt(0.82, 0.95, 0.35);
        } else {
          // Shot 7: Deadpan Close-Up -> Two-Shot Finale ("I am going to unplug your router.")
          const p = (time - 26.0) / 2.8;
          if (p < 0.65) {
            camera.position.set(-0.52, 1.58, 1.48);
            camera.lookAt(-0.72, 1.56, 0.28);
          } else {
            camera.position.set(0.05, 1.42, 3.6);
            camera.lookAt(0.05, 1.15, 0.3);
          }
        }
      }

      renderer.render(scene, camera);
    };

    Sitcom3D.ready = ready;
    Sitcom3D.camera = camera;
    Sitcom3D.scene = scene;
    Sitcom3D.renderer = renderer;
    return Sitcom3D;
  };

  root.Sitcom3D = Sitcom3D;
})(typeof window !== 'undefined' ? window : this);
