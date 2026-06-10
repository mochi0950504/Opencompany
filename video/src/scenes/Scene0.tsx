import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {C, Chip, FadeUp, H1, HBar, Panel, SceneShell, SourceTag, Stamp, Sub} from '../ui';

const Myth: React.FC = () => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [250, 280], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dim = interpolate(frame, [250, 290], [1, 0.45], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{flexDirection: 'row', gap: 70, alignItems: 'center'}}>
      <div style={{width: 700, position: 'relative'}}>
        <div style={{opacity: dim}}>
          <div
            style={{
              fontSize: 300,
              fontWeight: 900,
              color: C.red,
              lineHeight: 1,
              letterSpacing: -8,
            }}
          >
            90%
          </div>
          <div style={{fontSize: 52, fontWeight: 700, marginTop: 10}}>
            的創業都會失敗<span style={{color: C.sub}}>？</span>
          </div>
          <div
            style={{
              position: 'absolute',
              top: 150,
              left: 0,
              width: `${strike * 5.6}px`,
              maxWidth: 560,
              height: 14,
              background: C.text,
              borderRadius: 7,
              transform: 'rotate(-7deg)',
            }}
          />
        </div>
        <div style={{position: 'absolute', top: 60, left: 120}}>
          <Stamp delay={235}>查無出處</Stamp>
        </div>
      </div>
      <div style={{flex: 1}}>
        <FadeUp delay={320}>
          <Panel style={{position: 'relative', paddingBottom: 56}}>
            <div style={{fontSize: 36, fontWeight: 900, marginBottom: 28}}>
              真實數據：新事業存活率
            </div>
            <HBar label="第 1 年" value="78%" pct={78} delay={360} />
            <HBar label="第 5 年" value="51%" pct={51} delay={400} />
            <HBar label="第 10 年" value="35%" pct={35} delay={440} color={C.amber} />
            <SourceTag>美國 BLS・事業體口徑・「關閉」不等於賠錢倒閉</SourceTag>
          </Panel>
        </FadeUp>
        <FadeUp delay={500} style={{marginTop: 30}}>
          <Chip color={C.green} style={{fontSize: 32, padding: '12px 30px'}}>
            台灣官方：5 年存活率約 57–69%（經濟部）
          </Chip>
        </FadeUp>
      </div>
    </AbsoluteFill>
  );
};

const Title: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <FadeUp delay={5}>
      <Chip color={C.amber} style={{fontSize: 30}}>
        5 分鐘・有數據・有案例・台灣場景
      </Chip>
    </FadeUp>
    <FadeUp delay={18}>
      <H1 size={108} style={{marginTop: 40, textAlign: 'center'}}>
        AI 時代，
        <br />
        一個人怎麼開公司？
      </H1>
    </FadeUp>
    <FadeUp delay={34}>
      <Sub style={{marginTop: 36, fontSize: 38}}>
        創業不是賭命，是一連串<span style={{color: C.amber, fontWeight: 900}}>可以練習的決策</span>
      </Sub>
    </FadeUp>
  </AbsoluteFill>
);

export const Scene0: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
  <SceneShell
    sceneIndex={0}
    kicker="開場"
    title="關於創業，最流行的數字是假的"
    durationInFrames={durationInFrames}
  >
    <Sequence durationInFrames={655}>
      <Myth />
    </Sequence>
    <Sequence from={655}>
      <Title />
    </Sequence>
  </SceneShell>
);
