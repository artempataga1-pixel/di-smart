# Galaxy S25 Ultra — промт для hero-видео (Seedance 2.0)

Арт-дирекшн: холодная палитра (титан #8a8a86), ночной урбанистический город, неон — контраст с тёплым природным видео у iPhone-страницы. Без текста в кадре, без персонажей — герой сцены сам телефон. Финальный кадр статичен и должен годиться как постер/OG-заглушка.

---

## `intro` — героическое видео телефона для Hero Block
**Файл:** `public/media/galaxy-s25-ultra/intro.mp4`

```
LOCATION: A rain-slicked rooftop terrace at night above a dense cold city skyline — glass towers, small window lights, faint blue and cyan neon signage bleeding into low haze, wet reflective surface underfoot.

STYLE: Photorealistic product cinematography, physical camera optics, shallow depth of field, out-of-focus neon bokeh in the background, visible material detail on brushed titanium, cinematic halation on the neon highlights, Kodak Vision3 500T film grain look.
CRITICAL: The frame must be a perfectly clean flat rectangle with NO dark edges, NO dark corners, NO tunnel effect, NO circular darkening, NO fisheye shadow. Image fills the entire frame edge-to-edge with full brightness to every corner.

STORY: A titanium-grey smartphone stands upright on a dark ledge; the camera slowly arcs around it as cold city light plays across its metal frame, then settles into a locked close-up as the final still frame.

Audio: No music. Faint diegetic city ambience — distant traffic hum, soft wind, occasional far-off siren.
Duration: 6s. Aspect Ratio: 16:9.

SHOT STRUCTURE (6s):

[00–04s] - THE ORBIT
Action: The titanium-grey smartphone stands upright, centered, on a dark wet ledge; camera performs a slow arc orbit of about 70 degrees around it.
Camera: Medium close-up, slow orbit 70°, eye-level, 50mm equivalent lens, smooth locked gimbal movement.
Lighting & VFX: Cool blue and cyan neon reflections travel across the satin metal frame as the angle changes; soft key light from a distant streetlamp above camera-left; deep blue-black ambient city glow behind.
Physics: Realistic specular highlight movement on the brushed metal edges as the angle changes, no reflection artifacts.

[04–06s] - THE HERO STILL
Action: Camera motion eases to a complete stop; the phone holds a static three-quarter front angle, fully sharp, standing centered on the ledge.
Camera: Locked tripod, static close-up, eye-level, 50mm equivalent lens, slow push-in of roughly 5% ending on the final frame.
Lighting & VFX: Same cool blue neon and streetlamp key light now steady and unmoving, no flicker, even diffuse fill on the phone body.
Physics: No motion, no material shimmer, screen and body edges perfectly still for a clean final frame.

Constraints: rigid stable object, no morphing or warping of the phone geometry, edges perfectly straight, no flickering lights, constant exposure, no texture crawl on the metal or glass, cinematic 24fps cadence, no readable text or logos rendered sharply, no lens flare bloom, no dark vignette corners.
```

**Описание:** камера медленно облетает стоящий на ночной крыше титановый телефон, по корпусу пробегают холодные синие и голубые неоновые блики от города на фоне; на второй половине ролика движение останавливается, и последние два секунды — статичный крупный план телефона под тем же холодным светом. Без музыки, только фоновый шум города. Без текста и без людей в кадре.

**Что предположено:** цвет корпуса — Титан (#8a8a86), как самый «имиджевый» металлический тон; длительность 6с (в рамках заявленных 5–8с); формат 16:9 под fullscreen hero — скажи, если нужен другой цвет корпуса, длительность или пропорции.

*Совет:* если на стыке двух шотов будет рывок/дрожание — в первую очередь укороти секцию THE ORBIT до 3–4с (шоты 4–6с держат геометрию стабильнее, чем более длинные), и проверь именно этот параметр итерацией, не переписывая весь промт.
