import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {fontFamily} from './font';

export const C = {
  bg: '#0B1220',
  panel: '#141E33',
  panelLight: '#1C2A47',
  text: '#F5F7FA',
  sub: '#94A3B8',
  amber: '#F5A524',
  teal: '#2DD4BF',
  red: '#EF4444',
  green: '#34D399',
  line: '#2A3A5C',
};

export const SCENE_KICKERS = [
  '開場',
  '第一步',
  '第二步',
  '真實案例',
  '第三步',
  '第四步',
  '行動清單',
];

// ---------- layout shell ----------

export const SceneShell: React.FC<{
  sceneIndex: number;
  kicker: string;
  title?: string;
  durationInFrames: number;
  children: React.ReactNode;
}> = ({sceneIndex, kicker, title, durationInFrames, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        backgroundImage:
          'radial-gradient(1200px 800px at 75% 15%, #14213D 0%, #0B1220 60%)',
        fontFamily,
        color: C.text,
        opacity,
        padding: '70px 110px 90px 110px',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div
          style={{
            background: C.amber,
            color: '#0B1220',
            fontWeight: 900,
            fontSize: 30,
            padding: '8px 26px',
            borderRadius: 999,
            letterSpacing: 2,
          }}
        >
          {kicker}
        </div>
        {title ? (
          <div style={{fontSize: 34, fontWeight: 700, color: C.sub}}>{title}</div>
        ) : null}
      </div>
      <div style={{flex: 1, position: 'relative', marginTop: 30}}>{children}</div>
      <Dots active={sceneIndex} />
    </AbsoluteFill>
  );
};

const Dots: React.FC<{active: number}> = ({active}) => (
  <div
    style={{
      position: 'absolute',
      bottom: 36,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      gap: 14,
    }}
  >
    {SCENE_KICKERS.map((_, i) => (
      <div
        key={i}
        style={{
          width: i === active ? 34 : 12,
          height: 12,
          borderRadius: 999,
          background: i === active ? C.amber : C.line,
          transition: 'width 0.3s',
        }}
      />
    ))}
  </div>
);

// ---------- animation helpers ----------

export const FadeUp: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay = 0, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 90}});
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 46}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay = 0, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 160, mass: 0.7}});
  return (
    <div style={{opacity: Math.min(1, p * 2), transform: `scale(${p})`, ...style}}>
      {children}
    </div>
  );
};

export const useCount = (
  from: number,
  to: number,
  startFrame: number,
  endFrame: number
): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, endFrame], [from, to], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

// ---------- building blocks ----------

export const H1: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({
  children,
  size = 76,
  style,
}) => (
  <div style={{fontSize: size, fontWeight: 900, lineHeight: 1.25, ...style}}>{children}</div>
);

export const Sub: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({
  children,
  style,
}) => <div style={{fontSize: 32, color: C.sub, fontWeight: 500, ...style}}>{children}</div>;

export const Panel: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({
  children,
  style,
}) => (
  <div
    style={{
      background: C.panel,
      border: `2px solid ${C.line}`,
      borderRadius: 24,
      padding: '34px 42px',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({children, color = C.teal, style}) => (
  <div
    style={{
      display: 'inline-block',
      border: `2.5px solid ${color}`,
      color,
      borderRadius: 999,
      padding: '6px 22px',
      fontSize: 28,
      fontWeight: 700,
      ...style,
    }}
  >
    {children}
  </div>
);

export const SourceTag: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      right: 8,
      bottom: 4,
      fontSize: 21,
      color: '#64748B',
      fontWeight: 500,
      ...style,
    }}
  >
    {children}
  </div>
);

export const HBar: React.FC<{
  label: string;
  value: string;
  pct: number; // 0..100 target width percentage
  delay: number;
  color?: string;
}> = ({label, value, pct, delay, color = C.teal}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 60}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 26, marginBottom: 26}}>
      <div style={{width: 320, fontSize: 33, fontWeight: 700, textAlign: 'right'}}>{label}</div>
      <div style={{flex: 1, height: 46, background: '#101A30', borderRadius: 10, overflow: 'hidden'}}>
        <div
          style={{
            width: `${pct * p}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}AA, ${color})`,
            borderRadius: 10,
          }}
        />
      </div>
      <div style={{width: 190, fontSize: 34, fontWeight: 900, color, opacity: p}}>{value}</div>
    </div>
  );
};

export const CheckItem: React.FC<{
  delay: number;
  title: string;
  desc: string;
}> = ({delay, title, desc}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 16, stiffness: 150, mass: 0.6}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 34, opacity: Math.min(1, p * 2)}}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: C.green,
          color: '#06281D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 42,
          fontWeight: 900,
          transform: `scale(${p})`,
          flexShrink: 0,
        }}
      >
        ✓
      </div>
      <div>
        <div style={{fontSize: 40, fontWeight: 900}}>{title}</div>
        <div style={{fontSize: 29, color: C.sub, marginTop: 2}}>{desc}</div>
      </div>
    </div>
  );
};

export const Stamp: React.FC<{
  delay: number;
  children: React.ReactNode;
  color?: string;
  rotate?: number;
  style?: React.CSSProperties;
}> = ({delay, children, color = C.red, rotate = -8, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 11, stiffness: 320, mass: 0.8}});
  const scale = interpolate(p, [0, 1], [2.4, 1]);
  return (
    <div
      style={{
        display: 'inline-block',
        border: `7px solid ${color}`,
        color,
        fontWeight: 900,
        fontSize: 54,
        padding: '10px 34px',
        borderRadius: 14,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity: Math.min(1, p * 1.6),
        letterSpacing: 6,
        background: '#0B122088',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
