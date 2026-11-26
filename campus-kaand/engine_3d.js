// K•A•M•P•U•S  K•A•N•D — Hinglish 3D Sitcom Engine
// Applies Walter Murch Rule of Six, 180-deg Eye-line Axis, Steadicam Walk-and-Talk & Laugh Pauses

(function(root) {
  const Campus3D = {};

  Campus3D.init = function(canvas, width, height) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x93c5fd);
    scene.fog = new THREE.FogExp2(0xbae6fd, 0.014);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.set(0, 2.5, -5.0);

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
    renderer.toneMappingExposure = 1.08;

    // --- DAYTIME SUNNY CAMPUS + WARM CANTEEN LIGHTING ---
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x4d7c0f, 1.15);
    scene.add(hemi);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.9);
    sunLight.position.set(8, 14, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 45;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.0006;
    scene.add(sunLight);

    const indoorWarm = new THREE.PointLight(0xfef08a, 1.4, 10);
    indoorWarm.position.set(0, 2.9, -1.5);
    scene.add(indoorWarm);

    const canteenWarm = new THREE.PointLight(0xfdba74, 1.5, 11);
    canteenWarm.position.set(0, 2.8, 6.8);
    scene.add(canteenWarm);

    // --- SET GEOMETRY (Walking path along +Z from z=-10 -> z=+8) ---
    const world = new THREE.Group();

    // Grass Lawn (Exterior Base)
    const lawn = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.95 })
    );
    lawn.rotation.x = -Math.PI / 2;
    lawn.receiveShadow = true;
    world.add(lawn);

    // Brick Walkway running straight through campus (z: -12 to +11)
    const walkway = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 24),
      new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 })
    );
    walkway.rotation.x = -Math.PI / 2;
    walkway.position.y = 0.01;
    walkway.receiveShadow = true;
    world.add(walkway);

    // SET 1: College Gate Archway (z = -8.5)
    const gate = new THREE.Group();
    gate.position.set(0, 0, -8.5);
    const brickMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85 });
    [-2.1, 2.1].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 3.6, 0.65), brickMat);
      pillar.position.set(px, 1.8, 0);
      pillar.castShadow = true;
      gate.add(pillar);
    });
    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.7, 0.55), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }));
    archBeam.position.set(0, 3.5, 0);
    gate.add(archBeam);

    // Sign Texture for College Gate
    function makeSignTexture(text, bg, fg, sub) {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 128;
      const cx = c.getContext('2d');
      cx.fillStyle = bg; cx.fillRect(0, 0, 512, 128);
      cx.strokeStyle = fg; cx.lineWidth = 6; cx.strokeRect(6, 6, 500, 116);
      cx.fillStyle = fg; cx.font = 'bold 38px Arial, sans-serif'; cx.textAlign = 'center';
      cx.fillText(text, 256, sub ? 62 : 76);
      if (sub) { cx.font = 'bold 20px Arial, sans-serif'; cx.fillStyle = '#fef08a'; cx.fillText(sub, 256, 98); }
      return new THREE.CanvasTexture(c);
    }

    const gateSign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 0.6),
      new THREE.MeshBasicMaterial({ map: makeSignTexture('D.J. COLLEGE CAMPUS', '#0f172a', '#38bdf8', 'DAY 1  •  WELCOME FRESHERS') })
    );
    gateSign.position.set(0, 3.5, 0.29);
    gate.add(gateSign);
    world.add(gate);

    // Campus Trees flanking Lawn
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
    [[-3.8, -6.5], [3.8, -6.5], [-4.2, 5.2], [4.2, 7.8]].forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.0, 10), trunkMat);
      tr.position.y = 1.0; tr.castShadow = true;
      const cr = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 1), leafMat);
      cr.position.y = 2.6; cr.castShadow = true;
      tree.add(tr, cr);
      world.add(tree);
    });

    // SET 2: Locker Corridor Building (z = -3.8 to +2.8)
    const corridor = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 });
    const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 6.8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    roofMesh.position.set(0, 3.3, -0.5);
    corridor.add(roofMesh);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 6.8), wallMat);
    leftWall.position.set(-2.3, 1.6, -0.5);
    leftWall.receiveShadow = true;
    corridor.add(leftWall);

    // Right Wall with Doorway Gap at z = -1.2 for Senior!
    const rwBack = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 2.2), wallMat);
    rwBack.position.set(2.3, 1.6, -2.8);
    const rwFront = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 3.4), wallMat);
    rwFront.position.set(2.3, 1.6, 1.2);
    corridor.add(rwBack, rwFront);

    // Blue Lockers on Left Wall
    for (let lz = -3.0; lz <= 1.5; lz += 0.9) {
      const locker = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.0, 0.78), trimMat);
      locker.position.set(-1.92, 1.0, lz);
      locker.castShadow = true;
      corridor.add(locker);
    }

    // Noticeboard
    const notice = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 0.85),
      new THREE.MeshBasicMaterial({ map: makeSignTexture('NOTICE BOARD', '#78350f', '#fef08a', 'NO FIGHTING IN CORRIDOR!') })
    );
    notice.rotation.y = Math.PI / 2;
    notice.position.set(-2.15, 1.75, 0.5);
    corridor.add(notice);
    world.add(corridor);

    // SET 3: Spring-Loaded Swinging Canteen Door (z = +2.85, hinged at x = +1.85)
    const doorPivot = new THREE.Group();
    doorPivot.position.set(1.85, 0, 2.85);
    const swingDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 2.3, 0.09),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45 })
    );
    swingDoor.position.set(-0.725, 1.15, 0);
    swingDoor.castShadow = true;
    const doorWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.65, 0.11),
      new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.65 })
    );
    doorWindow.position.set(-0.75, 1.55, 0);
    doorPivot.add(swingDoor, doorWindow);
    // Start ajar at -0.15 rad; springs violently onto Rohan at Slap 3!
    doorPivot.rotation.y = 0.05;
    world.add(doorPivot);

    // Open-Air Canteen & Chai Stall (z = +5.5 to +9.5)
    const canteen = new THREE.Group();
    const stallCounter = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.05, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.7 })
    );
    stallCounter.position.set(-2.0, 0.525, 7.6);
    stallCounter.castShadow = true;
    const stallAwning = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.15, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 })
    );
    stallAwning.position.set(-2.0, 2.5, 7.6);
    stallAwning.rotation.x = 0.2;
    const stallSign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.55),
      new THREE.MeshBasicMaterial({ map: makeSignTexture('SHARMA CHAI & SAMOSA', '#1e293b', '#facc15', 'HOT SAMOSA RS.15') })
    );
    stallSign.position.set(-2.0, 2.25, 8.5);
    stallSign.rotation.y = Math.PI;
    canteen.add(stallCounter, stallAwning, stallSign);

    // Overhead Canteen Pergola Beam over Rohan (z = +6.6) where the Monkey sits!
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 0.18), beamMat);
    postR.position.set(1.75, 1.4, 6.6);
    const overBeam = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 0.24), beamMat);
    overBeam.position.set(0.55, 2.65, 6.6);
    overBeam.castShadow = true;
    canteen.add(postR, overBeam);

    // Canteen Table & Samosa Plate (x = 0.45, z = 7.4)
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.9), beamMat);
    tableTop.position.set(0.45, 0.78, 7.6);
    tableTop.castShadow = true;
    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.78, 10), beamMat);
    tableLeg.position.set(0.45, 0.39, 7.6);
    const samosaPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc })
    );
    samosaPlate.position.set(0.45, 0.84, 7.6);
    canteen.add(tableTop, tableLeg, samosaPlate);
    world.add(canteen);

    // --- 3D ARTICULATED CAMPUS MONKEY (Perched on Canteen Beam above Rohan!) ---
    const monkey = new THREE.Group();
    monkey.position.set(0.85, 2.75, 6.45);
    const furMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.75 });
    const mBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), furMat);
    mBody.scale.set(1, 1.3, 0.9);
    const mHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), furMat);
    mHead.position.set(0, 0.25, 0.05);
    const mSnout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), faceMat);
    mSnout.position.set(0, 0.21, 0.15);
    [-0.15, 0.15].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), faceMat);
      ear.position.set(ex, 0.27, 0.03);
      monkey.add(ear);
    });
    const mEyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    [-0.045, 0.045].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), mEyeMat);
      eye.position.set(ex, 0.29, 0.17);
      monkey.add(eye);
    });
    const monkeyArmPivot = new THREE.Group();
    monkeyArmPivot.position.set(-0.14, 0.1, 0.05);
    const mArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 10), furMat);
    mArm.position.y = -0.22;
    const mPaw = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), faceMat);
    mPaw.position.y = -0.45;
    monkeyArmPivot.add(mArm, mPaw);
    monkey.add(mBody, mHead, mSnout, monkeyArmPivot);
    world.add(monkey);

    scene.add(world);

    // --- LOAD RIGGED 3D CHARACTERS (Walk + Talk + Expr + Sculpted Lip-Sync) ---
    const loader = new THREE.GLTFLoader();
    function loadGLB(url) { return new Promise((res, rej) => loader.load(url, res, undefined, rej)); }

    const chars = {};
    let dizzyStars = null;
    let slapRedCheek = null;

    const ready = Promise.all([
      loadGLB('aarav.glb'),
      loadGLB('rohan.glb'),
      loadGLB('senior.glb'),
      loadGLB('leo_idle.glb'),
      loadGLB('leo_talk.glb'),
      loadGLB('leo_expr.glb'),
      loadGLB('leo_walk.glb')
    ]).then(([aaravG, rohanG, seniorG, idleG, talkG, exprG, walkG]) => {
      function setupChar(key, gltf, x, z, scale) {
        const rootObj = gltf.scene;
        rootObj.position.set(x, 0, z);
        rootObj.scale.setScalar(scale);
        const morphMeshes = [];
        const bones = {};
        rootObj.traverse(obj => {
          if (obj.isMesh) {
            obj.castShadow = true; obj.receiveShadow = true;
            if (obj.morphTargetDictionary && obj.morphTargetInfluences) morphMeshes.push(obj);
          }
          if (obj.isBone) bones[obj.name] = obj;
        });
        scene.add(rootObj);
        const mixer = new THREE.AnimationMixer(rootObj);
        const actions = {
          idle: mixer.clipAction(idleG.animations[0]),
          talk: mixer.clipAction(talkG.animations[0]),
          expr: mixer.clipAction(exprG.animations[0]),
          walk: mixer.clipAction(walkG.animations[0]),
        };
        Object.values(actions).forEach(a => a.play());
        chars[key] = { root: rootObj, mixer, actions, morphMeshes, bones };
        return chars[key];
      }

      const aarav = setupChar('aarav', aaravG, -0.52, -9.2, 1.0);
      const rohan = setupChar('rohan', rohanG, 0.52, -9.2, 1.0);
      const senior = setupChar('senior', seniorG, 2.2, -1.2, 1.06);
      senior.root.rotation.y = -Math.PI / 2;

      // Backpack on Aarav's Spine2 bone
      if (aarav.bones['Spine2']) {
        const pack = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.36, 0.14),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 })
        );
        pack.position.set(0, 0.04, -0.17);
        aarav.bones['Spine2'].add(pack);
      }

      // Glasses on Rohan's Head bone + Cumulative Red Slap Blush + Dizzy Stars!
      if (rohan.bones['Head']) {
        slapRedCheek = new THREE.Mesh(
          new THREE.SphereGeometry(0.036, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.0 })
        );
        slapRedCheek.scale.set(1.2, 0.85, 0.4);
        slapRedCheek.position.set(0.052, 0.058, 0.098);
        rohan.bones['Head'].add(slapRedCheek);

        dizzyStars = new THREE.Group();
        dizzyStars.position.set(0, 0.28, 0);
        for (let i = 0; i < 4; i++) {
          const st = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.025, 0),
            new THREE.MeshBasicMaterial({ color: 0xfacc15 })
          );
          const ang = (i / 4) * Math.PI * 2;
          st.position.set(Math.cos(ang) * 0.16, 0, Math.sin(ang) * 0.16);
          dizzyStars.add(st);
        }
        dizzyStars.visible = false;
        rohan.bones['Head'].add(dizzyStars);
      }

      // Cool Dark Sunglasses on Senior's Head bone
      if (senior.bones['Head']) {
        const sg = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.034, 0.02),
          new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.8 })
        );
        sg.position.set(0, 0.088, 0.115);
        senior.bones['Head'].add(sg);
      }
    });

    function setBlend(actions, prev, next, p) {
      Object.keys(actions).forEach(k => {
        if (prev === next) actions[k].setEffectiveWeight(k === next ? 1.0 : 0.0);
        else if (k === next) actions[k].setEffectiveWeight(p);
        else if (k === prev) actions[k].setEffectiveWeight(1.0 - p);
        else actions[k].setEffectiveWeight(0.0);
      });
    }

    function setMorph(meshes, name, val) {
      meshes.forEach(m => {
        const idx = m.morphTargetDictionary[name];
        if (idx !== undefined) m.morphTargetInfluences[idx] = val;
      });
    }

    function ampAt(env, time) {
      if (!env || !env.length) return 0;
      const f = time * 30;
      const i0 = Math.min(env.length - 1, Math.max(0, Math.floor(f) - 1));
      const i1 = Math.min(env.length - 1, Math.max(0, Math.floor(f)));
      const i2 = Math.min(env.length - 1, Math.max(0, Math.floor(f) + 1));
      return env[i0] * 0.25 + env[i1] * 0.5 + env[i2] * 0.25;
    }

    function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
    function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

    Campus3D.cameraMode = 'director';
    Campus3D.setCameraMode = function(m) { Campus3D.cameraMode = m; };

    // --- HELPER: Compute Character World Path along +Z ---
    function getCampusZ(time) {
      if (time < 10.6) return lerp(-9.2, -3.6, smooth(time / 10.4));       // Zone 1: Gate -> Corridor Door
      if (time < 17.9) return -3.6;                                         // Slap 1 & Laugh Pause 1
      if (time < 25.4) return lerp(-3.6, -1.0, smooth((time - 17.9) / 7.5));// Zone 2: Walk down Corridor
      if (time < 40.6) return -1.0;                                         // Slap 2 Senior confrontation & Laugh
      if (time < 49.0) return lerp(-1.0, 2.75, smooth((time - 40.6) / 8.4));// Walk toward Canteen Door!
      if (time < 56.0) return 2.75;                                         // Slap 3 Door & Laugh
      if (time < 63.3) return lerp(2.75, 6.25, smooth((time - 56.0) / 7.3));// Zone 3: Walk into Open-Air Canteen!
      return 6.25;                                                          // Canteen Climax, Slap 4 Monkey & Outro
    }

    Campus3D.updateFrame = function(time) {
      const aAmp = Math.min(1.0, Math.max(0.0, (ampAt(root.AARAV_ENVELOPE, time) - 0.012) * 4.5));
      const rAmp = Math.min(1.0, Math.max(0.0, (ampAt(root.ROHAN_ENVELOPE, time) - 0.012) * 4.5));
      const sAmp = Math.min(1.0, Math.max(0.0, (ampAt(root.SENIOR_ENVELOPE, time) - 0.012) * 4.5));

      const pathZ = getCampusZ(time);
      const isWalking = (time < 10.4) || (time >= 17.9 && time < 25.3) || (time >= 40.6 && time < 48.9) || (time >= 56.0 && time < 63.1);

      const meta = root.TIMELINE_META || {};
      const slaps = meta.slap_events || [['s1', 10.64], ['s2', 30.71], ['s3', 49.00], ['s4', 63.36]];
      const s1 = slaps[0][1], s2 = slaps[1][1], s3 = slaps[2][1], s4 = slaps[3][1];

      // Determine Slap Impact Recoil (decays over 0.7s) & Red Cheek Count
      let recoil = 0.0;
      let hitCount = 0;
      [s1, s2, s3, s4].forEach(ts => {
        if (time >= ts) {
          hitCount++;
          const dt = time - ts;
          if (dt < 0.8) recoil = Math.max(recoil, Math.exp(-dt * 4.5) * Math.sin(dt * 12 + 0.4));
        }
      });

      // Set Aarav
      if (chars.aarav) {
        const a = chars.aarav;
        a.root.position.set(-0.55, 0, pathZ);
        let aSt = isWalking ? 'walk' : (aAmp > 0.08 ? 'talk' : 'idle');
        if (time >= s1 - 0.25 && time < s1 + 0.4) aSt = 'expr';
        if (time >= 49.55 && time < 54.4) aSt = 'expr';
        setBlend(a.actions, aSt, aSt, 1.0);
        a.mixer.setTime(time);

        // Turn naturally toward Rohan (+x) during dialogue, or directly face camera at finale!
        if (time >= 49.5 && time < 56.0) a.root.rotation.y = 0.12;
        else if (time >= 72.9) a.root.rotation.y = lerp(0.45, 0.05, smooth((time - 72.9) / 0.4));
        else a.root.rotation.y = 0.38;

        const blink = (time % 3.5 > 3.35) ? 1.0 : 0.0;
        setMorph(a.morphMeshes, 'eyeBlink', blink);
        setMorph(a.morphMeshes, 'jawOpen', aAmp * 0.95);
        setMorph(a.morphMeshes, 'browAngry', 0.0);

        // Accidental backhand arm whip at Slap 1 (s1)
        if (a.bones['RightArm'] && time >= s1 - 0.18 && time <= s1 + 0.35) {
          const sp = smooth((time - (s1 - 0.18)) / 0.22);
          a.bones['RightArm'].rotation.z += sp * 1.1;
          a.bones['RightArm'].rotation.y += sp * 0.9;
        }
        // Look at Rohan (+X) or Camera
        if (a.bones['Head']) {
          if (time >= 72.9 || (time >= 49.5 && time < 56.0)) a.bones['Head'].rotation.y *= 0.2;
          else a.bones['Head'].rotation.y += 0.20; // turn eye-line toward Rohan (+X)!
        }
      }

      // Set Rohan (The Slap-Magnet)
      if (chars.rohan) {
        const r = chars.rohan;
        // Rohan steps slightly closer to Canteen door edge before Slap 3, and crouches/ducks right into Slap 4
        const rx = (time >= 47.0 && time < 56.0) ? 0.65 : 0.55;
        r.root.position.set(rx, 0, pathZ);
        let rSt = isWalking ? 'walk' : (rAmp > 0.08 ? 'expr' : 'idle');
        setBlend(r.actions, rSt, rSt, 1.0);
        r.mixer.setTime(time);

        // Face Aarav (-x) normally, turn toward Senior (+x) at 25.5-39.1, or direct-to-camera on punchlines!
        if (time >= 25.5 && time < 39.2) r.root.rotation.y = 0.65; // face Senior coming from right
        else if ((time >= 40.6 && time < 47.5) || (time >= 63.9 && time < 72.9)) r.root.rotation.y = 0.05; // Direct-to-camera!
        else r.root.rotation.y = -0.38;

        const blink = ((time + 1.2) % 3.1 > 2.95) ? 1.0 : 0.0;
        setMorph(r.morphMeshes, 'eyeBlink', recoil > 0.2 ? 1.0 : blink);
        setMorph(r.morphMeshes, 'jawOpen', recoil > 0.25 ? 0.85 : rAmp * 0.95);
        setMorph(r.morphMeshes, 'browAngry', Math.min(1.0, 0.25 * hitCount));

        // Slap recoil head whip & right cheek reaction
        if (r.bones['Head']) {
          if (recoil !== 0) {
            r.bones['Head'].rotation.y -= recoil * 0.85;
            r.bones['Head'].rotation.z += recoil * 0.35;
          } else if ((time >= 40.6 && time < 47.5) || (time >= 63.9 && time < 72.9)) {
            r.bones['Head'].rotation.y *= 0.2; // deadpan straight into camera!
          } else if (time < 40.6 || (time >= 47.5 && time < 63.9)) {
            r.bones['Head'].rotation.y -= 0.20; // look at Aarav (-X)!
          }
        }
        if (slapRedCheek) {
          slapRedCheek.material.opacity = Math.min(0.85, hitCount * 0.22);
        }
        if (dizzyStars) {
          dizzyStars.visible = [s1, s2, s3, s4].some(ts => time >= ts && time < ts + 1.5);
          dizzyStars.rotation.y = time * 6.0;
        }
      }

      // Set Senior Cameo (Walks out at 24.8s -> Slaps at 30.71s -> Leaves at 39.2s)
      if (chars.senior) {
        const s = chars.senior;
        let sx = 2.4, sz = -1.2, sWalk = false;
        if (time >= 24.5 && time < 26.2) {
          sx = lerp(2.4, 1.28, smooth((time - 24.5) / 1.5));
          sWalk = true;
        } else if (time >= 26.2 && time < 39.0) {
          sx = 1.28;
        } else if (time >= 39.0 && time < 40.8) {
          sx = lerp(1.28, 2.8, smooth((time - 39.0) / 1.5));
          sWalk = true;
        }
        s.root.position.set(sx, 0, sz);
        s.root.rotation.y = time >= 39.0 ? Math.PI / 2 : -Math.PI / 2;
        const sSt = sWalk ? 'walk' : (sAmp > 0.08 ? 'expr' : 'idle');
        setBlend(s.actions, sSt, sSt, 1.0);
        s.mixer.setTime(time);
        setMorph(s.morphMeshes, 'jawOpen', sAmp * 0.95);
        setMorph(s.morphMeshes, 'browAngry', time < 31.1 ? 0.9 : 0.1);

        // Forceful slap arm swing at s2
        if (s.bones['RightArm'] && time >= s2 - 0.2 && time <= s2 + 0.35) {
          const sp = smooth((time - (s2 - 0.2)) / 0.22);
          s.bones['RightArm'].rotation.x -= sp * 1.45;
        }
      }

      // Set Slap 3: Spring-loaded Canteen Door swings violently at s3 (49.00s)
      if (time >= s3 - 0.18 && time < s3 + 2.2) {
        const dt = time - (s3 - 0.18);
        doorPivot.rotation.y = 0.05 - Math.sin(dt * 8.5) * Math.exp(-dt * 2.4) * 1.35;
      } else {
        doorPivot.rotation.y = 0.05;
      }

      // Set Slap 4: Campus Monkey leans down & swings paw onto Rohan's cheek at s4 (63.36s)!
      if (time >= s4 - 0.35 && time < s4 + 1.2) {
        const dt = time - (s4 - 0.35);
        const swing = Math.sin(Math.min(Math.PI, dt * 4.5));
        monkey.position.y = 2.75 - swing * 0.55;
        monkeyArmPivot.rotation.x = -swing * 1.35;
      } else {
        monkey.position.y = 2.75 + Math.sin(time * 2.5) * 0.03;
        monkeyArmPivot.rotation.x = 0.0;
      }

      // --- PRO CAMERA DIRECTOR (Walter Murch Rule of Six + 180-deg Axis) ---
      if (Campus3D.cameraMode === 'director') {
        if (time < 3.0) {
          // SHOT 1: High Crane Opening over Sunny College Gate -> descends to Walk-and-Talk
          const p = smooth(time / 3.0);
          camera.fov = 38; camera.updateProjectionMatrix();
          camera.position.set(lerp(-1.2, 0.0, p), lerp(3.8, 1.62, p), pathZ + lerp(4.8, 3.2, p));
          camera.lookAt(0, 1.35, pathZ);
        } else if (time < 10.5) {
          // SHOT 2: Continuous Steadicam Walk-and-Talk (35mm medium two-shot!)
          camera.fov = 38; camera.updateProjectionMatrix();
          camera.position.set(Math.sin(time * 0.4) * 0.15, 1.56, pathZ + 3.05);
          camera.lookAt(0, 1.42, pathZ);
        } else if (time < 16.5) {
          // SHOT 3: SLAP 1 Whip-Dodge & Tight Reaction Close-Up on Rohan!
          camera.fov = 30; camera.updateProjectionMatrix();
          const shake = (time - s1 >= 0 && time - s1 < 0.35) ? Math.sin(time * 65) * 0.06 : 0;
          camera.position.set(0.18 + shake, 1.58 + shake * 0.5, pathZ + 1.42);
          camera.lookAt(0.52, 1.52, pathZ);
        } else if (time < 18.0) {
          // LAUGH PAUSE 1: Quick Two-Shot Cut so audience sees Aarav cringe!
          camera.fov = 38; camera.updateProjectionMatrix();
          camera.position.set(0, 1.56, pathZ + 2.8);
          camera.lookAt(0, 1.44, pathZ);
        } else if (time < 25.4) {
          // SHOT 4: Continuous Steadicam Walk-and-Talk into Locker Corridor
          camera.fov = 38; camera.updateProjectionMatrix();
          camera.position.set(0.1, 1.56, pathZ + 2.95);
          camera.lookAt(0, 1.42, pathZ);
        } else if (time < 31.1) {
          // SHOT 5: Wide Angle showing Senior burst from doorway -> SLAP 2 Impact!
          camera.fov = 36; camera.updateProjectionMatrix();
          const shake = (time - s2 >= 0 && time - s2 < 0.35) ? Math.sin(time * 70) * 0.07 : 0;
          camera.position.set(-0.2 + shake, 1.58, pathZ + 2.55);
          camera.lookAt(0.75, 1.45, pathZ);
        } else if (time < 39.1) {
          // SHOT 6: Tight OTS Reverse Shot on Senior squinting apologetically!
          camera.fov = 32; camera.updateProjectionMatrix();
          camera.position.set(0.12, 1.62, pathZ + 1.55);
          camera.lookAt(1.22, 1.56, pathZ);
        } else if (time < 48.8) {
          // SHOT 7: Direct-to-Camera Reaction Close-Up (Rohan) -> Tracks toward Canteen Door!
          camera.fov = time < 44.5 ? 28 : 38; camera.updateProjectionMatrix();
          const push = smooth((time - 39.1) / 2.0);
          camera.position.set(lerp(0.15, 0.0, push), 1.56, pathZ + (time < 44.5 ? 1.45 : 2.9));
          camera.lookAt(time < 44.5 ? 0.52 : 0.1, 1.48, pathZ);
        } else if (time < 50.2) {
          // SHOT 8: Door Frame Impact Tight Cut (SLAP 3 - Object!)
          camera.fov = 34; camera.updateProjectionMatrix();
          const shake = (time - s3 >= 0 && time - s3 < 0.35) ? Math.sin(time * 65) * 0.06 : 0;
          camera.position.set(0.2 + shake, 1.58, pathZ + 1.75);
          camera.lookAt(0.65, 1.5, pathZ);
        } else if (time < 56.0) {
          // SHOT 9: Close-Up on Aarav laughing directly into camera + Laugh Pause 3!
          camera.fov = 29; camera.updateProjectionMatrix();
          camera.position.set(-0.28, 1.56, pathZ + 1.45);
          camera.lookAt(-0.55, 1.52, pathZ);
        } else if (time < 63.2) {
          // SHOT 10: Continuous Walk out into Open-Air Canteen + Overhead Monkey reveal!
          camera.fov = 40; camera.updateProjectionMatrix();
          camera.position.set(0.0, 1.62, pathZ + 3.15);
          camera.lookAt(0.1, 1.58, pathZ);
        } else if (time < 64.5) {
          // SHOT 11: SLAP 4 Whip Shot (Monkey Paw Slap from above!)
          camera.fov = 34; camera.updateProjectionMatrix();
          const shake = (time - s4 >= 0 && time - s4 < 0.35) ? Math.sin(time * 70) * 0.07 : 0;
          camera.position.set(0.15 + shake, 1.72, pathZ + 1.9);
          camera.lookAt(0.6, 1.72, pathZ);
        } else if (time < 72.9) {
          // SHOT 12: Direct-to-Camera Hero Close-Up on Rohan's Red Cheek + Laugh Pause 4!
          camera.fov = 26; camera.updateProjectionMatrix();
          camera.position.set(0.55, 1.58, pathZ + 1.25);
          camera.lookAt(0.55, 1.52, pathZ);
        } else if (time < 82.2) {
          // SHOT 13: Aarav Direct-to-Camera Finale -> Wide Two-Shot on Canteen Table + Applause!
          const p = smooth((time - 77.0) / 2.2);
          camera.fov = lerp(28, 40, p); camera.updateProjectionMatrix();
          camera.position.set(lerp(-0.52, 0.0, p), 1.58, pathZ + lerp(1.35, 3.3, p));
          camera.lookAt(lerp(-0.55, 0.0, p), 1.48, pathZ);
        } else {
          // SHOT 14: High Crane Pull-Back over Campus Canteen
          const p = smooth((time - 82.2) / 3.8);
          camera.fov = 42; camera.updateProjectionMatrix();
          camera.position.set(0.0, lerp(1.6, 3.6, p), pathZ + lerp(3.3, 6.2, p));
          camera.lookAt(0.0, 1.35, pathZ);
        }
      }

      renderer.render(scene, camera);
    };

    Campus3D.ready = ready;
    Campus3D.camera = camera;
    Campus3D.scene = scene;
    Campus3D.renderer = renderer;
    return Campus3D;
  };

  root.Campus3D = Campus3D;
})(typeof window !== 'undefined' ? window : this);
