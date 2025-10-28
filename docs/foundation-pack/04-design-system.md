## Tokens

### Light 

--bg: hsl(220 20% 99%);
--surface: hsl(220 23% 98%);
--surface-2: hsl(220 22% 96%);

--border: hsl(220 15% 86%);

--fg: hsl(222 15% 15%);
--fg-muted: hsl(222 10% 38%);

--accent: hsl(0 72% 50%);
--accent-weak: hsl(0 84% 60%);

--status-open-fg: hsl(160 86% 26%);
--status-open-bg: hsl(152 76% 97%);
--status-open-border: hsl(152 43% 80%);
--status-in-progress-fg: hsl(32 95% 33%);
--status-in-progress-bg: hsl(48 100% 97%);
--status-in-progress-border: hsl(47 75% 80%);
--status-closed-fg: hsl(215 15% 35%);
--status-closed-bg: hsl(215 25% 94%);
--status-closed-border: hsl(215 16% 80%);

### Dark

--bg: hsl(222 47% 7%);
--surface: hsl(222 47% 10%);
--surface-2: hsl(222 47% 13%);

--border: hsl(217 19% 27%);

--fg: hsl(210 40% 96%);
--fg-muted: hsl(214 18% 68%);

--accent: hsl(0 90% 72%);
--accent-weak: hsl(0 85% 64%);

--status-open-fg: hsl(152 62% 72%);
--status-open-bg: hsl(161 88% 10%);
--status-open-border: hsl(160 61% 28%);
--status-in-progress-fg: hsl(42 95% 70%);
--status-in-progress-bg: hsl(35 92% 12%);
--status-in-progress-border: hsl(39 86% 32%);
--status-closed-fg: hsl(215 20% 78%);
--status-closed-bg: hsl(222 40% 18%);
--status-closed-border: hsl(220 16% 32%);

```css
@theme {

	--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", Ubuntu, Cantarell, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";
	--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
	
	--color-bg: var(--bg);
	--color-surface: var(--surface);
	--color-surface-2: var(--surface-2);
	--color-border: var(--border);
	--color-fg: var(--fg);
	--color-fg-muted: var(--fg-muted);
	--color-accent: var(--accent);
	--color-accent-weak: var(--accent-weak);
	--color-status-open-fg: var(--status-open-fg);
	--color-status-open-bg: var(--status-open-bg);
	--color-status-open-border: var(--status-open-border);
	--color-status-in-progress-fg: var(--status-in-progress-fg);
	--color-status-in-progress-bg: var(--status-in-progress-bg);
	--color-status-in-progress-border: var(--status-in-progress-border);
	--color-status-closed-fg: var(--status-closed-fg);
	--color-status-closed-bg: var(--status-closed-bg);
	--color-status-closed-border: var(--status-closed-border);
	
	--spacing-xs: 0.25rem; 
	--spacing-sm: 0.5rem; 
	--spacing-md: 0.75rem;
	
	--spacing-lg: 1rem; 
	--spacing-xl: 1.5rem; 
	--spacing-2xl: 2rem;
	
	--radius-sm: 0.25rem; 
	--radius-md: 0.5rem; 
	--radius-lg: 0.75rem; 
	--radius-xl: 1rem; 
	--radius-pill: 9999px;
	
	--shadow-1: 0 1px 2px rgba(0,0,0,.25);
	--shadow-2: 0 6px 16px rgba(0,0,0,.35);
	
	--breakpoint-sm: 640px; 
	--breakpoint-md: 768px; 
	--breakpoint-lg: 1024px; 
	--breakpoint-xl: 1280px; 
	--breakpoint-2xl: 1440px;
}
```