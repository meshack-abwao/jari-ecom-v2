# JARI.ECOM V2 - Template Isolation Project
## Starting Prompt for Next Chat Session

---

**Copy everything below this line and paste into a new Claude chat:**

---

# 🎯 PROJECT: JARI.ECOM V2 - Template Isolation

## WHO I AM
I'm Mesh, Technical Lead at Jari Solutions. We're building an e-commerce platform for Kenya/East Africa called Jari.Ecom V2.

## WHAT WE'RE DOING
We need to surgically separate our monolithic storefront code into isolated, independent template modules. This is a critical architectural refactor.

## CURRENT PROBLEM
- `store/src/render.js` = **926 lines** (ALL templates mixed together)
- `store/src/styles/base.css` = **3716 lines** (ALL CSS mixed together)
- One change to Deep Dive template could break Quick Decision template
- High risk of CSS conflicts and regressions

## THE GOAL
Separate each template into its own folder:
```
store/src/templates/
├── quick-decision/
│   ├── qd-render.js
│   └── qd-styles.css
├── deep-dive/
│   ├── dd-render.js
│   └── dd-styles.css
├── visual-menu/
│   ├── vm-render.js
│   └── vm-styles.css
└── portfolio-booking/  ← Already isolated (our model)
    ├── pbk-render.js
    └── pbk-styles.css
```

## YOUR FIRST ACTIONS

**Step 1: Read the handover documentation**
```
Read these files in order:
1. C:\Users\ADMIN\Desktop\jari-ecom-v2\docs\TEMPLATE-ISOLATION-HANDOVER.md
2. C:\Users\ADMIN\Desktop\jari-ecom-v2\docs\PROJECT-INSTRUCTIONS.md
```

**Step 2: Check git status**
```powershell
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status; git log --oneline -5
```

**Step 3: Create feature branch**
```powershell
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git checkout -b feature/template-isolation
```

**Step 4: Begin Phase 1 - Extract Shared Utilities**
This is the safest starting point with zero behavior change.

## CRITICAL RULES

1. **READ BEFORE EDIT** - Always `read_file` to see current state before making changes
2. **SURGICAL EDITS** - Use `edit_block` with exact string matches, small focused changes
3. **COMMIT OFTEN** - After each successful change: `git add -A; git commit -m "message"`
4. **ONE TEMPLATE AT A TIME** - Don't extract multiple templates simultaneously
5. **DON'T DELETE** - Keep old code commented until new code is verified working
6. **TEST AFTER EACH PHASE** - Ask me to test in browser before proceeding

## FILE LOCATIONS (Key Reference)

| File | Lines | Purpose |
|------|-------|---------|
| `store/src/render.js` | 926 | All template rendering |
| `store/src/styles/base.css` | 3716 | All CSS |
| `store/src/state.js` | ~50 | Global state |
| `store/src/main.js` | ~200 | App initialization |

### render.js Function Locations:
- `renderQuickDecision()` → Lines 265-321
- `renderVisualMenu()` → Lines 326-461
- `renderDeepDive()` → Lines 466-800+
- `renderSingleProduct()` → Lines 246-260 (dispatcher)

### base.css Section Locations:
- CSS Variables → Lines 1-100
- Base/Reset → Lines 100-300
- Header/Footer → Lines 300-600
- Quick Decision → Lines 1000-1400
- Visual Menu → Lines 1400-1840
- **Deep Dive** → Lines 1840-3200 (largest!)
- Lightbox → Lines 3200-3716

## THE 5 PHASES (Execute in Order)

### Phase 1: Extract Shared Utilities (SAFE)
- Create `store/src/shared/utils.js`
- Move: formatPrice, formatDate, truncateText
- Import in render.js - NO behavior change

### Phase 2: Extract Deep Dive (MEDIUM RISK)
- Create `store/src/templates/deep-dive/dd-render.js`
- Create `store/src/templates/deep-dive/dd-styles.css`
- Move Deep Dive functions and CSS
- Update render.js to import from new location
- **TEST THOROUGHLY**

### Phase 3: Extract Visual Menu
- Same pattern as Phase 2

### Phase 4: Extract Quick Decision
- Same pattern as Phase 2

### Phase 5: Clean Up
- Remove extracted code from monoliths
- Verify all templates work
- Merge to main

## DEBUG FORMULAS (If Something Breaks)

**CSS Not Loading:**
```javascript
// Check browser network tab for 404s
// Verify file path is correct
```

**Function Not Found:**
```javascript
// Check import statement
// Verify export exists in source file
import * as module from './path.js';
console.log(Object.keys(module));
```

**State Undefined:**
```javascript
// Each template module needs:
import { state } from '../../state.js';
```

**Rollback if Needed:**
```powershell
git checkout -- store/src/render.js
git checkout -- store/src/styles/base.css
```

## GIT COMMANDS (Windows PowerShell)

```powershell
# Always use semicolons, NOT &&
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status

# Commit after each successful change
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git commit -m "Phase X: description"

# Push when phase complete
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git push origin feature/template-isolation
```

## TECH STACK CONTEXT

- **Storefront:** Vanilla JavaScript + CSS (no framework)
- **Dashboard:** React + Vite
- **API:** Express.js
- **Database:** PostgreSQL on Railway
- **Hosting:** Netlify

## WHAT SUCCESS LOOKS LIKE

After all phases:
- `render.js` reduced from 926 → ~200 lines (just dispatcher)
- `base.css` reduced from 3716 → ~800 lines (just shared styles)
- Each template in its own folder with own JS + CSS
- Zero CSS conflicts between templates
- Each template can evolve independently

## START NOW

Please begin by:
1. Reading the handover document at `C:\Users\ADMIN\Desktop\jari-ecom-v2\docs\TEMPLATE-ISOLATION-HANDOVER.md`
2. Checking git status
3. Creating the feature branch
4. Starting Phase 1

Ask me any clarifying questions before making changes. Let's do this surgically and safely! 🎯

---

**End of prompt**
