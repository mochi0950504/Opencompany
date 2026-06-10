import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, Chip, FadeUp, H1, Panel, Pop, SceneShell, SourceTag, Sub, useCount} from '../ui';

const TechHead: React.FC<{n: string; title: string}> = ({n, title}) => (
  <FadeUp delay={6}>
    <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
      <div
        style={{
          width: 78,
          height: 78,
          borderRadius: 22,
          background: C.amber,
          color: '#0B1220',
          fontSize: 46,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {n}
      </div>
      <H1 size={62}>{title}</H1>
    </div>
  </FadeUp>
);

const RateJump: React.FC<{from: number; to: number; start: number; end: number; color?: string}> = ({
  from,
  to,
  start,
  end,
  color = C.green,
}) => {
  const v = useCount(from, to, start, end);
  return (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 26}}>
      <div style={{fontSize: 56, fontWeight: 700, color: C.sub}}>{from}%</div>
      <div style={{fontSize: 56, fontWeight: 900, color: C.sub}}>→</div>
      <div style={{fontSize: 130, fontWeight: 900, color}}>{Math.round(v)}%</div>
    </div>
  );
};

const Free: React.FC = () => (
  <AbsoluteFill>
    <TechHead n="①" title="「免費」是最強的鉤子" />
    <div style={{display: 'flex', alignItems: 'center', gap: 90, marginTop: 56}}>
      <FadeUp delay={50}>
        <Panel style={{textAlign: 'center', width: 560}}>
          <div style={{fontSize: 80}}>🍫</div>
          <div style={{fontSize: 38, fontWeight: 700, marginTop: 10}}>巧克力售價</div>
          <div style={{fontSize: 64, fontWeight: 900, marginTop: 12}}>
            <span style={{textDecoration: 'line-through', color: C.sub}}>1¢</span>
            {'　'}
            <span style={{color: C.green}}>免費</span>
          </div>
        </Panel>
      </FadeUp>
      <FadeUp delay={120}>
        <div>
          <Sub style={{fontSize: 34}}>被選擇的比例</Sub>
          <RateJump from={27} to={69} start={150} end={230} />
        </div>
      </FadeUp>
    </div>
    <SourceTag style={{bottom: -10}}>Shampanier, Mazar &amp; Ariely 2007・實驗條件下</SourceTag>
  </AbsoluteFill>
);

const Tiers: React.FC = () => (
  <AbsoluteFill>
    <TechHead n="②" title="三層定價：想賣的放中間" />
    <div style={{display: 'flex', gap: 34, marginTop: 50, alignItems: 'stretch'}}>
      {[
        {name: '基本', price: 'NT$590', hot: false},
        {name: '專業', price: 'NT$990', hot: true},
        {name: '旗艦', price: 'NT$1,990', hot: false},
      ].map((t, i) => (
        <FadeUp key={t.name} delay={40 + i * 55} style={{flex: 1}}>
          <Panel
            style={{
              textAlign: 'center',
              borderColor: t.hot ? C.amber : C.line,
              borderWidth: t.hot ? 5 : 2,
              transform: t.hot ? 'scale(1.07)' : 'none',
              background: t.hot ? '#1E2742' : C.panel,
            }}
          >
            <div style={{fontSize: 38, fontWeight: 900, color: t.hot ? C.amber : C.sub}}>{t.name}</div>
            <div style={{fontSize: 58, fontWeight: 900, marginTop: 8}}>{t.price}</div>
            {t.hot ? (
              <Chip color={C.amber} style={{marginTop: 14, fontSize: 26}}>
                想賣的放這
              </Chip>
            ) : (
              <div style={{height: 64}} />
            )}
          </Panel>
        </FadeUp>
      ))}
    </div>
    <FadeUp delay={230} style={{marginTop: 42, display: 'flex', alignItems: 'center', gap: 30}}>
      <Sub style={{fontSize: 34}}>加入高階方案後，中間方案選擇率</Sub>
      <div style={{fontSize: 50, fontWeight: 900}}>
        50% → <span style={{color: C.amber}}>57%</span>
      </div>
    </FadeUp>
    <SourceTag style={{bottom: -10}}>Simonson &amp; Tversky 1992・相機實驗</SourceTag>
  </AbsoluteFill>
);

const Decoy: React.FC = () => (
  <AbsoluteFill>
    <TechHead n="③" title="放一個「誘餌」" />
    <div style={{display: 'flex', gap: 34, marginTop: 50}}>
      {[
        {name: '電子版', price: '$59', pct: '16%', tag: null, dim: false, hot: false},
        {name: '純印刷版', price: '$125', pct: '0%', tag: '誘餌・沒人選', dim: true, hot: false},
        {name: '印刷＋電子', price: '$125', pct: '84%', tag: null, dim: false, hot: true},
      ].map((t, i) => (
        <FadeUp key={t.name} delay={40 + i * 55} style={{flex: 1}}>
          <Panel
            style={{
              textAlign: 'center',
              opacity: t.dim ? 0.55 : 1,
              borderColor: t.hot ? C.green : C.line,
              borderWidth: t.hot ? 5 : 2,
            }}
          >
            <div style={{fontSize: 36, fontWeight: 900, color: C.sub}}>{t.name}</div>
            <div style={{fontSize: 52, fontWeight: 900, marginTop: 6}}>{t.price}</div>
            <div
              style={{
                fontSize: 66,
                fontWeight: 900,
                marginTop: 10,
                color: t.hot ? C.green : t.dim ? C.red : C.text,
              }}
            >
              {t.pct}
            </div>
            {t.tag ? (
              <Chip color={C.red} style={{marginTop: 12, fontSize: 24}}>
                {t.tag}
              </Chip>
            ) : (
              <div style={{height: 58}} />
            )}
          </Panel>
        </FadeUp>
      ))}
    </div>
    <FadeUp delay={240} style={{marginTop: 40}}>
      <Sub style={{fontSize: 33}}>
        移除誘餌後，選最貴方案的人只剩 <b style={{color: C.text}}>32%</b>——爛選項的存在，就是它的功能
      </Sub>
    </FadeUp>
    <SourceTag style={{bottom: -10}}>《經濟學人》訂閱實驗・課堂樣本・真實商品效果會縮水</SourceTag>
  </AbsoluteFill>
);

const Reviews: React.FC = () => (
  <AbsoluteFill>
    <TechHead n="④" title="催出前 5 則評論" />
    <div style={{display: 'flex', alignItems: 'center', gap: 90, marginTop: 50}}>
      <FadeUp delay={50}>
        <Panel style={{width: 620}}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '12px 0',
                borderBottom: i < 4 ? `2px solid ${C.line}` : 'none',
              }}
            >
              <div style={{color: C.amber, fontSize: 30}}>★★★★★</div>
              <div style={{flex: 1, height: 14, background: C.line, borderRadius: 7}} />
            </div>
          ))}
        </Panel>
      </FadeUp>
      <div>
        <FadeUp delay={130}>
          <Sub style={{fontSize: 34}}>購買可能性（vs 零評論）</Sub>
          <div style={{fontSize: 140, fontWeight: 900, color: C.teal, lineHeight: 1.1}}>≈ 4×</div>
        </FadeUp>
        <Pop delay={200}>
          <Chip color={C.red} style={{fontSize: 28}}>
            相關性數據・非因果保證
          </Chip>
        </Pop>
      </div>
    </div>
    <FadeUp delay={250} style={{marginTop: 30}}>
      <Sub style={{fontSize: 31}}>星等 4.0–4.7 轉換最好——不必追求滿分；高價品放見證效果更大</Sub>
    </FadeUp>
    <SourceTag style={{bottom: -10}}>Spiegel Research Center（Northwestern）・觀察數據</SourceTag>
  </AbsoluteFill>
);

const Warning: React.FC = () => (
  <AbsoluteFill style={{justifyContent: 'center'}}>
    <Pop delay={20}>
      <Panel style={{borderColor: C.amber, borderWidth: 5, background: '#2A2008', padding: '50px 60px'}}>
        <div style={{fontSize: 54, fontWeight: 900, color: C.amber}}>⚠ 誠實警語</div>
        <div style={{fontSize: 44, fontWeight: 700, marginTop: 28, lineHeight: 1.6}}>
          實驗室數字到了現實會縮水——
          <br />
          把這些技巧<span style={{color: C.amber}}>當直覺，別當開關</span>。
        </div>
        <div style={{fontSize: 38, color: C.sub, marginTop: 24}}>
          假稀缺、假倒數，一旦被識破：<span style={{color: C.red, fontWeight: 900}}>信任歸零</span>
        </div>
      </Panel>
    </Pop>
  </AbsoluteFill>
);

export const Scene5: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
  <SceneShell
    sceneIndex={5}
    kicker="第四步"
    title="用消費心理學佈置商品（有實驗根據的四招）"
    durationInFrames={durationInFrames}
  >
    <Sequence durationInFrames={400}>
      <Free />
    </Sequence>
    <Sequence from={400} durationInFrames={290}>
      <Tiers />
    </Sequence>
    <Sequence from={690} durationInFrames={280}>
      <Decoy />
    </Sequence>
    <Sequence from={970} durationInFrames={290}>
      <Reviews />
    </Sequence>
    <Sequence from={1260}>
      <Warning />
    </Sequence>
  </SceneShell>
);
