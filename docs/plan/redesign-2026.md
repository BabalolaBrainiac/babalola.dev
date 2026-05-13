# babalola.dev Full Redesign Plan
**Date**: 2026-04-20  
**Status**: Implemented — run `npm run dev` to preview locally

---

## Design Language: Amber Terminal

**Concept**: Vintage tech CRT aesthetic. IBM amber phosphor monitor meets modern portfolio.
Simple, dark, focused. One accent color. No glassmorphism.

### Color Palette
```
Background:   #0a0a0a  (near-black)
Surface:      #111111
Surface-2:    #161616
Amber:        #e8a000  (single accent)
Amber-dim:    #a06800
Text:         #d4d0c8  (warm off-white)
Text muted:   #888888
Text dim:     #3a3a3a
Border:       #1e1e1e
Border-2:     #2a2a2a
```

### Typography
- **Font**: JetBrains Mono — monospace throughout, no display/sans fonts
- Section labels: `// 01.` prefix in amber
- All uppercase labels: `text-[10px] uppercase tracking-widest`

### UI Principles
- No glassmorphism, no blur effects
- Crisp 1px borders: `border border-[#1e1e1e]`
- Hover: `hover:border-[#e8a000]` — border turns amber
- Buttons: outlined amber (`border border-[#e8a000] text-[#e8a000]`) → solid on hover
- No rounded corners (sharp edges)
- Amber `›` prefix for list items and nav links

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/globals.css` | Full rewrite — amber terminal design system |
| `src/app/components/NavBar.tsx` | Terminal-style top nav |
| `src/app/components/Sidebar.tsx` | Amber terminal sidebar (icon-only → expand on hover) |
| `src/app/components/MainBody.tsx` | Full portfolio redesign |
| `src/app/blog/BlogPageClient.tsx` | Blog listing redesign (magazine + amber) |
| `src/app/blog/components/BlogPostCard.tsx` | Card redesign |
| `src/app/blog/[slug]/BlogPostClient.tsx` | Post page redesign |

---

## Portfolio Sections

1. **Hero**: Large type, role rotation, amber `_` cursor, minimal CTA buttons
2. **About** (`// 01`): Education + stats + interests with amber borders
3. **Experience** (`// 02`): Company selector (left) + detail panel (right)
4. **Projects** (`// 03`): Filter tabs + card grid, amber on hover
5. **Skills** (`// 04`): Grouped cards with tag lists
6. **Open Source** (`// 05`): Bordered cards with bullet highlights
7. **Contact** (`// 06`): 4-column social grid

---

## Blog

- **Listing page**: Magazine layout (featured hero + recent sidebar + filtered grid)
- **Post page**: Reading progress bar (amber), sticky TOC, clean author card
- **Cards**: Amber category label, hover border turns amber

---

## Admin Back Office (`/brainiac`) — Planned

Not yet implemented. Future work:
- `/brainiac` — dashboard (post counts, quick actions)
- `/brainiac/blog` — post management table
- `/brainiac/projects` — project CRUD
- `/brainiac/uploads` — media library
- `/brainiac/jobs` — job listings
- `/brainiac/settings` — profile + auth settings

---

## Running Locally

```bash
cd /Users/opeyemibabalola/Desktop/Workspace/opeyemi/projects/babalola.dev
npm run dev
# → http://localhost:3000
```
