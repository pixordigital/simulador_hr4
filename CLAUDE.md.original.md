# Simulador de Frete — CLAUDE.md

## Visão Geral do Projeto

Web app help logistics/freight company based in **João Pessoa, PB, Brazil** calculate delivery pricing — no **undercharge** (loss) or **overcharge** (lose client).

**Audience**: office team — owner + 2-5 people, desktop use.
**Language**: Portuguese (pt-BR) everywhere — labels, errors, text, config. No exceptions, no English tech terms.
**Theme**: Light/dark mode, user-toggleable.
**Layout**: Desktop-optimized. No mobile responsiveness.

### Business

- Operates **exclusively in João Pessoa and Greater JP**.
- Own fleet: **KANGOO** (light van) and **8-160** (light truck).
- Uses **freelance drivers** hired per job (fixed rate per job).
- Choice between KANGOO, 8-160, or freelancer depends on weight and availability — no fixed rule. Simulator shows three costs side by side, user decides.
- Offers **dedicated delivery** (exclusive vehicle per day + km) and **scheduled delivery** (guaranteed time agreed with client).

> **Note on Concept Cargo**: table studied only to copy pricing structure (minimum rate + weight tiers). Not present in app.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Persistence**: JSON files only — no DB, no auth, no login. All data (history, drivers, payments, templates, configs) stored in JSON files on filesystem via API Routes.
- **Styling**: Tailwind CSS with dark/light mode via `class` strategy
- **Fonts**: Geist Sans (body and UI) + Geist Mono (numeric values, prices) — both available natively in Next.js via `next/font/google`
- **No authentication**: App opens directly without login. Anyone with URL access can use.

---

## Design System and Visual Identity

### Aesthetic Direction — "Precision Freight"

App should not look like generic SaaS product. Should look like tool built specifically for serious freight company — visual seriousness of industrial control panel with typographic precision of financial software. Heavy where heavy needed, clean where clean needed.

**Visual tone references** (not layout):
- Information density of Bloomberg terminals
- Readability of customs tables and CTe
- Chromatic confidence of premium logistics brands (DHL, Maersk)

**Absolutely avoid:**
- Excessive rounded corners (looks like delivery app, not serious company)
- Decorative gradients on buttons or cards
- Colored icons on every menu item
- Cards with generic soft shadows
- Too-light sans-serif typography (looks like startup landing page)
- Empty states with cute illustrations

---

### Color Palette — HR Cargo

Palette built from brand colors (orange/amber + navy dark), applied with editorial discipline — orange used sparingly, as hierarchy tool, not decoration.

```css
/* Brand */
--brand-orange:     #F97316;   /* laranja HR Cargo — usado só onde importa */
--brand-orange-dim: #C2590A;   /* laranja queimado — hover, pressed states */
--brand-navy:       #0F1C2E;   /* navy profundo — sidebar, headers, âncora visual */
--brand-navy-mid:   #1A2E45;   /* navy médio — hover na sidebar */

/* Superfícies — Light */
--surface-base:     #F5F5F4;   /* fundo geral — quase branco, levemente quente */
--surface-raised:   #FFFFFF;   /* cards, painéis — branco puro sobre base */
--surface-sunken:   #EBEBEA;   /* inputs, áreas internas de cards */

/* Superfícies — Dark */
--surface-base-dk:  #0A0F1A;   /* fundo geral dark — quase preto com toque azul */
--surface-raised-dk:#111827;   /* cards dark */
--surface-sunken-dk:#1F2937;   /* inputs dark */

/* Bordas */
--border-subtle:    #E0DFDD;   /* light mode — divisores, bordas de card */
--border-strong:    #A8A29E;   /* light mode — bordas de input, separadores */
--border-subtle-dk: #1F2937;   /* dark mode */
--border-strong-dk: #374151;   /* dark mode */

/* Texto */
--text-primary:     #111110;   /* quase preto — títulos, valores */
--text-secondary:   #78716C;   /* cinza médio — labels, metadata */
--text-disabled:    #A8A29E;   /* cinza claro — placeholders */
--text-primary-dk:  #F5F5F4;
--text-secondary-dk:#9CA3AF;

/* Semânticas — discretas, não vibrantes */
--semantic-gain:    #15803D;   /* verde escuro — margem positiva, lucro */
--semantic-loss:    #B91C1C;   /* vermelho escuro — prejuízo, alerta crítico */
--semantic-warn:    #92400E;   /* âmbar escuro — atenção moderada */
--semantic-info:    #1E40AF;   /* azul escuro — informação neutra */
```

> Principle: `--brand-orange` appears in max 3 places per screen — primary button, active sidebar item, one important data accent. Everything else builds hierarchy with typographic weight and surface contrast, not color.

---

### Typography — Dual with Character

```
Display / Page Titles: DM Sans
  - Weight: 700 (Bold) and 500 (Medium)
  - Used in: screen title ("Nova Simulação"), client name in result,
    large KPI values on dashboard
  - Tone: modern, solid, not cold

Interface / Body: Inter
  - Weight: 400 (Regular) and 500 (Medium) and 600 (SemiBold)
  - Used in: labels, buttons, navigation, support text
  - Scale: 12px (micro), 13px (label), 14px (body), 16px (highlight)

Numeric: JetBrains Mono
  - Weight: 500 (Medium)
  - Used EXCLUSIVELY for: R$ values, kg, km, margin %
  - Why JetBrains Mono not Geist Mono: native tabular figures,
    better legibility on long numbers like R$ 38.416,68
  - Not for labels, titles, or any non-numeric text

Typography scale:
  xs:   11px / Inter 400 — metadata, timestamps
  sm:   13px / Inter 500 — field labels, badges
  base: 14px / Inter 400 — body, descriptions
  md:   16px / Inter 600 — section subtitles
  lg:   20px / DM Sans 700 — panel titles
  xl:   28px / DM Sans 700 — page title
  kpi:  36px / JetBrains Mono 500 — large dashboard values
```

---

### Spacing and Geometry — Angular, Not Rounded

```
Border radius:
  - Inputs, badges, tooltips: 4px (almost straight — professional, not cute)
  - Cards and panels: 6px (minimal — structure, not decoration)
  - Primary button: 6px
  - Modal/overlay: 8px
  - NEVER use 12px, 16px, or rounded-full on functional elements

Borders:
  - Cards: 1px solid --border-subtle (no shadow — border enough)
  - Selected card: 2px solid --brand-orange (highlight by thickness, not background color)
  - Input: 1px solid --border-strong, focus: 2px solid --brand-orange
  - Internal dividers: 1px solid --border-subtle

Shadows — used extremely sparingly:
  - Dropdowns and modals: 0 8px 24px rgba(0,0,0,0.12) — real depth
  - Cards: NO shadow — border does work
  - Primary button hover: NO shadow — color change enough

Internal spacing:
  - Default card: padding 20px
  - Form section: padding 24px
  - Gap between fields: 16px
  - Gap between sections: 32px
  - Sidebar item: padding 10px 16px
```

---

### Components — Detailed Visual Specs

**Sidebar (240px, always visible)**
- Background: `--brand-navy` (#0F1C2E) — immutable in light and dark mode
- Top: HR Cargo logo on left, white. Below, 1px divider line in navy-mid. No excess padding.
- Inactive nav item: text `#94A3B8` (slate-400), no colored icon, no background. Hover: background `--brand-navy-mid`, white text.
- Active item: 3px orange vertical bar on left border + white text + background `--brand-navy-mid`. No orange background — too heavy.
- Sidebar footer: dark/light mode toggle (icon only, no label), separated from menu by divider line.
- No collapse animation — sidebar fixed.

**Primary button**
- Background: solid `--brand-orange`
- Text: white, Inter 600, 14px, no ALL CAPS — sentence case
- Hover: `--brand-orange-dim` — 120ms transition
- Padding: 10px 18px
- Border-radius: 6px
- No shadow, no gradient, no required icon

**Secondary button**
- Background: transparent
- Border: 1px solid `--border-strong`
- Text: `--text-primary`
- Hover: background `--surface-sunken`

**Cost Cards (KANGOO / 8-160 / Freelancer)**
- Layout: three equal-width columns, horizontally aligned
- Each card: 1px `--border-subtle`, padding 20px, radius 6px
- Card header: vehicle/driver name in Inter 600 14px + relevant technical detail in 12px gray (e.g. "10 km/L · diesel")
- Main value: JetBrains Mono 500 24px, `--text-primary`
- Neutral state: no special background color
- "Cheapest" state: small chip "↓ Menor custo" in dark green (`--semantic-gain`), green-50 background, top-right corner. Card border: 2px `--semantic-gain`.
- Selected state: 2px `--brand-orange` border. No colored background.
- Alert state: 2px `--semantic-loss` border.
- Hover on unselected card: subtle `--surface-sunken` background

**Form Inputs**
- Label: Inter 500 13px, `--text-secondary`, margin-bottom 6px
- Input: height 38px, padding 0 12px, 1px `--border-strong`, radius 4px, background `--surface-raised`
- Focus: outline none, 2px `--brand-orange`
- Placeholder: Inter 400, `--text-disabled`
- Input with error: `--semantic-loss` border + 12px red message below
- Unit (kg, km, R$): right-side text inside input, Inter 400 14px `--text-secondary` — not as separate label

**Multi-stop Table**
- Not stacked cards — use real table with rows
- Table header: Inter 500 12px uppercase with letter-spacing 0.05em, `--text-secondary` — professional document look
- Stop row: 1px `--border-subtle` bottom border
- Value column: JetBrains Mono 500, right-aligned
- Total row: Inter 700, separated by 2px `--border-strong` top border

**Financial Alerts**
- Inline (more expensive option): `--text-secondary` 13px text with "↑ R$ X more than cheapest option" — no box, no icon, integrated into card
- Critical banner (below break-even): full-width strip, `--semantic-loss` background at 8% opacity, 3px solid left border `--semantic-loss`, padding 12px 16px. Text in `--semantic-loss` 14px Inter 500. No emoji icon — use typographic symbol "⚑" or none.

**KPI Cards (dashboard)**
- Layout: 4 cards in row
- No shadow, 1px `--border-subtle`
- Label: Inter 400 12px uppercase letter-spacing 0.08em, `--text-secondary`
- Value: JetBrains Mono 500 32px, `--text-primary`
- Variation: Inter 500 13px, green or red per direction
- No decorative icons — numbers speak for themselves

---

### Signature Element — Weight Ruler

Unique visual element: horizontal **weight ruler** on New Simulation screen, below stop weight field.

Thin bar (4px height) with vertical marks at weight tier transitions (10kg, 20kg, 35kg, 50kg, 70kg, 100kg...), orange indicator moves as user types weight. Passing a mark changes active tier, R$/kg shown discretely above bar.

Purpose: visually inform which price tier load falls in, encourage user to understand pricing structure. Specific to freight domain — doesn't exist in any other app type.

Implement with simple `<div>` + CSS positioning + JS for indicator position. No chart libraries.

---

### Dark Mode

- Default on open: **light mode**
- Toggle: icon in sidebar footer, persists in localStorage
- Implementation: Tailwind `dark:` + `class="dark"` on `<html>`
- Sidebar stays `--brand-navy` always — no mode change
- Dark mode: `--surface-base-dk` (#0A0F1A) background — darker than conventional for more contrast with cards

---

### Animations — Surgical

```
What animates and why:
  - Weight ruler: indicator moves real-time (no easing — linear, like measuring instrument)
  - New stop added: line appears with height 0→auto + opacity 0→1,
    200ms ease-out. Gives sense of progressive quote construction.
  - Critical alert banner: 3px left border appears with clip-path
    0→100% height in 300ms — attention without agitation.
  - Theme transition: 150ms ease on background-color and color only.
    Do not animate transforms.
  - Skeleton screens: subtle 1.5s pulse in loading areas (lists, history)

What does NOT animate:
  - Button hover (color change only)
  - Dropdown opening (instantaneous)
  - Screen navigation (no page transitions)
  - Cost cards on selection (border only — no scale or bounce)
```

---

## Navigation Structure and Layout

### General Layout
- **Fixed left sidebar** always visible — main app navigation
- Content area on right occupies rest of screen
- Sidebar never collapses (desktop-only, enough space)

### Sidebar Items (top to bottom order)
1. **Nova Simulação** — main item, visually highlighted, first in list
2. **Histórico** — past simulation list + profitability dashboard
3. **Templates** — saved simulation templates for reuse
4. **Motoristas** — freelancer registry
5. **Pagamentos** — freelancer payment records (auto monthly totals)
6. **Configurações** — operational parameters and price table
7. *(separator)*
8. **Tema** — dark/light mode toggle (icon only, no text label)

> Remove any "Sair" or "Logout" item — no authentication.

### Home Screen
Depends on app state:
- **First access** (price table empty, no freelancers registered): show **welcome screen with initial setup checklist** before anything else — see "First Access" section below.
- **Subsequent accesses**: **Nova Simulação** opens automatically — user starts quoting immediately with no extra clicks.

### Usage Frequency Hierarchy
Claude Code should reflect this hierarchy in visual design:
- **High frequency**: Nova Simulação, Histórico
- **Medium frequency**: Motoristas, Pagamentos, Templates
- **Low frequency**: Configurações

---

## First Access — Welcome Screen

Shown automatically when app detects price table is empty (all `0` values in `taxas-regioes.json`) or no freelancers registered.

**Layout**: Welcome screen with visual checklist of initial setup tasks. Each item has status (pending/complete) and button leading to corresponding screen.

**Checklist Items:**
1. ✅/⬜ **Configure fuel price** → Configurações
2. ✅/⬜ **Fill price table** (rates by zone and weight tier) → Configurações
3. ✅/⬜ **Register freelance drivers** → Motoristas
4. ✅/⬜ **Set default margin** → Configurações
5. ✅/⬜ **Set scheduling surcharge** → Configurações (optional)

- Completed items marked ✅, visually "complete"
- User can ignore screen and go directly to any screen via sidebar
- After all critical items (1, 2, 3, 4) completed, welcome screen no longer shows on subsequent accesses
- "View again" link available in Configurações if user wants to revisit checklist

---

## New Simulation Screen — Layout

### Column Proportion
**58% / 42%** split (left column / right column):
- Left slightly bigger — user works here
- Right wide enough for three readable cost cards
- Columns separated by 1px vertical `--border-subtle` — not empty gap, not shadow. Line is divider.

### Left Column — Input Form

```
┌─────────────────────────────────────┐
│  NOVA SIMULAÇÃO          [Limpar]   │  ← title DM Sans 700 20px +
│                                     │    secondary "Limpar" button
├─────────────────────────────────────┤
│  Cliente                            │  ← label Inter 500 13px
│  [________________________]         │  ← 38px input
│                                     │
│  Motorista / Veículo                │
│  [KANGOO ▼] [8-160 ▼] [Freelancer▼]│  ← 3 selectable chips, not dropdown
│                                     │
│  Daily deliveries  [___8___]        │  ← number of deliveries (allocates cost)
├─────────────────────────────────────┤
│  STOPS                     [+ Add]  │  ← eyebrow Inter 500 12px uppercase
│                                     │
│  Zone      Weight   NF Value (opt.) │  ← mini-header of stops table
│  [JP ▼]   [___kg]  [R$ _____]      │  ← new stop row
│                                     │
│  ┌──────────────────────────────┐   │
│  │ weight ruler ←————●————→   │   │  ← signature element
│  │     10  20  35  50  70  100  │   │    appears only with weight > 0
│  └──────────────────────────────┘   │
│                                     │
│  ─── Added stops ──────────────     │  ← separator with label
│  #1  Cabedelo  12kg  —      R$X.XX  │
│  #2  JP        3kg   R$500  R$X.XX  │
│  [+ Add another stop]               │
│                                     │
├─────────────────────────────────────┤
│  ○ Scheduled Delivery               │  ← toggle (radio-style switch)
│    Date [___] Time [___]  +R$[___]  │    expands when active
└─────────────────────────────────────┘
```

**Critical detail — driver selection:**
Not a dropdown for KANGOO / 8-160 / Freelancer. Use three **selectable chips** in row:
- Chip: Inter 500 13px, padding 6px 14px, radius 4px, 1px border
- Inactive: `--border-strong`, text `--text-secondary`
- Active: 2px `--brand-orange`, text `--brand-orange`, 5% orange background
- When "Freelancer" active: expands selector below with registered freelancer list + editable value field

### Right Column — Live Result Panel

**Empty state** (before user fills any field):
```
┌──────────────────────────────────┐
│                                  │
│                                  │
│      Fill delivery data to       │
│      see real-time quote.        │  ← DM Sans 500 18px, --text-secondary
│                                  │
│      ─────────────────────       │
│                                  │
│      Driver cost, tier           │
│      freight, and margin         │  ← Inter 400 14px --text-disabled
│      calculated automatically.   │
│                                  │
└──────────────────────────────────┘
```
No illustration, no big icon, no button. Just text. Simplicity intentional — right panel is result screen, not onboarding.

**Active state** (with data filled):
```
┌──────────────────────────────────┐
│ KANGOO      8-160    Freelancer  │  ← option tabs/cards
│ ┌────────┐ ┌────────┐ ┌────────┐│
│ │↓ Menor │ │        │ │        ││
│ │R$47,20 │ │R$53,80 │ │R$60,00 ││  ← JetBrains Mono 500 24px
│ │        │ │        │ │        ││
│ └────────┘ └────────┘ └────────┘│
│                                  │
│ ▼ View breakdown                 │  ← collapsible, Inter 500 13px
│                                  │
│ ──────────────────────────────   │
│ Margin    [──────●──] 8%         │  ← slider + editable numeric input
│                                  │
│ ┌──────────────────────────────┐ │
│ │ SUGGESTED PRICE              │ │  ← label 12px uppercase
│ │ R$ 51,46                     │ │  ← JetBrains Mono 700 36px orange
│ └──────────────────────────────┘ │
│                                  │
│ [Save quote] [Save template]     │
└──────────────────────────────────┘
```

**Margin slider detail:**
- Styled native HTML slider + numeric input on right accepting direct typing. Two-way synced.
- Suggested price recalculates real-time with 100ms debounce.
- Slider track: `--border-strong`, thumb: `--brand-orange` 16px circle.

**Collapsible breakdown:**
When expanded, mini-table appears between cost cards and slider:
```
  Salary portion          R$ 28.44
  Meal allowance          R$ 3.36
  Fuel                    R$ 8.20
  Maintenance             R$ 0.84
  Insurance               R$ 2.68
  Depreciation            R$ 0.00
  Tier freight            R$ 3.68
  ─────────────────────────────────
  Total cost              R$ 47.20
```
All values in JetBrains Mono right-aligned. Labels Inter 400 13px. Total row: Inter 600, 1px `--border-strong` top border.

---

## History Screen — Layout and Density

History screen should have visual density of professional spreadsheet, not card list. User reads data quickly.

### Screen Header
```
┌──────────────────────────────────────────────────────────────┐
│ QUOTATION HISTORY                   [Period ▼] [Filter ▼]    │
│                                                               │
│ Jun 2026                                                      │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│ │QUOTATIONS│  │TOTAL     │  │CHARGED   │  │MARGIN   │      │
│ │   47     │  │R$28.420  │  │R$26.100  │  │  18,4%   │      │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└──────────────────────────────────────────────────────────────┘
```
KPI cards without individual borders — grouped under header as unit. Large values in JetBrains Mono, labels in Inter 400 12px uppercase.

### Simulation Table
```
DATE           CLIENT          TYPE       STOPS                  VEHICLE    COST    MARGIN  SUGGESTED  CHARGED
───────────────────────────────────────────────────────────────────────────────────────────────────────────────
14/06 14:32  Farmácias ABC    Regular    JP 12kg · CB 8kg      KANGOO     R$47,20    8%    R$51,46   R$51,46
14/06 11:15  Distribuidora X  Dedicada   Santa Rita             8-160     R$240,00   10%    R$264,00    —
13/06 16:40  Cliente Y        Agendada   JP 3kg                 Freelancer R$60,00    8%    R$64,80   R$70,00 ←negotiated
```

- Table font: Inter 400 13px for text, JetBrains Mono 13px for numbers
- Row hover: `--surface-sunken` background
- "Charged" column: if empty, show "—" in `--text-disabled`. If filled and different from suggested, show in `--semantic-gain` (green) if higher, `--semantic-loss` (red) if lower.
- "SUGGESTED PRICE" and "CHARGED" columns: click opens minimal inline edit (only "Charged" field editable — suggested immutable)
- Table header: Inter 500 11px uppercase letter-spacing 0.06em, `--text-secondary`. Numeric columns header right-aligned.
- No pagination up to 500 rows — virtualize above that.

---

## Welcome Screen — Visual

Not generic "welcome to system" screen. Has editorial character.

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  HR CARGO                                          Jun 2026  │  ← logo + date
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  Configure the simulator                                      │  ← DM Sans 700 28px
│  before starting.                                             │
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  ○  Fuel price                           Configurações →     │  ← task
│  ○  Zone price table                     Configurações →     │
│  ○  Freelance drivers                    Motoristas →        │
│  ○  Default margin                       Configurações →     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  ○  Scheduling surcharge (optional)      Configurações →     │
│                                                               │
│                          [Start anyway →]                     │  ← secondary button
└──────────────────────────────────────────────────────────────┘
```

- Background: normal `--surface-base` — not a special different-colored screen
- "○" turns orange "●" when task complete, text strikethrough
- Completed tasks in `--text-secondary` (weaker)
- Pending tasks in `--text-primary` (strong)
- "→" link: Inter 500 13px `--brand-orange`, no underline
- When 4 critical tasks done, button changes to "Go to Nova Simulação →" (orange, primary)
- Layout horizontally centered, max-width 640px

---

## Templates and Simulation Duplication

For recurring clients, app offers two mechanisms:

### 1. Save as template
After completing any simulation, user can save as template with descriptive name (e.g. "Cliente X — weekly Cabedelo delivery"). Templates independent of history — not in simulation list, only on Templates screen.

### 2. Duplicate simulation
Any history row has "Duplicate" button — opens new pre-filled simulation with all original params (client, stops, zones, weights, driver, margin). User adjusts what changed.

### Templates Screen
Simple design, no quantity limit — search by name list, no forced pagination. Each item shows: template name, delivery type, client, creation date. Actions: "Use", "Edit", "Delete".

Templates stored in `data/dynamic/templates.json` (see Storage section).

---

## History Immutability

**History is immutable** — saved simulations never recalculate with new prices. User updates price table in Configurações, all previous history simulations keep exact numbers from creation time.

Guaranteed by architecture: `resultado_json` stores final calculated values at creation — history never reads current price table for past results. `input_json` also preserved intact for reference and duplication.

This rule applies to all fields: fuel price, salary, zone table, freight rates — any Configurações change is prospective, never retroactive.

---

### 1. Simulation — Single vs. Multi-Stop

Each simulation can have **one or multiple stops** for same client. Single driver/vehicle selected for **entire simulation** — not per individual stop.

**Multi-stop flow:**
1. User selects driver/vehicle for entire simulation (KANGOO, 8-160, or freelancer) and informs how many deliveries driver makes that day
2. User adds first stop (zone + weight + optional NF value) → stop cost calculated and shown **immediately**
3. User adds second stop → calculated immediately, **total updated real-time**
4. Repeat for N stops — each calculated on addition
5. Final result shows: individual price per stop + **highlighted grand total** (sum of all stops × margin)

Driver fixed cost (salary + vehicle) divided by daily delivery count — allocation applies equally to all simulation stops.

---

### 2. Pricing Engines

#### A. Regular Delivery

Priced by **zone + taxable weight** per stop.

**Taxable weight** = `max(actual weight, cubic weight)`
where `cubic weight = length(m) × width(m) × height(m) × 167`

**Price table** (`taxas-regioes.json`):
- Structured by user-defined zones (João Pessoa + Greater JP)
- Each zone has: minimum rate (covers up to base weight, e.g. 10kg) + weight tiers with R$/kg above minimum

**NF value charges (apply to own deliveries):**
- **GRIS**: 0.10% of NF value, minimum R$4.00
- **Ad-Valorem**: 0.30% of NF value
- "NF Value" field is **optional** in simulation — user doesn't always know value at quote time. Behavior:
  - If informed: GRIS and Ad-Valorem calculated and included in cost
  - If not informed: GRIS and Ad-Valorem omitted from calculation, result shows clear notice: "GRIS and Ad-Valorem not included — inform NF value for full calculation"
- Formula when NF informed:
  ```
  gris = max(NFvalue × 0.001, 4.00)
  adValorem = NFvalue × 0.003
  totalCost = weightFreight + gris + adValorem
  ```

**One driver/vehicle per simulation** — selected at start, applies to all stops. Options:

| Option      | Cost basis |
|-------------|------------|
| KANGOO     | (daily salary + allowance + KANGOO daily operational costs) ÷ daily deliveries |
| 8-160      | (daily salary + allowance + 8-160 daily operational costs) ÷ daily deliveries |
| Freelancer | negotiated rate for entire job (single value per simulation, independent of stop count) |

For multi-stop freelancer: user informs **one negotiated value for entire job** (not multiplied per stop). Freelancer rate field editable in simulation, independent of default saved in registry — each job negotiated individually.

On simulation screen, show three total costs side by side before user confirms choice — sees cost difference before deciding. Cheapest option visually highlighted.

#### B. Dedicated Delivery

Exclusive vehicle for one client, priced by **day(s) + km**, unrelated to weight or cargo value.

Cost derived from vehicle operational inputs (KANGOO or 8-160):
```
daily base = (vehicle daily fixed cost + daily salary) × (1 + margin)
extra km rate = (fuel/km + maintenance/km) × (1 + margin)
total cost = daily base × days + max(0, estimated km − included km) × extra km rate
```

**Required fields in dedicated simulation:**
- Vehicle (KANGOO or 8-160)
- Number of days
- **Estimated route km** — user informs per simulation (estimated total work distance). No pre-configured default.
- Km included in daily rate — configured per vehicle in Configurações
- Optional assistant/helper: additional daily rate (configurable)

---

### 3. Scheduled Delivery (guaranteed time service)

Service layer applicable on **regular or dedicated**. Client agrees specific time (e.g. "10am Monday") and pays for guarantee.

```
suggested price = (delivery cost + scheduling surcharge) × (1 + margin)
```

- Present in UI as named service "Scheduled Delivery" — not as checkbox
- Fields: date, agreed time, surcharge in R$ (default R$0.00)
- Date/time saved in history

---

### 4. Simulation Output

**Per stop:**
- Zone, taxable weight, calculated cost, selected option (KANGOO/8-160/freelancer)
- Collapsible breakdown: shows total per stop by default; on expand, shows each component separately:
  - Salary portion (R$)
  - Meal allowance portion (R$)
  - Fuel portion (R$)
  - Maintenance portion (R$)
  - Insurance portion (R$)
  - Depreciation portion (R$)
  - Weight tier rate (R$)
  - GRIS (R$) — shown only if NF value informed
  - Ad-Valorem (R$) — shown only if NF value informed
  - Scheduling surcharge if applicable (R$)

**Summary:**
- Total cost (sum of stops)
- Margin % — pre-filled with default, **freely adjustable per simulation**, recalculates real-time
- **Suggested client price** (highlighted, sum of stops × margin)
- **Charged price (optional)** — editable field to record actual negotiated price if different from suggested. Saved in history for future comparison.

**Automatic financial alerts** — two visibility levels:

1. **More expensive option selected** (discrete — inline):
   - Shown subtly below selected option
   - "ℹ️ There is an option R$ X cheaper available"
   - Does not interrupt flow, just informs

2. **Price below break-even** (critical — banner):
   - Prominent banner at top of result section
   - "⚠️ Attention: suggested price is below your cost. You will lose R$ X on this delivery."
   - Red/orange, impossible to ignore
   - Recalculates real-time as user adjusts margin

Both alerts are **informational** — never block user from proceeding.

---

## History Screen and Profitability Dashboard

History screen has **three sections**:

### 1. Profitability Dashboard (top)
Comparison between actual operational cost and total charged amount in period:

- **Monthly fixed operational cost** — auto-calculated from configs: salary × drivers + fuel + maintenance + insurance + depreciation + meal allowance (all values from `motoristas-proprios.json`)
- **Monthly freelancer cost** — sum of payments registered in `pagamentos_freelancer` for period
- **Total operational cost** = fixed + freelancers
- **Total suggested** — sum of suggested prices from period simulations
- **Total charged** — sum of `charged_price` from simulations where registered (with indicator of how many simulations have charged price vs. only suggested)
- **Estimated real margin** = (total charged − total operational cost) ÷ total charged
- **Suggested vs. charged difference** — how much gained or lost in client negotiation

> This dashboard answers: "Are my real costs covered? Am I gaining or losing in client negotiation?"

### 2. Simulation Metrics
- Total simulations in period
- Total quoted value
- Average margin applied in simulations
- Average cost per simulated delivery

### 3. Simulation List
Each row shows directly (no need to open):
- Date and time
- Client name
- Delivery type (Regular / Dedicada / Agendada)
- Stops: zones and weights of each stop
- Driver/vehicle used
- Total cost
- Margin applied (%)
- Total suggested price
- Charged price (if registered) — highlighted differently from suggested if diverging

Filters: client name, delivery type, period (start/end date).
History is **read-only** — no accept/decline status. Charged price can be added/edited directly on list row.

---

## Configurações Screen

Configurações screen replaces manual JSON file editing. Writes to files via API Route (`/api/configuracoes`). All sections and labels in **Portuguese (pt-BR)**.

**Mandatory error handling**: if file write fails, UI must show clear error message — never fail silently.

**Visual hierarchy of sections** — fields changed at different frequencies should have different visual weight:

- **Changed monthly** → visual highlight, easy access:
  - Fuel price per liter (KANGOO and 8-160)
  - Scheduling surcharge

- **Rarely changed** → secondary sections, collapsible:
  - Salary, meal allowance, work days
  - Maintenance, insurance, depreciation
  - Dedicated delivery parameters
  - Zone price table

Suggested layout: put "Fuel" and "Scheduling" at top of Configurações screen, remaining sections below in collapsed accordions.

### Configurações Screen Sections:

**General**
- Default margin (%)
- Default daily deliveries
- Scheduling surcharge (R$)

**Own Drivers**
- Monthly gross salary (R$)
- Work days per month
- Meal allowance per driver (R$/month)

**Vehicle: KANGOO**
- Monthly fuel (R$)
- Monthly maintenance (R$)
- Monthly insurance (R$)
- Monthly depreciation (R$)
- Fuel price per liter (R$)
- Consumption (km per liter)

**Vehicle: 8-160**
- Same fields as KANGOO

**Dedicated Delivery — KANGOO**
- Km included in daily rate
- Monthly fixed cost (R$)
- Price per liter (R$)
- Consumption (km per liter)
- Maintenance per km (R$)

**Dedicated Delivery — 8-160**
- Same fields

---

## Freelance Driver Registration

Simple CRUD: name, default rate per job (R$), notes.
In simulation: select from registry (rate pre-filled, adjustable per simulation).

**Initial seed** (extracted from April/2026 records):
- DANIELLA NOBREGA HENRIQUES GAMA
- MARCIO JOAO DE OLIVEIRA SANTOS
- HAYRON LEITE COUTINHO RAMOS
- DAVID HENRICH MEDEIROS DE SANTANA

> `default_fee` for each to be confirmed by user — monthly totals don't reveal individual per-job values.

---

## App Access

- **No authentication** — app opens directly on Nova Simulação screen
- No login, no password, no session
- Anyone with URL access can use all features
- Drivers don't access app (internal office use only)

---

## Data Storage

### JSON Files (written via `/api/configuracoes`)

```
data/
  rates/
    taxas-regioes.json       # zone price table
  config/
    geral.json               # default margin: 8%, default daily deliveries: 8,
                             # scheduling surcharge: R$0.00 (user-defined)
    motoristas-proprios.json # salary, allowance, work days, vehicle costs
    dedicada.json            # dedicated cost inputs per vehicle
```

**`taxas-regioes.json`:**
```ts
interface FaixaPreco {
  origem: string;        // "JOAO PESSOA/PB"
  zona: string;          // zone name
  taxaMinima: number;    // R$ — covers up to pesoBase kg
  pesoBase: number;      // kg covered by taxaMinima
  faixas: {
    min: number;         // kg
    max: number;         // kg (99999.99 for last tier)
    precoPorKg: number;  // R$/kg in this tier
  }[];
}
```

**Confirmed zones — initial file seed:**
```json
[
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "João Pessoa",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  },
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "Cabedelo",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  },
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "Conde",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  },
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "Santa Rita",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  },
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "Bayeux",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  },
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "Alhandra",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  }
]
```
> All values `0` — fill via Configurações after app built. Weight tiers mirror Concept Cargo structure (market reference). User can add/remove tiers per pricing strategy.

**`motoristas-proprios.json`:**
```ts
interface ConfigMotoristaProprio {
  salarioMensal: number;
  diasUteisporMes: number;
  valeAlimentacao: number;
  veiculos: {
    [nome: string]: {        // "KANGOO" | "8-160"
      combustivelMensal: number;
      manutencaoMensal: number;
      seguroMensal: number;
      depreciacaoMensal: number;
      precoCombustivelLitro: number;
      consumoKmPorLitro: number;
    }
  }
}
// daily cost per vehicle =
//   (salary + allowance + fuel + maintenance + insurance + depreciation) ÷ work days
// cost per delivery = daily cost ÷ daily deliveries
```

### Dynamic Data Persistence (JSON via API Routes)

No database. All data stored in JSON files on server, read/written via Next.js API Routes.

Files in `data/dynamic/`:
- `motoristas-freelancer.json` — freelance driver registry
- `pagamentos-freelancer.json` — payment log to freelancers
- `simulacoes.json` — simulation history
- `templates.json` — saved templates

```ts
// simulacoes.json — array of:
interface Simulacao {
  id: string;                  // client-generated uuid
  criadoEm: string;            // ISO datetime
  nomeCliente: string;
  tipoEntrega: 'regular' | 'dedicada';
  agendada: boolean;
  dataHorarioAgendado?: string;
  acrescimoAgendamento?: number;
  margemPct: number;
  valorNF?: number;
  grisIncluido: boolean;
  adValoremIncluido: boolean;
  inputJson: object;
  resultadoJson: object;
  precoCobrado?: number;       // editable post-simulation
  observacoes?: string;
}

// motoristas-freelancer.json — array of:
interface MotoristaFreelancer {
  id: string;
  nome: string;
  taxaPadrao: number;
  observacoes?: string;
  criadoEm: string;
}

// pagamentos-freelancer.json — array of:
interface PagamentoFreelancer {
  id: string;
  motoristaId: string;
  valor: number;
  dataPagamento: string;   // YYYY-MM-DD
  descricao?: string;
  criadoEm: string;
}

// templates.json — array of:
interface Template {
  id: string;
  nome: string;
  descricao?: string;
  inputJson: object;
  criadoEm: string;
  atualizadoEm: string;
}
```

---

## Calculation Module Structure

All in `lib/precificacao/` — pure functions, no I/O, independently testable.

```
lib/precificacao/
  tipos.ts            # FaixaPreco, ConfigMotoristaProprio, EntradaSimulacao,
                      # ResultadoSimulacao, DetalhamentoCusto, OpcaoEntrega, Parada
  peso.ts             # taxable weight: max(actual weight, cubic weight with factor 167)
  regular.ts          # zone lookup + tiers, KANGOO / 8-160 / freelancer cost
                      # per stop, returns three options for side-by-side display
  dedicada.ts         # derives daily + extra km from inputs, per vehicle
  agendada.ts         # applies surcharge before margin
  simular.ts          # unified input → dispatches to correct engine →
                      # aggregates stops → returns complete result with breakdown
```

---

## Real Cost Data (April/2026)

Extracted from `lancamentos_financeiro.xls` — 01/04 to 30/04/2026, all SETTLED.

### Operational Summary
| Cost Center             | April/2026 Total |
|-------------------------|------------------|
| AGREGADO (freelancers)  | R$ 38,416.68     |
| SALARY                  | R$ 12,267.14     |
| FUEL                    | R$ 5,252.29      |
| MECHANICAL              | R$ 4,230.37      |
| MEAL ALLOWANCE          | R$ 4,866.60      |
| VEHICLE INSURANCE       | R$ 2,356.61      |
| DAILY RATE              | R$ 1,210.00      |
| **TOTAL OPERATIONAL**   | **R$ 68,599.69** |

### Fuel per Vehicle
| Vehicle | Monthly Total | Refuels | Average/Refuel |
|---------|---------------|---------|----------------|
| KANGOO  | R$ 1,704.78   | 6       | ~R$ 284.00     |
| 8-160   | R$ 3,397.51   | 4       | ~R$ 849.38     |

### Maintenance per Vehicle
| Vehicle            | Monthly Total |
|--------------------|---------------|
| KANGOO             | R$ 184.00     |
| 8-160              | R$ 1,944.37   |
| Unidentified       | R$ 2,102.00   |

### Salaries
- Reference salary: **R$ 1,964.63/month** (main driver — NILSON)
- Meal allowance: **R$ 738.00–R$ 774.90/month** per employee
- Standard daily rate identified: **R$ 240.00/day**

### Active Freelance Drivers
| Name                              | April Total | Payments |
|-----------------------------------|-------------|----------|
| HAYRON LEITE COUTINHO RAMOS       | R$ 11,582.00 | 1        |
| MARCIO JOAO DE OLIVEIRA SANTOS    | R$ 6,150.00  | 2        |
| DANIELLA NOBREGA HENRIQUES GAMA   | R$ 2,150.00  | 3        |
| DAVID HENRICH MEDEIROS DE SANTANA | R$ 1,850.00  | 2        |

### Initial Values for `motoristas-proprios.json`
```json
{
  "salarioMensal": 1964.63,
  "diasUteisPorMes": 22,
  "valeAlimentacao": 738.00,
  "veiculos": {
    "KANGOO": {
      "combustivelMensal": 1704.78,
      "manutencaoMensal": 184.00,
      "seguroMensal": 589.15,
      "depreciacaoMensal": 0,
      "precoCombustivelLitro": 6.20,
      "consumoKmPorLitro": 10.0
    },
    "8-160": {
      "combustivelMensal": 3397.51,
      "manutencaoMensal": 1944.37,
      "seguroMensal": 1767.46,
      "depreciacaoMensal": 0,
      "precoCombustivelLitro": 6.20,
      "consumoKmPorLitro": 7.0
    }
  }
}
```
> Proportional insurance: R$ 2,356.61 total ÷ 2 vehicles.
> Depreciation and actual consumption (km/L) to be confirmed with user.

---

## MVP Scope (build in this order)

1. **Base layout + navigation** — fixed sidebar with 6 items (Nova Simulação, Histórico, Templates, Motoristas, Pagamentos, Configurações), first access vs. subsequent access logic.
2. **Welcome screen (first access)** — 5 initial setup checklist items, each linking to corresponding screen, auto pending/completed status. Disappears after critical items done.
3. **Regular delivery (single stop)** — two-panel layout (left: form, right: live result), driver/vehicle selection, zone + weight tier lookup, optional GRIS/Ad-Valorem, three costs side by side, real-time adjustable margin, two-level alerts (inline discrete + critical banner), collapsible per-component breakdown.
4. **Multi-stop** — add N stops sequentially, each calculated immediately, right panel updated real-time, freelancer with per-job negotiated rate.
5. **Freelance driver registration (Motoristas)** — CRUD with 4-driver seed, instructive empty state.
6. **Payment recording (Pagamentos)** — own sidebar screen, individual log with auto monthly totals.
7. **Scheduled delivery** — service layer on regular, date/time fields, surcharge added before margin, named service in UI.
8. **Dedicated delivery** — per-vehicle calculator, per-simulation estimated km, multi-day and excess km.
9. **Scheduled dedicated delivery** — combination of both services.
10. **Templates and duplication** — save as named template, duplicate from history, Templates screen with search by name, no forced pagination.
11. **Configurações screen** — fuel and scheduling highlighted at top, remaining sections collapsible, write via API Route with explicit error, never fail silently.
12. **History + Profitability Dashboard** — JSON persistence via API Route, each simulation saved with immutable result, optional editable charged price field inline, dashboard with fixed cost + freelancers + suggested vs. charged + estimated real margin, filterable list.

---

## Open Items / Confirm with User

**No blocking items remaining.** App can be built entirely.

Only missing values are **freight table prices** — minimum rates and R$/kg per weight tier for each of 6 zones. Zones already defined in JSON with `0` values. User fills actual prices via Configurações after app built.

All other items resolved:
- ✅ Zones: **João Pessoa, Cabedelo, Conde, Santa Rita, Bayeux, Alhandra**
- ✅ Default margin: **8%**
- ✅ Default daily deliveries: **8**
- ✅ Scheduling surcharge: **R$0.00** (user defines later in app)
- ✅ GRIS and Ad-Valorem: **apply** — optional NF value field
- ✅ KANGOO consumption: **10 km/L** | 8-160: **7 km/L**
- ✅ Depreciation: **R$0.00** initial (user inputs later in app)
- ✅ Default freelancer rate: user defines in registry after build

---

## Conventions

- All values in BRL (R$) — stored as numbers, formatted only in UI.
- Weight in kg, distance in km, volume in m³.
- Every displayed price must be traceable to its components — no "black box" totals. Breakdown always available via expansion.
- Company operates only in João Pessoa and Greater JP. Do not model other regions.
- Interface 100% in **Portuguese (pt-BR)** — no exceptions, no English technical terms, not even in config labels.
- App optimized for **desktop**. No responsive layout needed.
- Support **light and dark mode**, user-toggleable.
- JSON config files written via API Route — never manually edited by end user.
- **History is immutable** — saved simulations never recalculate with new prices. `resultado_json` recorded at simulation time is permanent. Price table or operational cost changes affect only future simulations, never past ones.
- **Empty state always instructive** — any screen without data (no freelancers, no templates, no simulations) must display clear message explaining what to do, never a blank screen.