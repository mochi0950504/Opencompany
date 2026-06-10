import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, Chip, FadeUp, H1, Panel, Pop, SceneShell, SourceTag, Sub} from '../ui';

const Circle: React.FC<{
  delay: number;
  pct: string;
  label: string;
  tag: string;
  color: string;
}> = ({delay, pct, label, tag, color}) => (
  <Pop delay={delay}>
    <div
      style={{
        width: 420,
        height: 420,
        borderRadius: '50%',
        border: `10px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#10192EDD',
      }}
    >
      <div style={{fontSize: 110, fontWeight: 900, color}}>{pct}</div>
      <div style={{fontSize: 38, fontWeight: 700, textAlign: 'center', lineHeight: 1.35}}>{label}</div>
      <Chip color={color} style={{marginTop: 16, fontSize: 26}}>
        {tag}
      </Chip>
    </div>
  </Pop>
);

const Reasons: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 60, marginTop: 30}}>
      <Circle delay={40} pct="70%" label={'說「錢燒完了」'} tag="那是結果" color={C.red} />
      <Pop delay={150}>
        <div style={{fontSize: 90, color: C.sub, fontWeight: 900}}>→</div>
      </Pop>
      <Circle delay={170} pct="43%" label="做了沒人要的東西" tag="這才是根因" color={C.amber} />
    </div>
    <SourceTag style={{bottom: -16}}>CB Insights 2025・431 家倒閉的 VC 新創・可複選</SourceTag>
  </AbsoluteFill>
);

const LoopNode: React.FC<{delay: number; text: string; color?: string}> = ({delay, text, color = C.teal}) => (
  <FadeUp delay={delay} style={{flex: 1}}>
    <Panel style={{borderColor: color, textAlign: 'center', padding: '40px 24px'}}>
      <div style={{fontSize: 40, fontWeight: 900}}>{text}</div>
    </Panel>
  </FadeUp>
);

const Scientific: React.FC = () => (
  <AbsoluteFill>
    <FadeUp delay={6}>
      <H1 size={62}>
        像<span style={{color: C.teal}}>科學家</span>一樣創業
      </H1>
    </FadeUp>
    <div style={{display: 'flex', alignItems: 'center', gap: 28, marginTop: 60}}>
      <LoopNode delay={50} text="寫下假設" />
      <FadeUp delay={90}>
        <div style={{fontSize: 60, color: C.sub, fontWeight: 900}}>→</div>
      </FadeUp>
      <LoopNode delay={110} text="最便宜的實驗" />
      <FadeUp delay={150}>
        <div style={{fontSize: 60, color: C.sub, fontWeight: 900}}>→</div>
      </FadeUp>
      <LoopNode delay={170} text={'依證據：砍掉 or 加碼'} color={C.amber} />
    </div>
    <FadeUp delay={230} style={{marginTop: 56}}>
      <Chip color={C.green} style={{fontSize: 32, padding: '12px 30px'}}>
        隨機對照實驗證實：這樣做，更快砍掉壞點子
      </Chip>
      <SourceTag style={{position: 'relative', display: 'block', marginTop: 18, right: 0}}>
        Camuffo et al.・Management Science 2020・759 家公司複現（2024）
      </SourceTag>
    </FadeUp>
  </AbsoluteFill>
);

const Bubble: React.FC<{
  delay: number;
  good?: boolean;
  children: React.ReactNode;
  sub: string;
}> = ({delay, good, children, sub}) => (
  <FadeUp delay={delay}>
    <div
      style={{
        background: good ? '#0E2A22' : '#2A1216',
        border: `3px solid ${good ? C.green : C.red}`,
        borderRadius: 28,
        padding: '30px 44px',
        maxWidth: 1100,
      }}
    >
      <div style={{fontSize: 46, fontWeight: 900}}>
        {good ? '✅ ' : '❌ '}
        {children}
      </div>
      <div style={{fontSize: 28, color: C.sub, marginTop: 10}}>{sub}</div>
    </div>
  </FadeUp>
);

const MomTest: React.FC = () => (
  <AbsoluteFill>
    <FadeUp delay={6}>
      <H1 size={62}>訪談只有一條鐵則</H1>
    </FadeUp>
    <div style={{display: 'flex', flexDirection: 'column', gap: 36, marginTop: 50}}>
      <Bubble delay={40} sub="假設性問題——對方會客氣地騙你">「你會買嗎？」</Bubble>
      <Bubble delay={130} good sub="過去的行為與付出的代價，不會說謊">
        「上次遇到這問題，你花了多少錢解決？」
      </Bubble>
    </div>
    <SourceTag style={{bottom: -10}}>The Mom Test・Rob Fitzpatrick</SourceTag>
  </AbsoluteFill>
);

const Deposit: React.FC = () => (
  <AbsoluteFill>
    <Pop delay={20}>
      <div
        style={{
          background: '#1A2740',
          border: `2px solid ${C.line}`,
          borderRadius: 26,
          padding: '28px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 30,
          maxWidth: 980,
          boxShadow: '0 18px 60px #00000066',
        }}
      >
        <div style={{fontSize: 64}}>💰</div>
        <div>
          <div style={{fontSize: 30, color: C.sub}}>入帳通知・剛剛</div>
          <div style={{fontSize: 44, fontWeight: 900}}>
            收到訂金 <span style={{color: C.green}}>NT$3,000</span>
          </div>
        </div>
      </div>
    </Pop>
    <FadeUp delay={110} style={{marginTop: 56}}>
      <H1 size={60}>
        唯一算數的驗證：<span style={{color: C.amber}}>有代價的承諾</span>
      </H1>
      <div style={{display: 'flex', gap: 24, marginTop: 34}}>
        <Chip style={{fontSize: 34}}>訂金</Chip>
        <Chip style={{fontSize: 34}}>預購</Chip>
        <Chip style={{fontSize: 34}}>簽約</Chip>
        <Chip color={C.sub} style={{fontSize: 34}}>
          口頭讚美 = 0
        </Chip>
      </div>
      <Sub style={{marginTop: 40, fontSize: 34}}>
        一頁式網站＋幾千元廣告費 ＝ <span style={{color: C.teal, fontWeight: 900}}>一個星期測完</span>
      </Sub>
    </FadeUp>
  </AbsoluteFill>
);

export const Scene2: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
  <SceneShell
    sceneIndex={2}
    kicker="第二步"
    title="先驗證，再開發"
    durationInFrames={durationInFrames}
  >
    <Sequence durationInFrames={370}>
      <Reasons />
    </Sequence>
    <Sequence from={370} durationInFrames={270}>
      <Scientific />
    </Sequence>
    <Sequence from={640} durationInFrames={265}>
      <MomTest />
    </Sequence>
    <Sequence from={905}>
      <Deposit />
    </Sequence>
  </SceneShell>
);
