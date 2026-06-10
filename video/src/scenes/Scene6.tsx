import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, CheckItem, Chip, FadeUp, H1, SceneShell, Sub} from '../ui';

const Checklist: React.FC = () => (
  <AbsoluteFill>
    <div style={{maxWidth: 1300}}>
      <CheckItem delay={50} title="本週：訪談 10 個目標客戶" desc="只問過去怎麼解決、花了多少錢" />
      <CheckItem delay={170} title="下週：上線一頁式網站，開始預售" desc="幾千元廣告測真需求" />
      <CheckItem delay={300} title="收到第一筆訂金，才開始開發" desc="有代價的承諾＝唯一算數的驗證" />
      <CheckItem delay={430} title="月營收穩定，再開有限公司" desc="先行號後公司・獲利越高越該開" />
    </div>
    <FadeUp delay={560} style={{marginTop: 30}}>
      <H1 size={64}>
        創業 ＝ <span style={{color: C.teal}}>一連串便宜的小實驗</span>
      </H1>
      <Sub style={{marginTop: 16, fontSize: 36}}>五年後還站著的那一半人，希望有你。</Sub>
    </FadeUp>
  </AbsoluteFill>
);

const EndCard: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <FadeUp delay={8}>
      <H1 size={84} style={{textAlign: 'center'}}>
        AI 時代，一個人怎麼開公司？
      </H1>
    </FadeUp>
    <FadeUp delay={40} style={{marginTop: 40, textAlign: 'center'}}>
      <Sub style={{fontSize: 32}}>本片所有數據經 3 票對抗式查核・自報/估計/相關性已逐一標注</Sub>
      <div style={{marginTop: 24}}>
        <Chip color={C.sub} style={{fontSize: 28, color: C.sub}}>
          資料來源與查核紀錄：research/REPORT.md
        </Chip>
      </div>
    </FadeUp>
  </AbsoluteFill>
);

export const Scene6: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
  <SceneShell
    sceneIndex={6}
    kicker="行動清單"
    title="關掉影片之後，做這四件事"
    durationInFrames={durationInFrames}
  >
    <Sequence durationInFrames={700}>
      <Checklist />
    </Sequence>
    <Sequence from={700}>
      <EndCard />
    </Sequence>
  </SceneShell>
);
