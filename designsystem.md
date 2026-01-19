Design System: "Technical Blueprint"

Version: 1.3 (Harmonized Violet & Refined Type)

Status: Active

Aesthetic Classification: Digital Industrial / High-Fidelity Wireframe / E-Ink

1. Core Philosophy

This system treats the User Interface as a technical schematic. It eschews modern "soft" UI trends (shadows, blurs, gradients) in favor of absolute clarity, rigid grids, and raw data presentation.

The 3 Laws

The Metaphor: An architectural blueprint marked up with a violet engineer's pen.

The Rule of Ink: If it doesn't convey data or structure, remove it.

The Rule of Edge: Containers are sharp (0px radius); controls are organic (999px radius).

2. Color System & Harmony

The palette relies on "Cool Greys" to support the Violet accent. Rather than dead achromatic greys, the surfaces utilize low-saturation blue-greys to create a cohesive, atmospheric temperature that harmonizes with the accent.

2.1 Accent Token (The "Live Wire")

The accent color is treated as a highlighter pen. It indicates active energy, critical data, or primary interactivity.

Token

Hex

Role

color-accent-main

#3A2E6F

Primary Actions, Active States, Crosshairs

color-accent-hover

#4D4085

Hover states for primary actions

color-accent-subtle

#EBE9F5

Very faint accent wash (rarely used)

2.2 Surface Tokens (Harmonized Cool Greys)

Theory: We use "Slate" tones instead of pure grey to reduce visual vibration against the violet.

Token

Hex

Role

surface-canvas

#E8E9ED

Global background (Cool Concrete)

surface-card

#FFFFFF

Primary container background

surface-subtle

#F5F6F8

Internal segmentation

2.3 Ink Tokens (Text & Icons)

Token

Hex

Role

ink-primary

#0F1115

Headlines (Off-black for less harshness)

ink-secondary

#585C65

Labels, body text (Cool Grey)

ink-tertiary

#9AA0A6

Placeholders, disabled states

ink-on-accent

#FFFFFF

Text inside primary buttons

2.4 Border Tokens

Token

Hex

Role

border-grid

#C4C6CD

Structural lines (Cool Grey)

border-element

#E0E2E6

Subtle borders within a card

2.5 Functional Signals (Semantic)

Theory: High-visibility colors selected to maintain temperature consistency or deliberate contrast with the Violet accent.

Token

Hex

Role

Relation to Accent

signal-error

#B3261E

Critical Failure

Split-Complementary (High Tension)

signal-warning

#E6B000

Attention Needed

Complementary (Max Contrast)

signal-success

#006E50

Operational

Analogous Cool (Harmonious)

3. Typography (Modern Minimalist Refinement)

Typography drives the elegance of the system. We use a Neo-Grotesque approach: tighter headlines, wide micro-labels, and a dedicated mono font for data density.

Primary Font: Geist Sans, Inter, or Suisse Int'l. (Rational, clean, neutral).
Data Font: JetBrains Mono or Geist Mono. (Humanist monospace).

3.1 Type Scale & Dynamics

Refinement Note: We avoid heavy weights (Bold/Black). Hierarchy is achieved through size and casing, not thickness.

Role

Weight

Size

Line Height

Tracking

Case

Display XL

Light (300)

48px

1.0 (Tight)

-2.5%

Sentence

H1 Title

Regular (400)

24px

1.2

-1.0%

Sentence

H2 Subhead

Regular (400)

16px

1.4

-0.5%

Sentence

Body Reading

Regular (400)

14px

1.5

0%

Sentence

Label/Micro

Medium (500)

11px

1.0

+6%

UPPERCASE

Data Numerical

Regular (400)

13px

1.4

0%

Tabular Nums

3.2 Typographic Rules

Tabular Figures: All numbers in data tables or dashboards must use font-variant-numeric: tabular-nums to ensure vertical alignment.

Optical Alignment: For Display XL, allow characters to hang slightly into the margin if possible for optical straightness.

No Italics: This system does not use italics. If emphasis is needed, use color (color-accent-main).

4. Grid Architecture (The "Bento" Logic)

The layout uses a visible modular grid.

Gap: 0px. No transparency between cards.

Separation: Cards are separated by 1px solid lines (border-grid).

Artifacts: The corners where four grid modules meet are marked with a visual artifact.

The Crosshair Artifact (+)

Every major intersection must feature a registration mark.

Symbol: Plus sign (+)

Color: color-accent-main (#3A2E6F)

Position: Absolute, overlapping the border intersection.

5. Component Library

5.1 Containers (Cards)

Shape: Strictly Rectangular.

Border Radius: 0px.

Shadows: None.

Stroke: 1px border-grid outline.

Header: Title (Top Left) + Directional Icon (Top Right, in Accent Color).

5.2 Buttons & Controls

Controls serve as the organic contrast to the rigid grid.

Shape: Full Pill (Capsule). border-radius: 999px.

Primary Action: Solid #3A2E6F background, White text.

Secondary Action: Transparent background, 1px #3A2E6F border, #3A2E6F text.

Toggles: High contrast. #3A2E6F circle thumb on a #E8E9ED track.

5.3 Iconography

Style: Linear / Stroke-based.

Stroke Width: 1.5px (Uniform).

Active State: Rendered in Accent Color.

6. Data Visualization

Data should feel like it is drawn with a plotter pen.

Charts: 1px stroke weight.

Active Data Line: Rendered in Accent #3A2E6F.

Context Lines: Rendered in ink-secondary (#585C65).

Fills: No solid fills. Use vertical hatching or dithering.

7. Imagery & Texture

The "Dither" Mandate: Photographic or 3D content must never be rendered in full gradients. It must be processed to look like 1-bit or grayscale print.

Standard: Grayscale Dither (Black dots on White).

Featured/Active: Duotone Dithering (Violet #3A2E6F dots on White).

Perspective: Isometric or Orthographic preferred.

8. Developer Handoff (CSS Variables)

:root {
  /* Surface (Cool Greys) */
  --surface-canvas: #E8E9ED;
  --surface-card:   #FFFFFF;
  --surface-subtle: #F5F6F8;

  /* Ink (Cool Tones) */
  --ink-primary:   #0F1115;
  --ink-secondary: #585C65;
  --ink-tertiary:  #9AA0A6;
  --ink-on-accent: #FFFFFF;

  /* Accent (Violet) */
  --color-accent-main:   #3A2E6F;
  --color-accent-hover:  #4D4085;
  --color-accent-subtle: #EBE9F5;

  /* Functional Signals */
  --signal-error:   #B3261E;
  --signal-warning: #E6B000;
  --signal-success: #006E50;

  /* Borders */
  --border-grid:    #C4C6CD;
  --border-element: #E0E2E6;
  --border-accent:  #3A2E6F;
  
  /* Typography Stack */
  --font-sans: 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', monospace;
}

/* Utility Class: Grid Intersections */
.grid-cell {
  position: relative;
  background: var(--surface-card);
  border: 1px solid var(--border-grid);
}

.grid-cell::after {
  content: "+";
  position: absolute;
  top: -8px; 
  right: -8px;
  color: var(--color-accent-main);
  font-family: monospace;
  z-index: 10;
  background: transparent;
}

