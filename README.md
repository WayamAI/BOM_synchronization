# Wayam AI — BOM Synchronization

End-to-end BOM (Bill of Materials) synchronization for automotive programs — Engineering, Manufacturing, Service, and Software BOMs in one command center, by [Wayam AI](https://wayam.ai).

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/), [TanStack Query](https://tanstack.com/query), [@xyflow/react](https://reactflow.dev/)

## Getting started

```sh
git clone https://github.com/WayamAI/BOM_synchronization.git
cd BOM_synchronization
bun install    # or npm install
bun run dev    # or npm run dev
```

The app runs at `http://localhost:8080` (or the next free port).

## Login

The app sits behind a login screen. This is a **demo gate, not real
authentication** — there's no backend or user database. Any syntactically
valid email address and any non-empty password will sign you in (see
`src/lib/auth.ts`).

## Scripts

| Command | Description |
| --- | --- |
| `dev` | Start the Vite dev server |
| `build` | Production build |
| `preview` | Preview the production build locally |
| `lint` | Run ESLint |
| `test` | Run the test suite (Vitest) |
