import { Composition } from 'remotion';
import { Main3DComposition } from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TheLocalhost3D"
        component={Main3DComposition}
        durationInFrames={864} // 28.8 seconds at 30 fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "The Dish Dilemma",
          episode: 1,
        }}
      />
    </>
  );
};
