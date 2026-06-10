#!/usr/bin/env python3
"""Generate zh-TW narration for each scene with edge-tts, measure durations,
and write src/timings.json used by the Remotion composition."""
import asyncio
import json
import math
import os
import sys

import edge_tts
from mutagen.mp3 import MP3

VOICE = "zh-TW-HsiaoChenNeural"
RATE = os.environ.get("TTS_RATE", "+4%")
HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(HERE, "..", "public", "audio")
TIMINGS = os.path.join(HERE, "..", "src", "timings.json")

# Display text lives in research/.../SCRIPT.md; this is the spoken version
# (brand names spelled out for natural TTS pronunciation).
SEGMENTS = {
    "s0": "你可能聽過一句話：90%的創業，最後都會失敗。我們把這個數字追到底——它，根本查無出處。美國官方統計，新事業五年後還有約一半存活；台灣官方的數字甚至更高。創業不是賭命，而是一連串可以練習的決策。接下來五分鐘，給你一條有數據、有案例的路。",
    "s1": "第一步，選一個剛需戰場。2025年，全球企業在生成式AI上的支出，估計370億美元，一年成長超過三倍。錢流向哪？寫程式的AI工具40億、行銷內容6.6億、客服6.3億，醫療與法律等垂直應用35億。但對一人公司，真正的機會在台灣自己家裡：中小企業連正在規劃的都算進去，只有7.4%導入AI；六成四的老闆說，不知道AI要用在哪；八成五的公司沒有AI人才。這就是剛需——不是再做一個聊天機器人，而是幫不會用AI的店家和公司，把AI裝進他們的流程。三條低資本路線：AI導入顧問、垂直行業流程自動化、行銷與客服小工具。避開通用助理，那是巨頭的戰場。",
    "s2": "第二步，先驗證，再開發。倒閉的創投新創裡，七成說錢燒完了——但那是結果，更根本的原因：43%做了沒人要的東西。隨機對照實驗證明，像科學家一樣創業——寫下假設、用最便宜的實驗去測——你會更快砍掉壞點子。訪談只有一條鐵則：別問「你會買嗎」，要問「上次遇到這個問題，你花了多少錢解決」。唯一算數的驗證，是有代價的承諾：訂金、預購、簽約。一頁式網站加幾千塊廣告費，一個星期就能測完。",
    "s3": "這條路有人走通了。以色列工程師，獨資、零融資，做了AI建站工具 base forty-four。六個月後，Wix用八千萬美元現金收購——當時全公司不到十個人。Cal AI 更狂：17歲高中生做的拍照算卡路里App，用的是現成AI模型，不到兩年，年營收破三千萬美元，被 MyFitnessPal 收購。Sam Altman 說，科技圈CEO的群組裡有個賭盤：第一家一人十億美元公司，會在哪一年出現。而你需要的全套AI工具，寫程式、做行銷、做客服，估計每月一百到三百美元。",
    "s4": "第三步，把公司開起來——但別急。先用個人或行號接案：2025年起，月營業額在起徵點以下——賣貨十萬、服務五萬——連營業稅都免。等企業客戶要發票、獲利穩定，或你開始擔心賠償責任，再升級。現在一個人就能開有限公司：沒有最低資本額，經濟部一站式網站線上辦——名稱預查一百五十元、登記費七百元，加上會計師驗資幾千塊，一到兩週完成。稅記兩個數字：公司獲利繳20%；行號併入個人所得稅5%到40%。獲利越高，越該開公司。",
    "s5": "第四步，用消費心理學佈置你的商品。四個有實驗根據的技巧。一，免費是最強的鉤子：巧克力實驗從一分錢降到免費，選擇率從27%跳到69%。二，三層定價，想賣的放中間：加一個高階方案，中間方案的選擇率從五成升到五成七。三，放一個誘餌：經濟學人實驗裡，多了一個沒人選的爛選項，84%的人選了最貴方案。四，催出前五則評論：有五則評論的商品，購買可能性接近四倍——注意，這是相關性數據。最後提醒：實驗室數字到了現實會縮水，把它們當直覺，別當開關；假稀缺一旦被識破，信任歸零。",
    "s6": "行動清單。這週：找十個目標客戶，問他們過去怎麼解決問題。下週：上線一頁式網站，開始預售。收到第一筆訂金，才開始開發。月營收穩定，再開公司。創業不是一次豪賭，而是一連串便宜的小實驗。五年後還站著的那一半人，希望有你。",
}


async def synth(key: str, text: str) -> None:
    out = os.path.join(AUDIO_DIR, f"{key}.mp3")
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(out)


async def main() -> None:
    os.makedirs(AUDIO_DIR, exist_ok=True)
    await asyncio.gather(*(synth(k, t) for k, t in SEGMENTS.items()))
    fps = 30
    timings = {}
    total = 0.0
    for key in SEGMENTS:
        path = os.path.join(AUDIO_DIR, f"{key}.mp3")
        dur = MP3(path).info.length
        frames = math.ceil(dur * fps)
        timings[key] = {"seconds": round(dur, 2), "frames": frames}
        total += dur
        print(f"{key}: {dur:6.2f}s  ({frames} frames)")
    print(f"narration total: {total:.1f}s")
    os.makedirs(os.path.dirname(TIMINGS), exist_ok=True)
    with open(TIMINGS, "w", encoding="utf-8") as f:
        json.dump({"fps": fps, "segments": timings}, f, ensure_ascii=False, indent=2)
    print(f"wrote {os.path.relpath(TIMINGS, HERE)}")


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
