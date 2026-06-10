// Noto Sans TC is installed as a system font by scripts/get_font.sh, so
// headless Chrome resolves it through fontconfig — no runtime font loading
// (FontFace.load() can hang under concurrent render tabs in the sandbox).
export const fontFamily = "'Noto Sans TC', 'Noto Sans CJK TC', sans-serif";
