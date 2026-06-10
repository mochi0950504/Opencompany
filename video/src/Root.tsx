import React from 'react';
import {Composition} from 'remotion';
import {Main, totalDuration} from './Main';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Main"
    component={Main}
    durationInFrames={totalDuration}
    fps={30}
    width={1920}
    height={1080}
  />
);
