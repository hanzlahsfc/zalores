# Zalores — Image Generation Prompts

Every image the site needs, with exact filenames, target sizes, and prompts
tuned for a consistent premium eyewear-brand look. Drop finished files into
`public/assets/img/` using the names below — the site picks them up
automatically (no code changes).

## Shared art direction (prepend to every prompt)

> Premium eyewear brand photography, warm editorial style. Cream and sand
> tones, terracotta accents, soft directional daylight like late-afternoon sun
> through a window, gentle film grain, shallow depth of field. Minimalist
> composition, generous negative space, matte finishes — never glossy, never
> clinical. Photorealistic, shot on medium-format camera, 85mm lens.

**Avoid in every prompt:** text, watermarks, logos, warped frame geometry,
extra lenses, deformed hands, plastic-looking skin, oversaturated colors,
busy backgrounds.

---

## Hero & editorial

### `public/assets/img/hero.jpg` — 1400×1600 (portrait)
> A model in profile three-quarter view wearing sleek black square
> sunglasses, head tilted toward warm low sunlight, strong shadow falling
> across a cream plaster wall behind. Linen shirt, relaxed confidence.
> Composition leaves the left third mostly empty warm negative space.
> Medium-format editorial photography.

### `public/assets/img/editorial.jpg` — 1400×1200
> Close-up of hands hand-polishing a tortoise acetate sunglasses frame on a
> wooden workbench, scattered sheets of amber and honey acetate, soft window
> light, workshop atmosphere, shallow depth of field on the frame. Craft
> documentary photography, warm tones.

### `public/assets/img/about.jpg` — 1400×1200
> Small eyewear design studio: a marble-and-oak desk with sunglasses
> prototypes, lens swatches, sketches and calipers, warm morning light
> through a large window, one green plant blurred in foreground. Editorial
> interior photography, quiet premium mood.

---

## Collection banners — `public/assets/img/collections/` — 1400×900 each

### `everyday.jpg`
> Flat lay on warm cream linen: one pair of black wayfarer-style sunglasses
> next to a ceramic espresso cup and folded newspaper, soft morning shadow.
> Quiet, effortless, daily-ritual mood.

### `statement.jpg`
> Single dramatic portrait: model wearing amber tortoise cat-eye sunglasses,
> chin slightly raised, deep terracotta seamless backdrop, one hard shadow
> edge across the face. High-fashion editorial, bold but minimal.

### `sport.jpg`
> Action-adjacent still: matte graphite wrap sport sunglasses resting on a
> sun-bleached rock beside a dusty trail, golden-hour backlight, lens
> catching a warm reflection. Outdoor performance mood without people.

---

## Product shots — `public/assets/img/products/` — 1200×900 each

Studio rule for all products: *the sunglasses alone, centered, floating on a
warm seamless backdrop matching each product's tint, soft shadow beneath,
three-quarter angle showing one temple.*

| File | Prompt subject |
|---|---|
| `meridian.jpg` | squared black acetate sunglasses, onyx frame, dark smoke lenses, on warm beige seamless |
| `meridian-2.jpg` | same frame, exact side profile view |
| `meridian-3.jpg` | same frame worn by a man in warm daylight, street blurred behind |
| `meridian-4.jpg` | macro detail of hinge and acetate edge |
| `solana.jpg` | upswept cat-eye sunglasses in amber tortoise acetate, gradient amber lenses, on cream seamless |
| `solana-2.jpg` | same frame, side profile |
| `solana-3.jpg` | same frame worn by a woman, warm bokeh background |
| `solana-4.jpg` | macro detail of tortoise acetate pattern |
| `coastline.jpg` | brushed-gold metal aviator sunglasses, bottle-green lenses, on soft sage seamless |
| `coastline-2.jpg` | same frame, side profile |
| `coastline-3.jpg` | same frame worn in a coastal setting, sea glare behind |
| `coastline-4.jpg` | macro of gold bridge and nose pads |
| `atlas.jpg` | round wire-frame sunglasses in gunmetal, slate lenses, on cool pale-grey seamless |
| `atlas-2.jpg` | side profile |
| `atlas-3.jpg` | worn by a model in soft window light |
| `atlas-4.jpg` | macro of wire rim and lens edge |
| `ridgeline.jpg` | matte graphite wrap sport sunglasses, copper-tinted lenses, on warm grey seamless |
| `ridgeline-2.jpg` | side profile showing wrap curvature |
| `ridgeline-3.jpg` | worn on a trail run, golden-hour backlight |
| `ridgeline-4.jpg` | macro of temple grip texture |
| `verano.jpg` | translucent honey-tortoise wayfarer sunglasses, warm brown lenses, on cream seamless |
| `verano-2.jpg` | side profile showing translucent acetate glowing in backlight |
| `verano-3.jpg` | worn at a café table in golden-hour light |
| `verano-4.jpg` | macro of honey acetate translucency |

**Per-colorway variants (optional but wired):** same shot as the main image
but in that colorway — `meridian-tortoise.jpg`, `meridian-sand.jpg`,
`solana-noir.jpg`, `solana-blush.jpg`, `coastline-gunmetal.jpg`,
`coastline-black.jpg`, `atlas-bronze.jpg`, `atlas-black.jpg`,
`ridgeline-olive.jpg`, `ridgeline-black.jpg`, `verano-onyx.jpg`,
`verano-amber.jpg`.

---

## Social

### `public/assets/img/og.jpg` — 1200×630
> Wide editorial banner: three sunglasses (black square, tortoise cat-eye,
> gold aviator) arranged in a loose row on warm cream background, long soft
> shadows, brand-premium still life. Leave center-left area clean for title
> overlay.

---

## File checklist

```
public/assets/img/
├── hero.jpg
├── editorial.jpg
├── about.jpg
├── og.jpg
├── collections/
│   ├── everyday.jpg
│   ├── statement.jpg
│   └── sport.jpg
└── products/
    ├── meridian.jpg  meridian-2.jpg  meridian-3.jpg  meridian-4.jpg
    ├── solana.jpg    solana-2.jpg    solana-3.jpg    solana-4.jpg
    ├── coastline.jpg coastline-2.jpg coastline-3.jpg coastline-4.jpg
    ├── atlas.jpg     atlas-2.jpg     atlas-3.jpg     atlas-4.jpg
    ├── ridgeline.jpg ridgeline-2.jpg ridgeline-3.jpg ridgeline-4.jpg
    └── verano.jpg    verano-2.jpg    verano-3.jpg    verano-4.jpg
```
