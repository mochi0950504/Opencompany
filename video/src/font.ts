import {loadFont} from '@remotion/google-fonts/NotoSansTC';

const noto = loadFont('normal', {
  weights: ['400', '500', '700', '900'],
  subsets: ['chinese-traditional', 'latin'],
});

export const fontFamily = noto.fontFamily;
