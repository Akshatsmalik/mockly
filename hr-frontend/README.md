# Mockly.AI Frontend

A polished interview simulator frontend built with React, Tailwind CSS, and Framer Motion.

## Quick Start

```bash
npm install
npm run dev
```

## Architecture

### Animation System (`src/lib/motion.js`)

Consistent motion design tokens:

| Duration | Value | Use Case |
|----------|-------|----------|
| XS | 80ms | Micro interactions |
| S | 150ms | Quick feedback |
| M | 300ms | Standard transitions |
| L | 450ms | Emphasis animations |

**Easing Functions:**
- Primary: `cubic-bezier(.22,.9,.33,1)` - snappy, natural
- Soft: `cubic-bezier(.25,.46,.45,.94)` - gentle, smooth
- Elastic: `cubic-bezier(.5,1.6,.64,1)` - bouncy (use sparingly)

### Components

#### Layout
- `Sidebar` - Dark sidebar with nav and recent items
- `Topbar` - Minimal header with avatar
- `Hero` - Center hero with headline and CTA

#### Chat
- `ChatBubble` - Message bubble (system/user variants)
- `ChatInput` - Input bar with voice/send
- `ChatTimeline` - Scrollable message container

#### Display
- `KPITile` - Statistic card with animated counter
- `Card` - Versatile card container
- `PointsCard` - Sticky note style card

#### Overlay
- `ProfilePopover` - Avatar dropdown menu
- `Modal` - Accessible dialog
- `Toast` - Notification system

#### Utility
- `Skeleton` - Loading placeholders
- `Button` - Animated button variants

### Pages

- `/chat` - Main chat interface
- `/results` - Interview report page

## Design Tokens (Tailwind)

```js
colors: {
  brand: '#0ea5ff',
  darkbg: '#393939',
  panel: '#f6f6f8',
  muted: '#9AA0A6',
}

shadows: {
  soft: '0 2px 8px...',
  popup: '0 8px 30px...',
}
```

## Animation Rules

1. **Cards**: opacity 0→1, y 10→0, scale .995→1
2. **Buttons**: scale 1→1.03 on hover
3. **Popovers**: scale .97→1 with shadow pop
4. **Lists**: 0.06s stagger
5. **Scroll reveal**: `whileInView`, `once: true`

## License

MIT

