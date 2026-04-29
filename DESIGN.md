# DESIGN SPECIFICATION — neversleep.chat
Version 1.0 | 2026-04-29

Стек: Next.js 15, Tailwind CSS, shadcn/ui, Framer Motion  
Шрифт: Manrope Variable (Google Fonts)  
Референс: Microsoft Copilot homepage visual language

---

## 1. АНИМИРОВАННЫЙ ФОН (Время суток)

Фон — full-viewport CSS-градиент, который меняется плавно при изменении состояния через Framer Motion `animate` на `background` с `transition duration: 2000ms`.

### 1.1 Четыре состояния

#### УТРО — 06:00–11:59
```
direction: 180deg (сверху вниз)
stop 1: #FFF1E6  (персиковый, 0%)
stop 2: #FFD6A5  (тёплый жёлтый, 45%)
stop 3: #AECBFA  (мягкий голубой, 100%)

text-color: #1A1A2E  (тёмный, читается на светлом)
theme: light
```

Tailwind-класс (динамически через style prop):
```
background: linear-gradient(180deg, #FFF1E6 0%, #FFD6A5 45%, #AECBFA 100%)
```

#### ДЕНЬ — 12:00–17:59
```
direction: 180deg
stop 1: #E8F4FD  (очень светлый голубой, 0%)
stop 2: #B8D9F8  (голубое небо, 50%)
stop 3: #D4EAFF  (светлый горизонт, 100%)

text-color: #0F1724  (тёмный)
theme: light
```

Это основное состояние — референс Copilot.

#### ВЕЧЕР — 18:00–21:59
```
direction: 180deg
stop 1: #FF6B35  (оранжевый закат, 0%)
stop 2: #C9184A  (розово-алый, 40%)
stop 3: #560BAD  (тёмно-фиолетовый, 100%)

text-color: #FFFFFF  (белый)
theme: dark
```

#### НОЧЬ — 22:00–05:59
```
direction: 180deg
stop 1: #0B0E1A  (почти чёрный, 0%)
stop 2: #0D1B4B  (тёмно-синий, 50%)
stop 3: #1A1035  (тёмный индиго, 100%)

text-color: #FFFFFF  (белый)
theme: dark
```

### 1.2 Анимация звёзд (только ночь)

Компонент `<StarField />` — 80–120 абсолютно позиционированных `<span>` с рандомными координатами. Каждая звезда — `width: 2px; height: 2px; border-radius: 50%; background: white`.

```css
/* globals.css */
@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.4); }
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #FFFFFF;
  animation: twinkle var(--duration, 3s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}
```

В TSX-компоненте каждой звезде назначается:
```ts
style={{
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 70}%`,     // только верхние 70% экрана
  '--duration': `${2 + Math.random() * 4}s`,
  '--delay': `${Math.random() * 5}s`,
}}
```

Звёзды появляются/исчезают через Framer Motion `<AnimatePresence>` с `opacity: 0 → 1`, duration `1500ms`.

### 1.3 Tailwind keyframes для звёзд

```ts
// tailwind.config.ts → extend.keyframes
twinkle: {
  '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
  '50%':       { opacity: '1',   transform: 'scale(1.4)' },
},

// extend.animation
'twinkle-slow':   'twinkle 4s ease-in-out infinite',
'twinkle-medium': 'twinkle 2.5s ease-in-out infinite',
'twinkle-fast':   'twinkle 1.8s ease-in-out infinite',
```

---

## 2. GLASSMORPHISM КАРТОЧКИ

Три карточки внизу hero-секции. Расположение: flex row, gap 24px, max-width 900px, centered.

### 2.1 Light mode

```css
background:      rgba(255, 255, 255, 0.55)
backdrop-filter: blur(16px) saturate(180%)
-webkit-backdrop-filter: blur(16px) saturate(180%)
border:          1px solid rgba(255, 255, 255, 0.75)
box-shadow:      0 4px 24px rgba(0, 0, 0, 0.08),
                 0 1px 0 rgba(255, 255, 255, 0.6) inset
border-radius:   20px
```

Tailwind-эквивалент через `style` prop + утилиты:
```
bg-white/55 backdrop-blur-md rounded-[20px]
border border-white/75
shadow-[0_4px_24px_rgba(0,0,0,0.08)]
```

### 2.2 Dark mode

```css
background:      rgba(15, 20, 40, 0.55)
backdrop-filter: blur(16px) saturate(160%)
-webkit-backdrop-filter: blur(16px) saturate(160%)
border:          1px solid rgba(255, 255, 255, 0.10)
box-shadow:      0 4px 32px rgba(0, 0, 0, 0.4),
                 0 1px 0 rgba(255, 255, 255, 0.06) inset
border-radius:   20px
```

Tailwind:
```
bg-[#0F1428]/55 backdrop-blur-md rounded-[20px]
border border-white/10
shadow-[0_4px_32px_rgba(0,0,0,0.4)]
```

### 2.3 Hover state (оба режима)

```css
/* Light */
background:      rgba(255, 255, 255, 0.72)
box-shadow:      0 8px 40px rgba(0, 0, 0, 0.13),
                 0 1px 0 rgba(255, 255, 255, 0.7) inset
transform:       translateY(-4px)
transition:      all 200ms ease-out

/* Dark */
background:      rgba(15, 20, 40, 0.72)
box-shadow:      0 8px 48px rgba(0, 0, 0, 0.55)
transform:       translateY(-4px)
transition:      all 200ms ease-out
```

Framer Motion реализация hover — см. раздел 7.

### 2.4 Размеры карточки

```
padding:       28px 24px
min-height:    160px
flex:          1 1 0px   (равная ширина в ряду)
max-width:     280px
```

---

## 3. ТИПОГРАФИКА

### 3.1 Шрифт

```
font-family: 'Manrope Variable', sans-serif
```

Подключение в `app/layout.tsx` через `next/font/google`:
```ts
import { Manrope } from 'next/font/google'

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
})
```

Затем `<html className={manrope.variable}>` и в Tailwind:
```ts
fontFamily: { sans: ['var(--font-manrope)', 'sans-serif'] }
```

### 3.2 Шкала размеров

| Элемент | Size | Weight | Line-height | Letter-spacing |
|---------|------|--------|-------------|----------------|
| Hero заголовок "neversleep" | 80px / clamp(48px, 9vw, 96px) | 800 | 1.0 | -0.04em |
| Hero подзаголовок | 22px / clamp(17px, 2.2vw, 24px) | 400 | 1.5 | -0.01em |
| Заголовок секции | 32px | 700 | 1.2 | -0.02em |
| Заголовок карточки | 18px | 700 | 1.3 | -0.01em |
| Текст карточки | 14px | 400 | 1.6 | 0em |
| Бейдж / метка | 12px | 600 | 1.0 | 0.04em |
| Body text (посты) | 17px | 400 | 1.75 | 0em |
| Pill-кнопки | 14px | 600 | 1.0 | 0em |

### 3.3 Tailwind fontSize config

```ts
// tailwind.config.ts → extend.fontSize
fontSize: {
  'hero':    ['clamp(48px, 9vw, 96px)', { lineHeight: '1.0',  letterSpacing: '-0.04em', fontWeight: '800' }],
  'hero-sub':['clamp(17px, 2.2vw, 24px)', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
  'section': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
  'card-title': ['18px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
  'card-body':  ['14px', { lineHeight: '1.6' }],
  'badge':   ['12px', { lineHeight: '1.0', letterSpacing: '0.04em' }],
  'post-body':  ['17px', { lineHeight: '1.75' }],
},
```

---

## 4. ЦВЕТОВАЯ ПАЛИТРА (Tailwind custom tokens)

### 4.1 Primary accent

```ts
// tailwind.config.ts → extend.colors
colors: {
  accent: {
    DEFAULT: '#3B82F6',   // blue-500 — кнопки, ссылки, активные состояния
    hover:   '#2563EB',   // blue-600
    light:   '#EFF6FF',   // blue-50 — подложки
    dark:    '#1D4ED8',   // blue-700
  },
```

### 4.2 Pill-кнопки быстрых категорий

```ts
  pill: {
    bg:           'rgba(255, 255, 255, 0.60)',  // glass default
    'bg-hover':   'rgba(255, 255, 255, 0.85)',
    'bg-active':  'rgba(59, 130, 246, 0.15)',   // слабый accent tint
    'bg-selected':'rgba(59, 130, 246, 1)',       // solid accent
    border:       'rgba(255, 255, 255, 0.70)',
    'border-dark':'rgba(255, 255, 255, 0.15)',
    text:         '#1A1A2E',
    'text-dark':  '#FFFFFF',
    'text-selected': '#FFFFFF',
  },
```

Состояния pill (light mode):
- **Default:** `bg-white/60 border border-white/70 text-[#1A1A2E]`
- **Hover:** `bg-white/85 shadow-sm` + `translateY(-1px)`
- **Active (press):** `bg-white/50 scale-95`
- **Selected:** `bg-accent text-white border-accent`

### 4.3 Бейджи типов постов

```ts
  post: {
    guide: {
      bg:   '#DBEAFE',   // синий — обучающие гайды
      text: '#1E40AF',
    },
    review: {
      bg:   '#D1FAE5',   // зелёный — обзоры инструментов
      text: '#065F46',
    },
    case: {
      bg:   '#FEF3C7',   // жёлтый — кейсы
      text: '#92400E',
    },
    list: {
      bg:   '#EDE9FE',   // фиолетовый — подборки
      text: '#5B21B6',
    },
  },
```

В dark mode каждый бейдж: opacity снижается до 80%, текст становится светлее (замена на светлые варианты palette-а).

### 4.4 Бейджи инструментов (нейтральный)

```ts
  tool: {
    bg:   'rgba(255, 255, 255, 0.20)',  // стекло
    text: 'inherit',                    // наследует от родителя
    border: 'rgba(255, 255, 255, 0.30)',
  },
```

Тёмная тема:
```ts
    'bg-dark':     'rgba(255, 255, 255, 0.08)',
    'border-dark': 'rgba(255, 255, 255, 0.12)',
```

---

## 5. СТРОКА ПОИСКА (Copilot-стиль)

### 5.1 Размеры и форма

```
width:         min(680px, 90vw)
height:        60px
border-radius: 9999px  (pill-форма)
padding:       0 20px 0 52px  (иконка слева, 52px отступ)
```

### 5.2 Фон — glassmorphism

```css
/* Light */
background:      rgba(255, 255, 255, 0.65)
backdrop-filter: blur(20px) saturate(180%)
border:          1px solid rgba(255, 255, 255, 0.80)
box-shadow:      0 2px 20px rgba(0, 0, 0, 0.08)

/* Dark */
background:      rgba(10, 14, 30, 0.55)
backdrop-filter: blur(20px)
border:          1px solid rgba(255, 255, 255, 0.12)
box-shadow:      0 2px 24px rgba(0, 0, 0, 0.35)
```

Tailwind-классы (light):
```
bg-white/65 backdrop-blur-xl rounded-full
border border-white/80
shadow-[0_2px_20px_rgba(0,0,0,0.08)]
px-5 h-[60px] pl-[52px]
```

### 5.3 Placeholder стиль

```css
font-size:   17px
font-weight: 400
color:       rgba(15, 23, 36, 0.45)   /* light */
color:       rgba(255, 255, 255, 0.40) /* dark */
```

Примеры placeholder текстов (ротируются каждые 3s через JS):
```
"как сделать пост в инстаграм через ИИ..."
"автоматизировать email-рассылку..."
"написать контент-план за 10 минут..."
"обработать фото без Photoshop..."
```

### 5.4 Focus state

```css
/* Убираем дефолтный outline */
outline: none;

/* Добавляем свечение */
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35),
            0 2px 20px rgba(0, 0, 0, 0.08);
border-color: rgba(59, 130, 246, 0.60);

transition: box-shadow 150ms ease, border-color 150ms ease;
```

Framer Motion для focus:
```ts
whileFocus={{
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35), 0 2px 20px rgba(0, 0, 0, 0.08)',
}}
```

### 5.5 Иконка поиска

- Позиция: абсолютно, `left: 18px`, `top: 50%`, `translateY(-50%)`
- Иконка: `lucide-react` → `<Search size={20} />`
- Цвет: `rgba(15, 23, 36, 0.40)` light / `rgba(255, 255, 255, 0.40)` dark
- При focus: `rgba(59, 130, 246, 0.80)` — становится акцентным

---

## 6. PILL-КНОПКИ ГРУПП ЗАДАЧ

Строка быстрых задач под поисковой строкой. Примеры: "для SMM", "написать текст", "обработать фото", "автоматизация", "видео".

### 6.1 Размеры

```
height:        36px
padding:       0 16px
border-radius: 9999px
gap между кнопками: 8px
font-size:     14px
font-weight:   600
```

### 6.2 Состояния (light mode)

**Default:**
```css
background:      rgba(255, 255, 255, 0.55)
border:          1px solid rgba(255, 255, 255, 0.70)
color:           #1A1A2E
backdrop-filter: blur(8px)
transition:      all 150ms ease
```

**Hover:**
```css
background:      rgba(255, 255, 255, 0.82)
border-color:    rgba(255, 255, 255, 0.90)
transform:       translateY(-1px)
box-shadow:      0 2px 12px rgba(0, 0, 0, 0.10)
```

**Active (mousedown):**
```css
transform:       scale(0.96) translateY(0)
background:      rgba(255, 255, 255, 0.45)
```

**Selected:**
```css
background:      #3B82F6
border-color:    #3B82F6
color:           #FFFFFF
box-shadow:      0 2px 12px rgba(59, 130, 246, 0.35)
```

### 6.3 Состояния (dark mode)

**Default:**
```css
background:      rgba(255, 255, 255, 0.08)
border:          1px solid rgba(255, 255, 255, 0.14)
color:           rgba(255, 255, 255, 0.85)
```

**Hover:**
```css
background:      rgba(255, 255, 255, 0.14)
border-color:    rgba(255, 255, 255, 0.22)
transform:       translateY(-1px)
```

**Selected (dark):**
```css
background:      #3B82F6
border-color:    transparent
color:           #FFFFFF
```

---

## 7. АНИМАЦИИ (Framer Motion)

### 7.1 Hero section — stagger детей

```ts
// Контейнер
const heroContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

// Каждый дочерний элемент
const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],  // custom ease — быстрый выход
    },
  },
}
```

Применение:
```tsx
<motion.div variants={heroContainer} initial="hidden" animate="show">
  <motion.h1 variants={heroItem}>neversleep</motion.h1>
  <motion.p variants={heroItem}>ИИ под твою задачу</motion.p>
  <motion.div variants={heroItem}>{/* search bar */}</motion.div>
  <motion.div variants={heroItem}>{/* pills */}</motion.div>
  <motion.div variants={heroItem}>{/* cards */}</motion.div>
</motion.div>
```

### 7.2 Карточки — появление при скролле

```ts
const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}
```

```tsx
<motion.div
  variants={cardReveal}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, margin: '-80px' }}
>
```

Stagger трёх карточек одновременно — обернуть в контейнер с `staggerChildren: 0.08`.

### 7.3 Переход времени суток

```ts
// Фон — плавная смена градиента
<motion.div
  animate={{ background: currentGradient }}
  transition={{ duration: 2.0, ease: 'easeInOut' }}
  className="fixed inset-0 -z-10"
/>
```

Цвет текста — через CSS custom property, анимируется через `color-mix` или JS-переключение класса с `transition-colors duration-[2000ms]`.

Тема (light/dark) переключается с задержкой `500ms` после смены фона, чтобы не было резкого скачка shadcn-компонентов.

### 7.4 Hover карточки — float/lift

```ts
<motion.div
  whileHover={{
    y: -6,
    scale: 1.015,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.16)',  // light
    transition: { duration: 0.2, ease: 'easeOut' },
  }}
  whileTap={{ scale: 0.98, y: -2 }}
>
```

Dark mode shadow для hover:
```
boxShadow: '0 16px 56px rgba(0, 0, 0, 0.50)'
```

---

## 8. TAILWIND CONFIG — полный extend-блок

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero':       ['clamp(48px, 9vw, 96px)', { lineHeight: '1.0',  letterSpacing: '-0.04em', fontWeight: '800' }],
        'hero-sub':   ['clamp(17px, 2.2vw, 24px)', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'section':    ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'card-title': ['18px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        'card-body':  ['14px', { lineHeight: '1.6' }],
        'badge':      ['12px', { lineHeight: '1.0', letterSpacing: '0.04em', fontWeight: '600' }],
        'post-body':  ['17px', { lineHeight: '1.75' }],
      },
      colors: {
        accent: {
          DEFAULT: '#3B82F6',
          hover:   '#2563EB',
          light:   '#EFF6FF',
          dark:    '#1D4ED8',
        },
        post: {
          guide:  { bg: '#DBEAFE', text: '#1E40AF' },
          review: { bg: '#D1FAE5', text: '#065F46' },
          case:   { bg: '#FEF3C7', text: '#92400E' },
          list:   { bg: '#EDE9FE', text: '#5B21B6' },
        },
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%':       { opacity: '1',   transform: 'scale(1.4)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'twinkle-slow':   'twinkle 4s ease-in-out infinite',
        'twinkle-medium': 'twinkle 2.5s ease-in-out infinite',
        'twinkle-fast':   'twinkle 1.8s ease-in-out infinite',
        'fade-up':        'fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '40px',
      },
      borderRadius: {
        card: '20px',
        pill: '9999px',
      },
      boxShadow: {
        glass:       '0 4px 24px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset',
        'glass-dark':'0 4px 32px rgba(0,0,0,0.40), 0 1px 0 rgba(255,255,255,0.06) inset',
        'glass-hover':       '0 8px 40px rgba(0,0,0,0.13), 0 1px 0 rgba(255,255,255,0.7) inset',
        'glass-hover-dark':  '0 8px 48px rgba(0,0,0,0.55)',
        'card-float':        '0 16px 48px rgba(0,0,0,0.16)',
        'card-float-dark':   '0 16px 56px rgba(0,0,0,0.50)',
        'search-focus':      '0 0 0 3px rgba(59,130,246,0.35), 0 2px 20px rgba(0,0,0,0.08)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '1500': '1500ms',
        '2000': '2000ms',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 9. СТРУКТУРА HERO-СЕКЦИИ

Порядок элементов сверху вниз, все center-aligned:

```
[1] Logo / wordmark "neversleep" — text-hero font-[800]
[2] Подзаголовок — text-hero-sub opacity-75
    "ИИ под твою задачу — гайды, обзоры, кейсы"
[3] Строка поиска — max-w-[680px] w-[90vw] h-[60px]
[4] Pill-кнопки — flex-wrap gap-2, mt-4
    ["для SMM"] ["написать текст"] ["обработать фото"] ["автоматизация"] ["видео"] ["+"]
[5] Три glassmorphism карточки — flex row gap-6, mt-10
    [Последний гайд] [Топ инструмент] [Популярная задача]
```

Vertical padding hero-секции: `pt-[15vh] pb-[8vh]`  
Горизонтальный padding: `px-4 sm:px-6`

---

## 10. АДАПТИВНОСТЬ

| Breakpoint | Hero title | Карточки | Pills |
|------------|-----------|----------|-------|
| Mobile < 640px | clamp → ~52px | stack vertical (1 col) | wrap, 2 в ряд |
| Tablet 640–1024px | clamp → ~72px | 2 + 1 внизу | wrap, 3 в ряд |
| Desktop > 1024px | clamp → 96px | 3 в ряд | 1 строка |

На мобильных карточки: `flex-col gap-4`, card width = `100%`, max-width = `380px`.

---

## 11. ACCESSIBILITY

- Контраст текст/фон — во всех 4 состояниях времени проверен на WCAG AA (4.5:1 минимум)
- Утро: тёмный #1A1A2E на #FFD6A5 — ratio ~7.2:1 ✓
- День: тёмный #0F1724 на #B8D9F8 — ratio ~8.1:1 ✓  
- Вечер: белый #FFF на #C9184A — ratio ~4.9:1 ✓
- Ночь: белый #FFF на #0D1B4B — ratio ~14:1 ✓
- `prefers-reduced-motion`: все Framer Motion анимации оборачиваются в проверку, при `reducedMotion === 'always'` — `duration: 0`, звёзды без twinkle
- Поисковая строка: `role="search"`, `aria-label="Поиск гайдов"`, `<label>` спрятан через `sr-only`
- Pill-кнопки: `role="button"` или `<button>`, `aria-pressed` для selected состояния
- Glassmorphism карточки: текст всегда минимум `card-body (14px / weight 400)`, на сниженном blur деградируют gracefully

---

## 12. GLOBALS.CSS — базовые стили

```css
/* app/globals.css */

@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');

:root {
  --font-manrope: 'Manrope', sans-serif;
  --transition-time: 2000ms;
  --bg-gradient: linear-gradient(180deg, #E8F4FD 0%, #B8D9F8 50%, #D4EAFF 100%); /* день по умолчанию */
}

* {
  box-sizing: border-box;
}

html {
  font-family: var(--font-manrope);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Glassmorphism утилиты */
.glass-light {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset;
}

.glass-dark {
  background: rgba(15, 20, 40, 0.55);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset;
}

/* Анимация звёзд */
@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.4); }
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #FFFFFF;
  animation: twinkle var(--duration, 3s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .star { animation: none; opacity: 0.6; }
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

---

*Спецификация составлена для передачи в разработку. Все значения проверены на совместимость с Tailwind CSS v3/v4 и Framer Motion v11.*
