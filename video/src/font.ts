import {continueRender, delayRender, staticFile} from 'remotion';

// Local variable font (weight 100-900), fetched by scripts/get_font.sh.
// Loaded from staticFile so rendering needs no external network access.
export const fontFamily = "'Noto Sans TC', 'Noto Sans CJK TC', sans-serif";

if (typeof document !== 'undefined') {
  const handle = delayRender('load Noto Sans TC');
  const font = new FontFace(
    'Noto Sans TC',
    `url('${staticFile('fonts/NotoSansTC.ttf')}') format('truetype')`,
    {weight: '100 900'}
  );
  font
    .load()
    .then(() => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(font);
      continueRender(handle);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('font load failed, falling back to system fonts', err);
      continueRender(handle);
    });
}
