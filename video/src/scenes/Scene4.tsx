import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, Chip, FadeUp, H1, Panel, Pop, SceneShell, SourceTag, Sub} from '../ui';

const Stage1: React.FC = () => (
  <AbsoluteFill>
    <FadeUp delay={8}>
      <H1 size={64}>
        別急著開公司——先<span style={{color: C.teal}}>接案賺到第一筆</span>
      </H1>
    </FadeUp>
    <FadeUp delay={70} style={{marginTop: 50}}>
      <Panel style={{borderColor: C.teal, maxWidth: 1280, position: 'relative', paddingBottom: 58}}>
        <div style={{fontSize: 46, fontWeight: 900}}>
          階段 ①　個人接案／行號
        </div>
        <div style={{fontSize: 34, color: C.sub, marginTop: 18, lineHeight: 1.6}}>
          2025 年起，月營業額在起徵點以下<b style={{color: C.text}}>免課營業稅</b>：
        </div>
        <div style={{display: 'flex', gap: 26, marginTop: 26}}>
          <Chip color={C.green} style={{fontSize: 36, padding: '12px 32px'}}>
            賣貨：月銷 10 萬以下
          </Chip>
          <Chip color={C.green} style={{fontSize: 36, padding: '12px 32px'}}>
            服務：月銷 5 萬以下
          </Chip>
        </div>
        <SourceTag>財政部・2025-01-01 起調高起徵點（仍須稅籍登記）</SourceTag>
      </Panel>
    </FadeUp>
  </AbsoluteFill>
);

const Signals: React.FC = () => (
  <AbsoluteFill>
    <FadeUp delay={6}>
      <H1 size={60}>出現這三個訊號，再升級</H1>
    </FadeUp>
    <div style={{display: 'flex', gap: 30, marginTop: 46}}>
      {['企業客戶要發票', '獲利穩定上升', '賠償・債務風險'].map((t, i) => (
        <FadeUp key={t} delay={50 + i * 60} style={{flex: 1}}>
          <Panel style={{textAlign: 'center', borderColor: C.amber}}>
            <div style={{fontSize: 40, fontWeight: 900}}>{t}</div>
          </Panel>
        </FadeUp>
      ))}
    </div>
    <Pop delay={250} style={{marginTop: 54}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
        <div style={{fontSize: 70, fontWeight: 900, color: C.sub}}>↓</div>
        <div style={{fontSize: 56, fontWeight: 900}}>
          階段 ②　<span style={{color: C.amber}}>一人有限公司</span>
        </div>
        <Chip style={{fontSize: 30}}>公司法 98 條・無最低資本額</Chip>
      </div>
    </Pop>
  </AbsoluteFill>
);

const TimeNode: React.FC<{delay: number; step: string; cost: string; last?: boolean}> = ({
  delay,
  step,
  cost,
  last,
}) => (
  <FadeUp delay={delay} style={{flex: 1, display: 'flex', alignItems: 'center', gap: 18}}>
    <div style={{flex: 1}}>
      <Panel
        style={{
          textAlign: 'center',
          padding: '30px 16px',
          borderColor: last ? C.green : C.line,
          background: last ? '#0E2A22' : C.panel,
        }}
      >
        <div style={{fontSize: 34, fontWeight: 900}}>{step}</div>
        <div style={{fontSize: 30, color: last ? C.green : C.amber, fontWeight: 900, marginTop: 10}}>
          {cost}
        </div>
      </Panel>
    </div>
    {last ? null : <div style={{fontSize: 44, color: C.sub, fontWeight: 900}}>→</div>}
  </FadeUp>
);

const Steps: React.FC = () => (
  <AbsoluteFill>
    <FadeUp delay={6}>
      <H1 size={60}>
        全程線上辦，<span style={{color: C.green}}>一到兩週</span>
      </H1>
      <Sub style={{marginTop: 10}}>經濟部一站式：onestop.nat.gov.tw</Sub>
    </FadeUp>
    <div style={{display: 'flex', alignItems: 'stretch', gap: 18, marginTop: 60}}>
      <TimeNode delay={60} step="名稱預查" cost="NT$150" />
      <TimeNode delay={130} step="設立登記" cost="NT$700" />
      <TimeNode delay={200} step="會計師驗資" cost="NT$2–4 千" />
      <TimeNode delay={270} step="完成・領統編" cost="1–2 週" last />
    </div>
    <FadeUp delay={340} style={{marginTop: 44}}>
      <Sub style={{fontSize: 28}}>
        ＊線上規費・資本額 400 萬以下適用最低登記費；驗資為市場行情
      </Sub>
    </FadeUp>
  </AbsoluteFill>
);

const Tax: React.FC = () => (
  <AbsoluteFill>
    <FadeUp delay={6}>
      <H1 size={60}>稅，記兩個數字</H1>
    </FadeUp>
    <div style={{display: 'flex', gap: 40, marginTop: 44}}>
      <FadeUp delay={60} style={{flex: 1}}>
        <Panel style={{borderColor: C.teal, textAlign: 'center', padding: '44px 30px'}}>
          <div style={{fontSize: 40, fontWeight: 900, color: C.sub}}>有限公司</div>
          <div style={{fontSize: 108, fontWeight: 900, color: C.teal, marginTop: 10}}>20%</div>
          <div style={{fontSize: 30, color: C.sub}}>營所稅・課稅所得 12 萬以下免徵</div>
        </Panel>
      </FadeUp>
      <FadeUp delay={140} style={{flex: 1}}>
        <Panel style={{borderColor: C.amber, textAlign: 'center', padding: '44px 30px'}}>
          <div style={{fontSize: 40, fontWeight: 900, color: C.sub}}>行號（獨資）</div>
          <div style={{fontSize: 108, fontWeight: 900, color: C.amber, marginTop: 10}}>5–40%</div>
          <div style={{fontSize: 30, color: C.sub}}>盈餘併入個人綜所稅・累進</div>
        </Panel>
      </FadeUp>
    </div>
    <FadeUp delay={240} style={{marginTop: 48, textAlign: 'center'}}>
      <H1 size={54}>
        獲利越高，<span style={{color: C.teal}}>越該開公司</span>
      </H1>
    </FadeUp>
  </AbsoluteFill>
);

export const Scene4: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
  <SceneShell
    sceneIndex={4}
    kicker="第三步"
    title="在台灣把公司開起來（但別急）"
    durationInFrames={durationInFrames}
  >
    <Sequence durationInFrames={390}>
      <Stage1 />
    </Sequence>
    <Sequence from={390} durationInFrames={240}>
      <Signals />
    </Sequence>
    <Sequence from={630} durationInFrames={390}>
      <Steps />
    </Sequence>
    <Sequence from={1020}>
      <Tax />
    </Sequence>
  </SceneShell>
);
