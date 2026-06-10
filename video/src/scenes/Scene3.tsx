import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, Chip, FadeUp, H1, Panel, Pop, SceneShell, SourceTag, Sub} from '../ui';

const CaseCard: React.FC<{
  name: string;
  badges: string[];
  big: string;
  bigColor?: string;
  sub: string;
  source: string;
}> = ({name, badges, big, bigColor = C.green, sub, source}) => (
  <AbsoluteFill>
    <FadeUp delay={8}>
      <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
        <div
          style={{
            background: C.panelLight,
            border: `2px solid ${C.line}`,
            borderRadius: 20,
            padding: '12px 34px',
            fontSize: 56,
            fontWeight: 900,
            color: C.teal,
          }}
        >
          {name}
        </div>
      </div>
    </FadeUp>
    <div style={{display: 'flex', gap: 22, marginTop: 34, flexWrap: 'wrap'}}>
      {badges.map((b, i) => (
        <FadeUp key={b} delay={60 + i * 45}>
          <Chip color={C.sub} style={{fontSize: 30, color: C.text, borderColor: C.line}}>
            {b}
          </Chip>
        </FadeUp>
      ))}
    </div>
    <Pop delay={210}>
      <div style={{fontSize: 120, fontWeight: 900, color: bigColor, marginTop: 46, lineHeight: 1.1}}>
        {big}
      </div>
    </Pop>
    <FadeUp delay={280}>
      <Sub style={{marginTop: 18, fontSize: 36}}>{sub}</Sub>
    </FadeUp>
    <SourceTag style={{bottom: -10}}>{source}</SourceTag>
  </AbsoluteFill>
);

const Quote: React.FC = () => (
  <AbsoluteFill style={{justifyContent: 'center'}}>
    <FadeUp delay={10}>
      <div style={{fontSize: 130, color: C.amber, fontWeight: 900, lineHeight: 0.6}}>“</div>
      <H1 size={66} style={{maxWidth: 1480, marginTop: 20}}>
        第一家「<span style={{color: C.amber}}>一人十億美元公司</span>」，
        會在哪一年出現？
      </H1>
      <Sub style={{marginTop: 30, fontSize: 36}}>
        ——科技圈 CEO 群組裡的賭盤・Sam Altman
      </Sub>
    </FadeUp>
    <FadeUp delay={140} style={{marginTop: 50}}>
      <Chip color={C.sub} style={{fontSize: 28, color: C.sub}}>
        截至 2026 年中尚未發生——但門檻每年都在下降
      </Chip>
    </FadeUp>
    <SourceTag style={{bottom: -10}}>Fortune 2024-02・談話性質，非預測數據</SourceTag>
  </AbsoluteFill>
);

const ToolRow: React.FC<{delay: number; name: string; price: string}> = ({delay, name, price}) => (
  <FadeUp delay={delay}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 38,
        fontWeight: 700,
        padding: '20px 8px',
        borderBottom: `2px dashed ${C.line}`,
      }}
    >
      <div>{name}</div>
      <div style={{color: C.sub}}>{price}</div>
    </div>
  </FadeUp>
);

const Tools: React.FC = () => (
  <AbsoluteFill style={{flexDirection: 'row', gap: 80, alignItems: 'center'}}>
    <Panel style={{width: 820, position: 'relative', paddingBottom: 60}}>
      <div style={{fontSize: 34, fontWeight: 900, color: C.sub, marginBottom: 8}}>
        你的「全公司」每月帳單
      </div>
      <ToolRow delay={30} name="寫程式（AI 編程工具）" price="$20–200" />
      <ToolRow delay={80} name="行銷內容（生成工具）" price="$20–50" />
      <ToolRow delay={130} name="客服／自動化" price="$20–50" />
      <FadeUp delay={190}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 50,
            fontWeight: 900,
            paddingTop: 30,
          }}
        >
          <div>合計</div>
          <div style={{color: C.green}}>≈ $100–300／月</div>
        </div>
      </FadeUp>
      <SourceTag>估算值・2026 年中行情</SourceTag>
    </Panel>
    <FadeUp delay={240} style={{flex: 1}}>
      <H1 size={64} style={{lineHeight: 1.4}}>
        從點子到可用產品：
        <br />
        <span style={{color: C.teal}}>數天</span>，不是數月
      </H1>
      <Sub style={{marginTop: 28, fontSize: 34}}>
        最快的現金流：先接案・先服務，再產品化
      </Sub>
    </FadeUp>
  </AbsoluteFill>
);

export const Scene3: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
  <SceneShell
    sceneIndex={3}
    kicker="真實案例"
    title="這條路有人走通了（口徑已標注）"
    durationInFrames={durationInFrames}
  >
    <Sequence durationInFrames={450}>
      <CaseCard
        name="base44"
        badges={['獨資・零外部融資', '成立 6 個月', '全公司不到 10 人', 'AI 建站工具']}
        big="US$80M 現金收購"
        sub="Wix 收購・達標後另有 US$90M——當月淨利 18.9 萬美元（創辦人自報）"
        source="TechCrunch 2025-06・Calcalist"
      />
    </Sequence>
    <Sequence from={450} durationInFrames={345}>
      <CaseCard
        name="Cal AI"
        badges={['17 歲高中生創辦', '現成 AI 模型＋RAG', '上線不到 2 年']}
        big="年營收 US$30M+"
        bigColor={C.amber}
        sub="2025-12 售予 MyFitnessPal（金額未披露）・創辦人自稱 ARR 已破 US$50M"
        source="TechCrunch 2026-03・營收為自報口徑"
      />
    </Sequence>
    <Sequence from={795} durationInFrames={270}>
      <Quote />
    </Sequence>
    <Sequence from={1065}>
      <Tools />
    </Sequence>
  </SceneShell>
);
