import React, { useRef, useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Audio, staticFile } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

// 3D Scene Components
import { ApartmentScene } from './components/ApartmentScene';
import { LeoCharacter } from './components/LeoCharacter';
import { ChipDrone } from './components/ChipDrone';
import { Dishwasher3D } from './components/Dishwasher3D';
import { SubtitleOverlay } from './components/SubtitleOverlay';

export const Main3DComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  // Camera Director Timeline
  const cameraProps = useMemo(() => {
    // Shot 1: Establishing wide shot (0 - 4.5s)
    if (time < 4.5) {
      const progress = time / 4.5;
      const x = interpolate(progress, [0, 1], [-2, 0]);
      const y = interpolate(progress, [0, 1], [3, 2.8]);
      const z = interpolate(progress, [0, 1], [9, 8.2]);
      return { position: [x, y, z] as [number, number, number], lookAt: [0, 1.8, 0] as [number, number, number], fov: 45 };
    }
    // Shot 2: Close-up on Leo (4.5 - 9.5s)
    if (time < 9.5) {
      const progress = (time - 4.5) / 5.0;
      const z = interpolate(progress, [0, 1], [4.5, 3.8]);
      return { position: [-1.4, 2.3, z] as [number, number, number], lookAt: [-1.8, 2.1, 0] as [number, number, number], fov: 40 };
    }
    // Shot 3: Close-up on Chip + Holo charts (9.5 - 16.0s)
    if (time < 16.0) {
      const progress = (time - 9.5) / 6.5;
      const x = interpolate(progress, [0, 1], [1.8, 2.1]);
      return { position: [x, 2.4, 4.0] as [number, number, number], lookAt: [1.8, 2.2, 0] as [number, number, number], fov: 42 };
    }
    // Shot 4: Over the shoulder medium two-shot (16.0 - 21.0s)
    if (time < 21.0) {
      return { position: [-0.5, 2.5, 5.8] as [number, number, number], lookAt: [0.2, 2.0, 0] as [number, number, number], fov: 44 };
    }
    // Shot 5: Hero low angle on Chip (21.0 - 26.5s)
    if (time < 26.5) {
      const progress = (time - 21.0) / 5.5;
      const y = interpolate(progress, [0, 1], [1.2, 1.5]);
      return { position: [1.6, y, 3.5] as [number, number, number], lookAt: [1.8, 2.4, 0] as [number, number, number], fov: 48 };
    }
    // Shot 6: Wide punchline & freeze frame (26.5 - 28.8s)
    return { position: [0, 2.6, 7.5] as [number, number, number], lookAt: [0, 1.9, 0] as [number, number, number], fov: 45 };
  }, [time]);

  return (
    <div style={{ flex: 1, backgroundColor: '#0d1117', position: 'relative' }}>
      <ThreeCanvas
        width={1080}
        height={1920}
        camera={{ position: cameraProps.position, fov: cameraProps.fov }}
      >
        <ambientLight intensity={0.4} color="#a0b0d0" />
        <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow color="#ffffff" />
        <pointLight position={[-3, 4, 2]} intensity={1.5} color="#00f0ff" distance={10} />
        <pointLight position={[3, 4, 2]} intensity={1.5} color="#ff007f" distance={10} />

        <ApartmentScene time={time} />
        <LeoCharacter time={time} />
        <ChipDrone time={time} />
        <Dishwasher3D time={time} />
      </ThreeCanvas>

      <SubtitleOverlay time={time} />
      <Audio src={staticFile('master_audio.wav')} />
    </div>
  );
};
