import React from 'react';
import {AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Chip, FadeUp, H1, HBar, Panel, Pop, SceneShell, SourceTag, Stamp, Sub, useCount} from '../ui';

const Spend: React.FC = () => {
  const v = useCount(115, 370, 70, 240);
  return (
    <AbsoluteFill>
      <FadeUp delay={10}>
        <Sub style={{fontSize: 36}}>2025 全球企業・生成式 AI 支出</Sub>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 36, marginTop: 6}}>
          <div style={{fontSize: 150, fontWeight: 900, color: C.teal, lineHeight: 1.1}}>
            {Math.round(v)}
            <span style={{fontSize: 70}}> 億美元</span>
          </div>
          <Pop delay={250}>
            <Chip color={C.amber} style={{fontSize: 34, fontWeight: 900}}>
              一年 ×3.2
            </Chip>
          </Pop>
        </div>
      </FadeUp>
      <FadeUp delay={330} style={{marginTop: 40}}>
        <Panel style={{position: 'relative', paddingBottom: 56}}>
          <div style={{fontSize: 34, fontWeight: 900, marginBottom: 26, color: C.sub}}>
            錢流向哪些應用？（億美元/年）
          </div>
          <HBar label="程式開發" value="40 億" pct={96} delay={400} />
          <HBar label="垂直行業" value="35 億" pct={84} delay={460} />
          <HBar label="行銷內容" value="6.6 億" pct={18} delay={520} color={C.amber} />
          <HBar label="客服" value="6.3 億" pct={17} delay={560} color={C.amber} />
          <SourceTag>Menlo Ventures 2025・市場估計值</SourceTag>
        </Panel>
      </FadeUp>
    </AbsoluteFill>
  );
};

const Donut: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 50}});
  const R = 150;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{position: 'relative', width: 380, height: 380}}>
      <svg width={380} height={380}>
        <circle cx={190} cy={190} r={R} stroke={C.line} strokeWidth={42} fill="none" />
        <circle
          cx={190}
          cy={190}
          r={R}
          stroke={C.amber}
          strokeWidth={42}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ * 0.074 * p} ${circ}`}
          transform="rotate(-90 190 190)"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{fontSize: 86, fontWeight: 900, color: C.amber}}>7.4%</div>
        <div style={{fontSize: 27, color: C.sub, textAlign: 'center'}}>
          已導入或規劃中
        </div>
      </div>
    </div>
  );
};

const Taiwan: React.FC = () => (
  <AbsoluteFill>
    <FadeUp delay={8}>
      <H1 size={64}>
        真正的機會，在<span style={{color: C.amber}}>台灣自己家裡</span>
      </H1>
      <Sub style={{marginTop: 8}}>中小企業 AI 導入現況（1,207 家有效樣本）</Sub>
    </FadeUp>
    <div style={{display: 'flex', alignItems: 'center', gap: 80, marginTop: 40}}>
      <FadeUp delay={40}>
        <Donut delay={50} />
      </FadeUp>
      <div style={{flex: 1}}>
        <FadeUp delay={150}>
          <Panel style={{marginBottom: 28, borderColor: C.amber}}>
            <div style={{fontSize: 60, fontWeight: 900, color: C.amber}}>63.9%</div>
            <div style={{fontSize: 36, fontWeight: 700}}>「不知道 AI 要用在哪」</div>
          </Panel>
        </FadeUp>
        <FadeUp delay={260}>
          <Panel style={{borderColor: C.teal}}>
            <div style={{fontSize: 60, fontWeight: 900, color: C.teal}}>84.5%</div>
            <div style={{fontSize: 36, fontWeight: 700}}>沒有 AI 人才</div>
          </Panel>
        </FadeUp>
      </div>
    </div>
    <SourceTag style={{bottom: -10}}>中小企業署委託工研院・2025 調查</SourceTag>
  </AbsoluteFill>
);

const RouteCard: React.FC<{delay: number; n: string; title: string; desc: string}> = ({
  delay,
  n,
  title,
  desc,
}) => (
  <FadeUp delay={delay} style={{flex: 1}}>
    <Panel style={{height: 330, borderColor: C.teal}}>
      <div style={{fontSize: 56, fontWeight: 900, color: C.teal}}>{n}</div>
      <div style={{fontSize: 42, fontWeight: 900, marginTop: 14, lineHeight: 1.3}}>{title}</div>
      <div style={{fontSize: 29, color: C.sub, marginTop: 16, lineHeight: 1.5}}>{desc}</div>
    </Panel>
  </FadeUp>
);

const Routes: React.FC = () => (
  <AbsoluteFill>
    <FadeUp delay={6}>
      <H1 size={62}>
        三條<span style={{color: C.teal}}>低資本</span>路線
      </H1>
    </FadeUp>
    <div style={{display: 'flex', gap: 34, marginTop: 36}}>
      <RouteCard delay={40} n="①" title="AI 導入顧問" desc="幫店家與中小企業盤點用例、代建落地——接案就能開始" />
      <RouteCard delay={110} n="②" title="垂直流程自動化" desc="會計・法律・電商後台的文件與流程，ROI 算得出來" />
      <RouteCard delay={180} n="③" title="行銷・客服小工具" desc="企業部門已被驗證願意付費的兩個類別" />
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 50, marginTop: 44}}>
      <Panel style={{opacity: 0.55, flex: 1, padding: '22px 40px'}}>
        <div style={{fontSize: 38, fontWeight: 700, color: C.sub}}>通用聊天助理／大眾消費 App</div>
      </Panel>
      <div style={{width: 380}}>
        <Stamp delay={400} rotate={-6} style={{fontSize: 46}}>
          巨頭戰場・避開
        </Stamp>
      </div>
    </div>
  </AbsoluteFill>
);

export const Scene1: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
  <SceneShell
    sceneIndex={1}
    kicker="第一步"
    title="選一個剛需戰場"
    durationInFrames={durationInFrames}
  >
    <Sequence durationInFrames={710}>
      <Spend />
    </Sequence>
    <Sequence from={710} durationInFrames={460}>
      <Taiwan />
    </Sequence>
    <Sequence from={1170}>
      <Routes />
    </Sequence>
  </SceneShell>
);
