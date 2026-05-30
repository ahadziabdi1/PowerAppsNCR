# ConstructSafe Manager — Power Platform NCR Solution

A **Non-Conformity Reporting and Tracking System** built on Microsoft Power Platform for ConstructSafe Inc., developed as part of the NETWORG Power Apps Candidate Review Assignment.

---

## Architecture

```
[ Canvas App ]        → Mobile UI for field workers (photo upload, corrective actions)
[ Model-Driven App ]  → Full management interface (forms, views, BPF, dashboards)
[ Dataverse ]         → Relational database — Non-Conformity (1:N) Corrective Action
[ Power Automate ]    → Automated notifications (decoupled dual-flow, Standard tier only)
```

**Custom Publisher prefix:** `nwrg_` — ensures namespace isolation and ALM readiness.

---

## Features

### Required User Stories

| User Story | Implementation | Status |
|------------|---------------|--------|
| Report Non-Conformity | Custom table with type-based conditional fields | ✅ |
| Attach Evidence | Native Notes/Attachments + OneDrive photo links | ✅ |
| Corrective Actions | 1:N relationship with embedded subgrid on form | ✅ |
| Assign Managers | Lookup field + TypeScript email auto-population | ✅ |
| Notifications | Decoupled dual-flow Power Automate (Standard tier) | ✅ |

### Bonus & Optional Tasks

| Task | Status | Notes |
|------|--------|-------|
| TypeScript conditional form logic | ✅ | See `src/webresources/src/` |
| Power Automate PDF generation | ✅ | OneDrive Convert File (pivoted from SharePoint) |
| Business Process Flow | ✅ | 4-stage lifecycle with cumulative field locking |
| Canvas App with photo upload | ✅ | Base64 → Power Automate → OneDrive → Dataverse URL |
| Autonumbering (NCR-001 format) | ✅ | Native Dataverse Autonumber column |
| Security / RBAC | ✅ | NCR User (Basic) + NCR Manager (Org-level) |
| HTTP-triggered flow | ⚠️ | Simulated with manual trigger — HTTP requires Premium license |
| OAuth / External API | ⚠️ | Blocked by university SAML tenant policy — root cause documented |
| Custom connector | ❌ | Not implemented |

---

## TypeScript Web Resources

All client-side logic is written in TypeScript, compiled to JavaScript, and deployed as Web Resources. Four scripts cover the pro-code layer:

### `conditionalFormLogic.ts`
Dynamically shows or hides fields based on the selected Non-Conformity Type (Safety / Quality / Environmental). Registered on form `OnLoad` and NC Type field `OnChange`.

```typescript
switch (ncTypeValue) {
  case 799180000: safetyField?.setVisible(true); break;        // Safety
  case 799180001: qualityField?.setVisible(true); break;       // Quality
  case 799180002: environmentalField?.setVisible(true); break; // Environmental
}
```

### `populateManagerEmail.ts`
When a manager is selected from the Lookup, this script fetches their email via the **Dataverse Web API** and writes it to a plain text field. This allows Power Automate to read the email using a **Standard connector** — no Premium `Get Row by ID` needed.

### `AutoStatusUpdate.ts`
State-machine logic — when Status changes to `Resolved`, the script automatically sets it to `Closed` and calls `formContext.data.entity.save()`.

### `LockFieldsOnStage.ts`
Monitors the active BPF stage and applies cumulative field locking. Fields from completed stages become read-only as the process moves forward. Also shows a contextual guidance message at the top of the form per stage. Uses hybrid event handling (`OnStageChange` + `OnSave` fallback) to handle platform timing edge cases.

---

## Business Rules vs Custom Scripts

| | Business Rules | TypeScript Web Resources |
|-|---------------|--------------------------|
| Skill required | No-code | Pro-code (TypeScript) |
| Complexity | Simple conditions only | Unlimited logic |
| Dataverse Web API access | No | Yes |
| BPF stage awareness | No | Yes |
| Async operations | No | Yes |
| Auto-save capability | No | Yes |

**When to use which:** Business Rules are ideal for simple show/hide and required field logic. TypeScript is needed for anything involving async data fetching, BPF integration, cross-field logic, or automatic saves.

---

## Repository Structure

```
PowerAppsNCR/
├── src/
│   ├── webresources/src/
│   │   ├── conditionalFormLogic.ts   # Dynamic field visibility
│   │   ├── populateManagerEmail.ts   # Manager email auto-population
│   │   ├── AutoStatusUpdate.ts       # Resolved → Closed state machine
│   │   └── LockFieldsOnStage.ts      # BPF stage locking + guidance
│   └── Other/
│       ├── Solution.xml              # Power Platform solution manifest
│       ├── Customizations.xml        # Entity/form customizations
│       └── Relationships.xml         # Table relationships
├── dist/                             # Compiled JavaScript output
├── tsconfig.json
└── package.json
```

---

## Local Setup

```bash
git clone https://github.com/ahadziabdi1/PowerAppsNCR.git
cd PowerAppsNCR
npm install       # installs @types/xrm and typescript
npm run build     # compiles TypeScript → dist/
```

Compiled `.js` files from `dist/` are uploaded as Web Resources in the Power Platform solution and registered on form events via the Form Properties editor.

---

## Key Technical Decisions

| Challenge | Solution |
|-----------|----------|
| Premium connector needed for manager email | TypeScript + Web API stamps email at form load |
| SharePoint PDF conversion API deprecated | Pivoted to OneDrive `Convert File` action |
| Single notification flow unreliable | Decoupled into two flows by native event type (Added / Modified) |
| BPF stage events can fire late | Hybrid: `OnStageChange` primary + `OnSave` fallback |
| University tenant blocked OAuth | Documented root cause; proposed Developer Tenant + HTTP Trigger workarounds |
