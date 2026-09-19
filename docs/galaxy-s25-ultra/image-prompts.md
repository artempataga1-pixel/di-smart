# Galaxy S25 Ultra — промты для фото (v5, по точной методике iPhone-страницы)

**Модель:** ChatGPT Image — держит идентичность реального устройства при загрузке референс-фото.

## Что было не так в v3/v4 — и откуда взялась v5

Посмотрел не абстрактные референсы, а буквально файл, по которому Codex сгенерировал реальные картинки для `/iphone-18-pro` (`docs/iphone-18-pro/natural-image-prompts.json`), и сами получившиеся `.webp`. Оказалось: это НЕ драматичная студийная реклама (v3) и НЕ постановочные эмоциональные кульминации (v4) — это **обычная, будничная, слегка несовершенная фотография**. Телефон просто лежит на исцарапанном кафе-столике рядом с чашкой кофе. Девушка играет на диване в обычной гостиной при обычном дневном свете. Рисовые террасы на Бали сняты как документальный кадр, а не открыточный пейзаж.

В каждом промте Codex буквально прописан запрет на то, что делал я: `no CGI, no bloom, no dramatic rim lighting, no cinematic orange/teal grading, no excessive bokeh, no glossy synthetic surfaces, no luxury fantasy staging`. И наоборот, слово **"ordinary"** повторяется почти в каждой строке — обычный кафе, обычная гостиная, обычный будний свет. Портреты — намеренно неретушированные: `visible pores, fine facial hairs, no makeup-ad retouching`. Локации — реальные, с именем (набережная Свислочи в Минске, террасы Джатилувих на Бали), с явным запретом их приукрашивать: `not an idealized travel poster`.

Ещё один приём: три цвета корпуса (`black`/`silver`/`glacier`) получены не тремя независимыми генерациями, а **редактированием одного эталонного фото** — «Change ONLY the phone body finish to X, preserve everything else unchanged». Так гарантированно совпадает ракурс, свет, всё, кроме цвета. Использую этот же приём для `designTitanium`/`designBlue`.

## Как использовать

Приложи в ChatGPT Image референс-фото реального Galaxy S25 Ultra (кроме `cameraNight` — устройства в кадре нет). Для `designTitanium` и `designBlue` — сначала сгенерируй `designBlack`, затем в ТОМ ЖЕ чате попроси отредактировать именно это изображение (промты для этого уже готовы ниже, это не новая генерация с нуля). Новый чат каждые 5–6 генераций.

---

## `heroPoster` — обычная предметная фотография, без драмы
**Референс:** фото в цвете, который должен быть основным на hero-баннере.
**Файл:** `public/media/galaxy-s25-ultra/images/hero-poster.webp`

```
Photorealistic actual-camera photograph, believable and unretouched, for a smartphone website hero banner. Ordinary real-world lighting, neutral white balance, natural colors, modest dynamic range. No CGI look, no 3D render look, no bloom, no dramatic rim lighting, no cinematic color grading, no excessive bokeh, no glossy synthetic surfaces, no luxury fantasy staging, no text or watermark.

Use the attached reference photo of the device as the exact visual source for its shape, color and materials — preserve every real detail unchanged, do not restyle it. The device stands upright at a gentle three-quarter angle on an ordinary matte concrete studio surface, centered in frame. Soft, even daylight comes through a large window just out of frame to camera-left — the kind of plain diffuse light a real product photographer actually uses, not a spotlight. A believable soft contact shadow grounds the device; a few faint natural fingerprints and micro-scratches are visible on close inspection. Plain neutral grey seamless backdrop, no visible horizon line. Wide horizontal 16:9 format, eye-level camera, generous plain negative space above and to both sides for a headline. 85mm f/8, tripod-locked, one diffused softbox as the only light source. No text, no logos.
```

**Структура:** обычная предметная фотография при дневном свете из окна, без драматичного света в темноте — ровно техника `design-burgundy` из iPhone-файла, только шире под hero.
**Совет:** если появится глянец/CGI-блеск — попроси `reduce reflections, make the surface look more matte and handled, less like a fresh render`.

---

## `designBlack` — эталонное фото, цвет Чёрный (база для двух следующих)
**Референс:** фото в цвете Чёрный (#1c1c1e).
**Файл:** `public/media/galaxy-s25-ultra/images/design-black.webp`

```
Photorealistic actual-camera photograph, believable and unretouched. Ordinary real-world lighting, neutral white balance, natural colors, modest dynamic range. No CGI look, no 3D render look, no bloom, no dramatic rim lighting, no cinematic color grading, no glossy synthetic surfaces, no text or watermark.

Use the attached reference photo of the device (Titanium Black finish) as the exact source for its shape, color and materials — preserve every real detail unchanged. The device stands upright at a three-quarter rear angle on a plain matte charcoal tabletop, centered and fully visible. Neutral soft diffused light from one large window-sized softbox, realistic exposure, restrained natural reflections on glass and metal, a few faint believable fingerprints and micro-scratches typical of an actually-handled device. Vertical 3:4 portrait format, eye level, device centered with equal plain dark negative space above and below. 85mm f/8, tripod-locked, real contact shadow. No text, no added graphics.
```

**Структура:** прямой аналог `design-burgundy` из iPhone-файла — обычный стол, один рассеянный софтбокс, реалистичные несовершенства. Это эталонный кадр — на его основе через редактирование получаем два следующих цвета.
**Совет:** сгенерируй именно этот кадр первым и добейся, чтобы устройство выглядело реалистично (не глянцево) — от его качества зависят оба следующих.

---

## `designTitanium` — редактирование эталона, смена цвета на Титан
**Референс:** не новый — редактируешь результат `designBlack` в том же чате.
**Файл:** `public/media/galaxy-s25-ultra/images/design-titanium.webp`

```
Edit the previous photograph. Change ONLY the device's body finish to Titanium Silver, matching the attached reference photo's exact color and material. Preserve the exact camera framing, device geometry, scale, position, contact shadow, tabletop, background and lighting completely unchanged. Do not make reflections glossier or the scene more dramatic — keep the same ordinary, unretouched photographic realism as the original. No text.
```

**Структура:** это редактирование, а не новая генерация — приём из iPhone-файла (`black`/`silver`/`glacier` как правки одного кадра). Приложи референс-фото в цвете Титан только для сверки цвета.
**Совет:** если модель всё равно немного изменит ракурс — попроси `revert the camera angle and framing to match exactly, only the finish color should differ`.

---

## `designBlue` — редактирование эталона, смена цвета на Синий
**Референс:** не новый — редактируешь результат `designBlack` в том же чате.
**Файл:** `public/media/galaxy-s25-ultra/images/design-blue.webp`

```
Edit the original photograph (not the Titanium Silver edit). Change ONLY the device's body finish to the blue color shown in the attached reference photo. Preserve the exact camera framing, device geometry, scale, position, contact shadow, tabletop, background and lighting completely unchanged. Do not make reflections glossier or the scene more dramatic — keep the same ordinary, unretouched photographic realism as the original. No text.
```

**Структура:** та же логика редактирования, от исходного чёрного кадра, не от титанового.
**Совет:** держи все три design-кадра в одном чате подряд (в лимите 5-6 генераций) — так редактирование стабильнее.

---

## `sPenWriting` — обычный стол, будничная заметка
**Референс:** фото устройства со стилусом (S Pen).
**Файл:** `public/media/galaxy-s25-ultra/images/s-pen-writing.webp`

```
Photorealistic actual-camera photograph, believable and unretouched. Ordinary real-world lighting, neutral white balance, natural colors. No CGI look, no dramatic rim lighting, no cinematic grading, no excessive bokeh, no glossy synthetic surfaces, no text or watermark.

Use the attached reference photo of the device and its stylus as the exact source for their shape, color and materials. Candid photograph of a person's hand and forearm at an ordinary home desk in mid-morning daylight from a nearby window, holding the stylus and jotting a quick note on the device's screen, which rests flat on the desk among everyday clutter — a plain mug, an open paper notebook, a pen, a charging cable coiled loosely nearby. The hand is shown at natural scale with real skin texture, short unpolished nails, a slightly loose everyday grip, not a stylized close-up. Screen shows a plain grey note-taking background with a few simple handwritten lines, no readable text needed. Eye-level seated angle, 50mm f/5.6, ordinary depth of field that keeps the desk context visible, not razor-thin macro blur. No text, no added graphics.
```

**Структура:** будничный рабочий стол, обычный дневной свет, реальный беспорядок на столе (кружка, блокнот, кабель) — не постановочный макро-момент, а то, что реально можно увидеть краем глаза.
**Совет:** если рука выйдет слишком «чистой»/пластиковой — попроси `add visible skin texture, slight redness on the knuckles, remove any smooth plastic-looking skin`.

---

## `cameraNight` — документальный ночной кадр (устройства в кадре нет)
**Референс:** не нужен — это фото, СДЕЛАННОЕ телефоном, а не фото телефона.
**Файл:** `public/media/galaxy-s25-ultra/images/camera-night.webp`

```
Photorealistic actual-camera night photograph, believable and unretouched. Real ordinary available light only, no cinematic grading, no CGI gloss, no bloom, no exaggerated neon, not an idealized movie-poster night scene. No text or watermark.

No device appears in this frame — this represents an ordinary photograph the phone's camera produced at night, shown as direct, honest proof of real low-light capability, not a styled demo. A quiet residential street at night, seen at a pedestrian's eye level, lit only by two or three ordinary streetlamps with warm sodium-vapor light and a little spill from one lit window in a nearby house. A person in an unremarkable winter coat walks away from camera at a normal pace, caught mid-stride, not posed for the shot. Wet asphalt reflects the streetlamp light in a modest, realistic way — an earlier ordinary rain, not a cinematic downpour. Visible authentic low-light sensor noise and slightly compressed shadow detail, true to what a real phone camera actually captures at night, not artificially brightened or dramatically graded. Medium-wide shot, 35mm f/2.8 equivalent, natural handheld framing, slightly off-center. No added light sources, no neon signage.
```

**Структура:** документальная, а не киношная ночь — как в travel-кадрах Codex (реальное место, обычный свет, явный запрет на «постер»). Человек есть, но случайный прохожий, а не постановочная сцена.
**Совет:** это единственный слот без референс-фото устройства.

---

## `performanceGaming` — обычная гостиная, будний вечер
**Референс:** фото устройства (любой цвет).
**Файл:** `public/media/galaxy-s25-ultra/images/performance-gaming.webp`

```
Photorealistic actual-camera photograph, believable and unretouched. Ordinary real-world lighting, neutral white balance, natural colors. No CGI look, no dramatic rim lighting, no cinematic grading, no excessive bokeh, no glossy synthetic surfaces, no text or watermark.

Use the attached reference photo of the device as the exact source for its shape, color and materials. Candid photograph of a person relaxing on an ordinary fabric sofa in a lived-in living room, holding the device horizontally in both hands, playing a modest realistic racing or action game — hands anatomically natural, thumbs resting naturally near the screen edges. The screen shows real gameplay with visible glass reflection and realistic brightness, not an oversaturated glow. Ordinary daylight from a nearby window, a coffee table with a mug and a half-open book visible slightly out of focus in the background, a houseplant in the corner. Over-the-shoulder or three-quarter angle, 50mm f/4, natural depth of field. No cinematic fantasy scenery, no dark room, no dramatic screen glow lighting the whole scene.
```

**Структура:** прямой аналог `gaming.webp` из iPhone-файла — обычная гостиная днём, а не тёмная комната с одним источником света от экрана.
**Совет:** если игра на экране выйдет с искажённым текстом интерфейса — попроси `remove any HUD text, keep only simple color shapes on screen, no readable UI elements`.

---

## `batteryLife` — телефон на столике кафе
**Референс:** фото устройства.
**Файл:** `public/media/galaxy-s25-ultra/images/battery-life.webp`

```
Photorealistic actual-camera photograph, believable and unretouched. Ordinary real-world lighting, neutral white balance, natural colors. No CGI look, no dramatic rim lighting, no cinematic grading, no glossy synthetic surfaces, no text or watermark.

Use the attached reference photo of the device as the exact source for its shape, color and materials. The device lies screen-up at a slight diagonal on a slightly worn dark wood café table beside a plain white cup of coffee, its screen showing a simple photo gallery thumbnail grid at normal brightness, not glowing dramatically. Ordinary overcast daylight from a nearby window, a softly out-of-focus wooden chair visible in the background, nothing else staged around it. Shot casually from seated eye height, 50mm f/5.6, natural depth of field. No skyline, no luxury interior, no candles, no evening string lights.
```

**Структура:** это буквально композиция `battery.webp` из iPhone-файла (телефон + кофе на столе кафе, обычный день) — без вечерней драматургии, которую я добавлял раньше.
**Совет:** если стол выйдет слишком новым/глянцевым — попроси `make the wood table surface more worn and matte, with visible grain and small scratches`.

---

## `galaxyAiEdit` — обычный стол, редактирование фото
**Референс:** фото устройства.
**Файл:** `public/media/galaxy-s25-ultra/images/galaxy-ai-edit.webp`

```
Photorealistic actual-camera photograph, believable and unretouched. Ordinary real-world lighting, neutral white balance, natural colors. No CGI look, no dramatic rim lighting, no cinematic grading, no glossy synthetic surfaces, no text or watermark.

Use the attached reference photo of the device as the exact source for its shape, color and materials. Candid photograph of a person at an ordinary desk holding the device at a relaxed angle, looking at its screen with a focused, natural expression — not smiling for the camera, just genuinely absorbed in reviewing a photo edit. The screen shows a photo mid-edit with a simple glowing selection outline around one object, rendered as soft abstract shapes rather than readable text or icons, at normal screen brightness. Ordinary daylight from a window behind the desk, a laptop and a coffee cup softly out of focus nearby. Three-quarter angle from slightly to the side, 50mm f/4, natural depth of field. No readable text, no real UI logos.
```

**Структура:** тот же принцип обычного рабочего стола, что и в `sPenWriting`/`ecosystem` из iPhone-файла — сосредоточенное, непостановочное выражение лица, а не театральная реакция удивления.
**Совет:** если выражение лица выйдет наигранным — попроси `make the expression more neutral and focused, less performed for the camera`.
