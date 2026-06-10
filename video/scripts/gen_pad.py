#!/usr/bin/env python3
"""Generate a subtle ambient music pad (pure python, no deps) for the video bed."""
import math
import os
import struct
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "audio", "pad.wav")

SR = 16000
DUR = 310  # seconds, slightly longer than the video
N = SR * DUR

# A minor add9 voicing, low and warm
PARTIALS = [
    (110.00, 0.30, 23.0, 0.0),   # A2
    (164.81, 0.22, 29.0, 1.7),   # E3
    (220.00, 0.18, 31.0, 3.1),   # A3
    (246.94, 0.10, 37.0, 4.6),   # B3 (add9)
    (329.63, 0.08, 41.0, 2.3),   # E4
]


def sample(i: int) -> float:
    t = i / SR
    v = 0.0
    for freq, amp, lfo_period, phase in PARTIALS:
        lfo = 0.6 + 0.4 * math.sin(2 * math.pi * t / lfo_period + phase)
        v += amp * lfo * math.sin(2 * math.pi * freq * t)
        # slight detune twin for warmth
        v += amp * 0.4 * lfo * math.sin(2 * math.pi * (freq + 0.7) * t + phase)
    # gentle fade in/out
    if t < 4:
        v *= t / 4
    if t > DUR - 8:
        v *= max(0.0, (DUR - t) / 8)
    return v


def main() -> None:
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    frames = bytearray()
    scale = 0.5 * 32767 / sum(a * 1.4 for _, a, _, _ in PARTIALS)
    for i in range(N):
        frames += struct.pack("<h", int(sample(i) * scale))
    with wave.open(OUT, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    print(f"wrote {OUT} ({len(frames) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
