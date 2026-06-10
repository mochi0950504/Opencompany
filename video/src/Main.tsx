import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import timings from './timings.json';
import {Scene0} from './scenes/Scene0';
import {Scene1} from './scenes/Scene1';
import {Scene2} from './scenes/Scene2';
import {Scene3} from './scenes/Scene3';
import {Scene4} from './scenes/Scene4';
import {Scene5} from './scenes/Scene5';
import {Scene6} from './scenes/Scene6';

const TAIL = 30; // breathing room after each narration segment
const END_TAIL = 120; // longer hold on the end card

type SceneDef = {
  key: keyof typeof timings.segments;
  Comp: React.FC<{durationInFrames: number}>;
};

const SCENES: SceneDef[] = [
  {key: 's0', Comp: Scene0},
  {key: 's1', Comp: Scene1},
  {key: 's2', Comp: Scene2},
  {key: 's3', Comp: Scene3},
  {key: 's4', Comp: Scene4},
  {key: 's5', Comp: Scene5},
  {key: 's6', Comp: Scene6},
];

export const sceneDuration = (key: keyof typeof timings.segments): number =>
  timings.segments[key].frames + (key === 's6' ? END_TAIL : TAIL);

export const totalDuration = SCENES.reduce((acc, s) => acc + sceneDuration(s.key), 0);

export const Main: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0B1220'}}>
    <Audio src={staticFile('audio/pad.wav')} volume={0.14} />
    <Series>
      {SCENES.map(({key, Comp}) => (
        <Series.Sequence key={key} durationInFrames={sceneDuration(key)}>
          <Audio src={staticFile(`audio/${key}.mp3`)} />
          <Comp durationInFrames={sceneDuration(key)} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
