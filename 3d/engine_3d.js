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

    // --- 3D SMART DISHWASHER ---
    const dishwasher = new THREE.Group();
    dishwasher.position.set(1.85, 0, -1.35);

    const dwBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.4, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x2a3344, metalness: 0.8, roughness: 0.25 })
    );
    dwBody.position.y = 0.7;
    dwBody.castShadow = true;
    dwBody.receiveShadow = true;
    dishwasher.add(dwBody);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 1.05, 0.05),
      new THREE.MeshStandardMaterial({
        color: 0x88ccff, metalness: 0.2, roughness: 0.1,
        transparent: true, opacity: 0.85, emissive: 0x004488, emissiveIntensity: 0.4
      })
    );
    door.position.set(0, 0.65, 0.56);
    dishwasher.add(door);

    const ledScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.12), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    ledScreen.position.set(0, 1.28, 0.56);
    dishwasher.add(ledScreen);
    scene.add(dishwasher);

    // --- DRY ICE PARTICLES ---
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVels = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = 1.85 + (Math.random() - 0.5) * 1.1;
      particlePositions[i * 3 + 1] = 0.2 + Math.random() * 0.8;
      particlePositions[i * 3 + 2] = -0.7 + Math.random() * 1.3;
      particleVels.push({
        x: (Math.random() - 0.5) * 0.015,
        y: 0.008 + Math.random() * 0.016,
        z: 0.01 + Math.random() * 0.018
      });
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const steamParticles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
      color: 0xccf0ff, size: 0.075, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
    }));
    scene.add(steamParticles);

    // --- REAL RIGGED GLB CHARACTERS ---
    const loader = new THREE.GLTFLoader();

    let leoRoot = null;
    let leoMixer = null;
    let leoActions = {};
    let leoMorphMeshes = [];
    let coffeeSteam = [];

    let chipRoot = null;
    let chipMixer = null;
    let chipActions = {};
    let chipMorphMeshes = [];
    let chipAntennaOrb = null;

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
      leoRoot.position.set(-0.75, 0, 0.25);
      leoRoot.rotation.y = 0.28;
      leoRoot.scale.setScalar(1.0);
      let leoHeadBone = null;
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
      chipRoot.position.set(0.85, 0, 0.35);
      chipRoot.rotation.y = -0.35;
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

      // Attach glowing cyan beacon antenna to Chip's Head bone
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
      }

      chipMixer = new THREE.AnimationMixer(chipRoot);
      chipGltf.animations.forEach(clip => {
        const act = chipMixer.clipAction(clip);
        chipActions[clip.name] = act;
        act.play();
        act.setEffectiveWeight(clip.name === 'Idle' ? 1 : 0);
      });
    });

    function setExclusiveWeight(actionsMap, activeName) {
      Object.keys(actionsMap).forEach(name => {
        if (actionsMap[name]) {
          actionsMap[name].setEffectiveWeight(name === activeName ? 1.0 : 0.0);
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

    // --- CAMERA MODE ---
    Sitcom3D.cameraMode = 'director';
    Sitcom3D.setCameraMode = function(mode) {
      Sitcom3D.cameraMode = mode;
    };

    // --- ANIMATION TIMELINE ---
    Sitcom3D.updateFrame = function(time) {
      const env = root.AUDIO_ENVELOPE || [];
      const fIdx = Math.min(env.length - 1, Math.max(0, Math.floor(time * 30)));
      const audioAmp = env.length ? env[fIdx] : 0;

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

      // Dishwasher vibration & steam
      const dwVibrate = (time > 0.5 && time < 4.5) || (time > 11.0 && time < 16.0) || time > 26.0;
      dishwasher.position.x = 1.85 + (dwVibrate ? (Math.random() - 0.5) * 0.02 : 0);
      dishwasher.position.z = -1.35 + (dwVibrate ? (Math.random() - 0.5) * 0.02 : 0);

      const posAttr = particleGeo.attributes.position;
      const posArray = posAttr.array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 0] += particleVels[i].x;
        posArray[i * 3 + 1] += particleVels[i].y;
        posArray[i * 3 + 2] += particleVels[i].z;
        if (posArray[i * 3 + 1] > 2.3) {
          posArray[i * 3 + 0] = 1.85 + (Math.random() - 0.5) * 1.1;
          posArray[i * 3 + 1] = 0.2;
          posArray[i * 3 + 2] = -0.7 + Math.random() * 1.3;
        }
      }
      posAttr.needsUpdate = true;

      // Character animation state selection
      let leoState = 'idle';
      let chipState = 'Idle';
      let leoTalkAmp = 0;

      if (time >= 0.5 && time <= 4.6) {
        leoState = 'talk';
        leoTalkAmp = audioAmp > 0.05 ? audioAmp : Math.abs(Math.sin(time * 14)) * 0.5;
        chipState = 'Idle';
      } else if (time >= 5.0 && time <= 10.8) {
        leoState = 'idle';
        chipState = 'Wave';
      } else if (time >= 11.2 && time <= 15.8) {
        leoState = 'expr';
        leoTalkAmp = audioAmp > 0.05 ? audioAmp : Math.abs(Math.sin(time * 15)) * 0.5;
        chipState = 'No';
      } else if (time >= 16.2 && time <= 22.4) {
        leoState = 'idle';
        chipState = 'ThumbsUp';
      } else if (time >= 22.8 && time <= 25.5) {
        leoState = 'talk';
        leoTalkAmp = audioAmp > 0.05 ? audioAmp : 0.45;
        chipState = 'Yes';
      } else if (time > 25.5) {
        leoState = 'expr';
        chipState = 'Dance';
      }

      if (leoMixer) {
        setExclusiveWeight(leoActions, leoState);
        leoMixer.setTime(time);
        // Blink & audio lip-sync on morph targets if present
        const blinkCycle = time % 3.7;
        const blinkVal = (blinkCycle > 3.56 && blinkCycle < 3.68) ? 1.0 : 0.0;
        setMorph(leoMorphMeshes, ['eyeBlinkLeft', 'eyeBlinkRight', 'eyesClosed'], blinkVal);
        setMorph(leoMorphMeshes, ['jawOpen', 'mouthOpen', 'viseme_aa'], leoTalkAmp * 0.85);
      }

      if (chipMixer) {
        if (!chipActions[chipState]) chipState = 'Idle';
        setExclusiveWeight(chipActions, chipState);
        chipMixer.setTime(time);
        const chipAngry = (time >= 11.2 && time <= 15.8) ? 0.4 : 0.0;
        const chipSurprised = (time >= 5.0 && time <= 10.8) ? 0.5 : 0.0;
        setMorph(chipMorphMeshes, ['Angry'], chipAngry);
        setMorph(chipMorphMeshes, ['Surprised'], chipSurprised);
      }

      // Camera system
      if (Sitcom3D.cameraMode === 'showcase') {
        camera.position.set(0.05, 1.32, 5.25);
        camera.lookAt(0.05, 1.02, 0.3);
      } else if (Sitcom3D.cameraMode === 'director') {
        if (time < 4.5) {
          const p = time / 4.5;
          camera.position.set(-0.3 + p * 0.3, 1.6 - p * 0.1, 4.6 - p * 0.5);
          camera.lookAt(0.1, 1.2, 0.2);
        } else if (time < 9.5) {
          const p = (time - 4.5) / 5.0;
          camera.position.set(-0.5 + p * 0.08, 1.55, 1.75 - p * 0.2);
          camera.lookAt(-0.75, 1.52, 0.25);
        } else if (time < 16.0) {
          const p = (time - 9.5) / 6.5;
          camera.position.set(0.75 + Math.sin(p * 2.0) * 0.15, 1.25, 2.35 - p * 0.15);
          camera.lookAt(0.85, 0.95, 0.35);
        } else if (time < 21.0) {
          camera.position.set(-0.1, 1.5, 3.4);
          camera.lookAt(0.1, 1.15, 0.25);
        } else if (time < 26.5) {
          const p = (time - 21.0) / 5.5;
          camera.position.set(0.75, 0.95 + p * 0.15, 2.1);
          camera.lookAt(0.85, 0.95, 0.35);
        } else {
          camera.position.set(0, 1.55, 4.4);
          camera.lookAt(0.05, 1.15, 0.3);
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
