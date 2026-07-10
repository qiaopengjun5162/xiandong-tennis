# Frontend Visual QA

This checklist keeps visual work honest without turning the MVP into a heavy design system. Use it when a change affects `apps/web`, public UI text, layout, animations, or share-card output.

## Evidence To Capture

- Desktop screenshot of the affected flow.
- Mobile screenshot of the same flow.
- Result screen screenshot, including reveal animation end state when relevant.
- Share poster PNG when result-card or typography changes.
- Short recording when the change affects transitions, confetti, bouncing balls, auto-advance, or browser share behavior.

## Visual Audit

- Colors still match the parchment / tennis weapon direction.
- Typography remains local-font only; do not reintroduce remote Google Fonts.
- Spacing and card proportions hold on mobile, tablet, and desktop.
- Buttons have visible default, hover, active, disabled, and focus states when applicable.
- Background texture, decorative balls, and confetti do not block content or controls.
- Result cards remain readable when copied, shared, or downloaded as PNG.

## Interaction Audit

- Start flow reaches question 1.
- Option tap selects once and auto-advances after the intended delay.
- Previous and skip keep the fixed 16-slot answer shape.
- Result URL parameter `?r=KEY` still opens the expected result.
- Share actions degrade safely when browser APIs are unavailable.

## Recording

PRs that affect UI should fill the `Visual Evidence` section in `.github/PULL_REQUEST_TEMPLATE.md`. If screenshots are not attached, explain why and list the manual viewport checks that were run.
