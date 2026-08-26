# TripUp

A high-fidelity, click-through prototype of **TripUp** — a group-trip organizing app — built as a React + TypeScript SPA rendered inside a working iPhone mockup.

Deployed on Netlify: the landing page lives at the site root, the interactive prototype at `/app`.

## The scenario

A group of friends is on the last day of a trip to Lisbon. TripUp walks through the full loop of organizing the final evening together:

1. **Poll** the group on where to have the last dinner, nudge stragglers to vote, and close the poll once it's decided.
2. **Add member** Ren to the group for the last day
3. The itinerary updates automatically with the winning restaurant.
4. **Log the expense** — scan a receipt (or add it manually), split it by item, and exclude specific people from specific line items (e.g. two people who didn't drink the wine).
5. **Balances update live** across the whole trip, netted pairwise so anyone can simultaneously owe one person and be owed by another.
6. **Settle up** — pay a balance through a method-picker flow, nudge someone who owes you, and watch balances flip to paid in real time.
7. **End the trip** — everything reconciles to a settled recap screen.

## Tech stack

- **React 19** + **TypeScript**, bootstrapped with **Vite**
- **Tailwind CSS v4** for styling
- **Framer Motion** for the transitions and shared-element animations throughout (tab switches, the Home → Trip Detail hero morph, the settle-up flow, staggered card reveals)
- No backend — all state is client-side mock data in [`src/store`](src/store), which is enough to support a fully interactive, stateful walkthrough of the whole scenario

## Project structure

```
src/
  screens/      one file per full screen (Home, TripDetail, AddExpense, PollDetail, ...)
  components/   shared UI pieces (PhoneFrame, Avatar, ActionSheet, IOSKeyboard, ...)
  store/        mock data + the pairwise balance/settlement engine
  assets/       images, icons, and self-hosted fonts
```

The whole app renders inside [`PhoneFrame`](src/components/PhoneFrame.tsx), which composites the UI into a transparent cutout over a real iPhone photo for a device-accurate presentation, and scales to fit the viewport.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed localhost URL — the app is a fixed 402×874pt viewport, so it's designed to be viewed as-is rather than resized.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run build:site` | Build the deployable site: the app into `dist/app` (base path `/app/`) plus the static [`landing/`](landing) page copied to `dist/` root — this is what Netlify runs |
| `npm run lint` | Run oxlint |
| `python3 scripts/build-artifact.py` | Build a single self-contained HTML file (after `npx vite build --config vite.artifact.config.ts`) for publishing as a Claude Artifact — see the script's docstring for why it's structured this way |

## Deployment

Configured for Netlify via [`netlify.toml`](netlify.toml) (build command `npm run build:site`, publish directory `dist`). Connect the repo in Netlify's dashboard (Add new site → Import an existing project) and it builds both the landing page and the app on every push to `main`.
