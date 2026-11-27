---
'@bifold/core': patch
---

Keep QR codes scannable when the phone's colour inversion is on. `QRRenderer` now opts out of iOS Smart Invert, and on Android it draws the code inverted while colour inversion is on, so the display turns it back to dark on light.
