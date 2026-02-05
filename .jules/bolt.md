## 2025-05-18 - Framer Motion vs CSS for LCP
**Learning:** `framer-motion`'s `initial` prop hides content until hydration, hurting LCP. Also, using it for simple continuous loops (like bouncing arrows) adds unnecessary JS overhead.
**Action:** Use CSS animations for continuous loops and avoid `initial` on above-the-fold content. Prefer static rendering or server-side compatible CSS for LCP elements.
