# TanStack Router & Start - Coding Guidelines

This document outlines the coding standards, best practices, and architectural patterns for TanStack Router and TanStack Start projects. These guidelines are based on the framework's design philosophy and should be followed throughout the application.

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [TypeScript & Type Safety](#typescript--type-safety)
3. [File Structure & Organization](#file-structure--organization)
4. [TanStack Router Patterns](#tanstack-router-patterns)
5. [TanStack Start Patterns](#tanstack-start-patterns)
6. [Naming Conventions](#naming-conventions)
7. [Code Quality Standards](#code-quality-standards)
8. [Common Patterns](#common-patterns)

---

## Core Philosophy

### Type Safety First

- **Principle**: TanStack frameworks are built on "100% inferred TypeScript support" with lossless type-inference
- All APIs propagate type information through the application without boundaries
- Compile-time validation prevents navigation and runtime errors
- TypeScript strict mode is enforced

### Client-Side First, Server Capable

- Design components for client-side interactivity first
- Add server capabilities (SSR, server functions) when needed
- Full-stack type safety across client-server boundaries
- Avoid forcing either purely client-only or purely server patterns

### Simplicity with Power

- APIs remain intuitive and straightforward
- Advanced features don't compromise developer experience
- Declarative approaches over imperative
- Convention-over-configuration patterns when possible

---

## TypeScript & Type Safety

### Type Safety Practices

**Avoid `any` Type**:

```typescript
// ❌ Avoid
function process(data: any) {}

// ✅ Prefer unknown with type narrowing
function process(data: unknown) {
  if (typeof data === "object" && data !== null) {
    // Use type guard or assertion
  }
}

// ✅ Or use explicit types
interface ProcessData {
  value: string;
}
function process(data: ProcessData) {}
```

**Lossless Type Propagation**:

- Design APIs that maintain type information through the entire chain
- Use generics extensively to preserve type context
- Define context interfaces at route level and inherit downward

**Contextual Typing**:

- Define route context interfaces explicitly
- Let type inference work through nested routes
- Leverage TypeScript's contextual typing in callbacks

---

## File Structure & Organization

### Project Layout

```
src/
├── routes/                    # File-based routing (auto-generated route tree)
│   ├── __root.tsx            # Root layout component & context
│   ├── index.tsx             # Home page
│   ├── page-name.tsx         # Route: /page-name
│   └── nested/
│       ├── .index.tsx        # Route: /nested/ (pathless layout)
│       └── route.tsx         # Route: /nested/route
├── components/               # Reusable UI components
│   ├── Header.tsx
│   └── ui/                   # Shadcn UI & design system
├── integrations/             # External service integrations
│   └── tanstack-query/       # React Query configuration
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions & helpers
│   ├── utils.ts
│   └── classname.ts
├── data/                     # Static data & constants
├── types/                    # Shared type definitions
├── router.tsx                # Router configuration
├── routeTree.gen.ts          # Auto-generated route tree (don't edit)
└── styles.css                # Global Tailwind styles
```

### Route File Naming

- **Page routes**: Use descriptive names matching the URL

  - `index.tsx` → `/`
  - `about.tsx` → `/about`
  - `posts.$postId.tsx` → `/posts/:postId`
  - `api.hello.ts` → API endpoint `/api/hello`

- **Layout routes**: Use leading underscore for grouping

  - `_layout.tsx` → Shared layout without path segment
  - `(authenticated)/_layout.tsx` → Grouped layout routes

- **Dynamic segments**: Use `$` prefix
  - `$userId.tsx` → `/users/:userId`
  - `posts.$postId.edit.tsx` → `/posts/:postId/edit`

### Import Organization (Biome Rules)

Follow the Biome import sorting order:

1. Node/Bun built-ins (`:NODE:`, `:BUN:`)
2. URL imports and package protocols
3. React, TanStack, and other framework imports
4. Other npm packages
5. **Blank line**
6. Path aliases (`@/*`)
7. **Blank line**
8. Type definitions
9. Relative imports

```typescript
// Built-ins
import fs from "node:fs";

// Framework & TanStack
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import React from "react";

// Other packages
import { Button } from "@radix-ui/react-button";

// Aliases
import { cn } from "@/lib/utils";

// Relative
import { Header } from "../components/Header";
```

---

## TanStack Router Patterns

### Core Concepts

**Type-Safe Routing**:

- Routes are fully typed at compile-time
- Navigation validates paths and parameters before runtime
- Auto-completion in IDEs for all routes and parameters

**URL as First-Class State**:

- Treat URL search parameters as a primary state layer
- Parse and validate search params as JSON
- Maintain all filterable/queryable state in URL
- Use `useSearch()` hook for type-safe access

**Hierarchical Structure**:

- Organize routes with shared layouts
- Use pathless layout routes for grouped functionality
- Inherit context down the route tree
- Share data through route loaders

### Root Route Pattern

```typescript
// __root.tsx - Root layout with context
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "My App" },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
```

### File-Based Route Pattern

```typescript
// routes/page-name.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/page-name")({
  component: PageComponent,
  // Optional: Add loader for data fetching
  loader: async () => {
    // Fetch data server-side
    return { data: "value" };
  },
});

function PageComponent() {
  // Use route data
  const data = Route.useLoaderData();

  // Access search params
  const search = Route.useSearch();

  // Get navigation utilities
  const navigate = Route.useNavigate();

  return <div>{/* Component JSX */}</div>;
}
```

### Dynamic Route Pattern

```typescript
// routes/posts.$postId.tsx
import { createFileRoute } from "@tanstack/react-router";

interface PostRouteContext {
  postId: string;
}

export const Route = createFileRoute("/posts/$postId")({
  component: PostDetail,
  loader: async ({ params }) => {
    // params are type-safe: { postId: string }
    return { post: await fetchPost(params.postId) };
  },
});

function PostDetail() {
  const { post } = Route.useLoaderData();
  const { postId } = Route.useParams();

  return <article>{post.title}</article>;
}
```

### Search Parameters Pattern

```typescript
// Use Zod for search param validation
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  sort: z.enum(["asc", "desc"]).default("asc"),
});

export const Route = createFileRoute("/posts")({
  validateSearch: searchSchema,
  component: PostsPage,
});

function PostsPage() {
  // Fully typed search parameters
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <button
      onClick={() =>
        navigate({
          search: { page: search.page + 1, limit: search.limit },
        })
      }
    >
      Next Page
    </button>
  );
}
```

### Loader-Based Data Fetching

- Use route loaders for data requirements
- Leverage structural sharing for caching
- Combine with React Query for advanced state management
- Allow parallel loading of route data

```typescript
export const Route = createFileRoute("/dashboard")({
  loader: async ({ context: { queryClient } }) => {
    return {
      stats: await queryClient.ensureQueryData({
        queryKey: ["stats"],
        queryFn: () => fetch("/api/stats").then((r) => r.json()),
      }),
    };
  },
});
```

---

## TanStack Start Patterns

### Server Functions

**Definition**: Type-safe RPC-like functions that execute on the server and can be called from the client.

**Pattern**:

```typescript
// routes/demo/api.example.ts (or any route file)
import { createServerFn } from "@tanstack/react-start";

// Define server function with input validation
export const fetchUserData = createServerFn({
  method: "GET", // GET, POST, etc.
})
  .inputValidator((d: string) => d) // Optional: validate input
  .handler(async ({ data }) => {
    // This code runs on the server
    return { user: "data" };
  });
```

**Usage from Client**:

```typescript
function UserComponent() {
  const data = await fetchUserData({ data: "userId123" });
  return <div>{data.user}</div>;
}
```

**Features**:

- Automatic serialization/deserialization
- End-to-end type safety
- Streaming support for progressive data loading
- Optional input validation with validators
- Middleware support (for logging, auth, etc.)

### Server Function Examples

**Simple Getter**:

```typescript
const getTodos = createServerFn({
  method: "GET",
}).handler(async () => {
  const todos = await readTodosFromFile("todos.json");
  return todos;
});
```

**POST with Input Validation**:

```typescript
const addTodo = createServerFn({ method: "POST" })
  .inputValidator((d: string) => d) // Simple string validator
  .handler(async ({ data }) => {
    const todos = await readTodos();
    todos.push({ id: todos.length + 1, name: data });
    await writeTodos(todos);
    return todos;
  });
```

**POST with Zod Validation**:

```typescript
import { z } from "zod";

const CreateTodoInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const createTodo = createServerFn({ method: "POST" })
  .inputValidator((d) => CreateTodoInput.parse(d))
  .handler(async ({ data }) => {
    // data is typed as CreateTodoInput
    const newTodo = await db.todos.create(data);
    return newTodo;
  });
```

### API Routes

**Pattern**: Define HTTP endpoints alongside routes using `.server` or `.handler()` conventions

```typescript
// routes/api.users.ts
import { createServerFn } from "@tanstack/react-start";

export const getUsers = createServerFn({
  method: "GET",
}).handler(async () => {
  return await db.users.findAll();
});

export const createUser = createServerFn({
  method: "POST",
})
  .inputValidator((d) => UserSchema.parse(d))
  .handler(async ({ data }) => {
    return await db.users.create(data);
  });
```

### Router Loader with Server Data

```typescript
export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    // Call server functions in loaders
    const todos = await getTodos();
    const stats = await getStats();

    return { todos, stats };
  },
  component: Dashboard,
});

function Dashboard() {
  const { todos, stats } = Route.useLoaderData();
  return <div>{/* Use loader data */}</div>;
}
```

### Streaming Support

Server functions support streaming for progressive data loading:

```typescript
export const streamData = createServerFn({
  method: "GET",
}).handler(async function* () {
  // Generator function for streaming
  yield { status: "loading" };
  const data = await expensiveOperation();
  yield { status: "complete", data };
});
```

---

## Naming Conventions

### Files & Directories

| Pattern           | Purpose                 | Example                                    |
| ----------------- | ----------------------- | ------------------------------------------ |
| `index.tsx`       | Default route component | `/routes/index.tsx` → `/`                  |
| `$param.tsx`      | Dynamic segment         | `/routes/posts/$postId.tsx` → `/posts/:id` |
| `_layout.tsx`     | Layout without path     | Wraps child routes                         |
| `api.endpoint.ts` | API route               | `/routes/api.users.ts` → `/api/users`      |

### Functions & Variables

**Server Functions** (PascalCase with verb):

- `fetchUserData()` - retrieves data
- `createTodo()` - creates resource
- `updateProfile()` - modifies resource
- `deleteTodo()` - removes resource

**Hooks** (camelCase with 'use' prefix):

- `useSearch()` - access route search params
- `useParams()` - access route parameters
- `useNavigate()` - navigate between routes
- `useRouter()` - access router instance
- `useLoaderData()` - access route loader data

**Components** (PascalCase):

- `Header` - layout component
- `UserCard` - presentational component
- `DashboardPage` - page component

**Types & Interfaces** (PascalCase, descriptive):

- `interface UserProfile`
- `type SearchParams`
- `interface RouteContext`

### Constants & Enums

```typescript
// All caps for constants
const MAX_RETRIES = 3;
const API_TIMEOUT = 5000;

// PascalCase for enums
enum UserRole {
  Admin = "admin",
  User = "user",
  Guest = "guest",
}
```

---

## Code Quality Standards

### Linting & Formatting (Biome)

The project uses Biome v2 for linting and code formatting. Configuration in `biome.json`:

**Linter Rules**:

- `recommended`: All recommended rules enabled
- Nursery rules: Additional experimental rules with warnings
  - `useSortedClasses`: Sort Tailwind classes
  - `useExhaustiveSwitchCases`: Exhaustive switch statement checking
  - `noFloatingPromises`: Catch unhandled promises

**Style Rules (Errors)**:

- No parameter reassignment
- Use `as const` assertions appropriately
- Default parameters last in function signatures
- Always initialize enum members
- Self-closing elements in JSX
- Single variable declarator per line

### React & TSX Conventions

**Functional Components Only**:

```typescript
// ✅ Prefer function declarations or named exports
function MyComponent() {
  return <div>Component</div>;
}

export function MyComponent() {
  return <div>Component</div>;
}

// ✅ Or arrow functions for small components
const MyComponent = () => <div>Component</div>;

// ❌ Avoid
const MyComponent: React.FC = () => <div>Component</div>;
```

**Event Handlers**:

```typescript
// ✅ Use useCallback for memoized handlers
const handleClick = useCallback(async () => {
  await submitTodo(todo)
}, [todo])

// ✅ Or inline simple handlers
<button onClick={() => setTodo('')}>Clear</button>

// ❌ Avoid creating new functions in props
<button onClick={() => { setTodo('') }}>Clear</button> // On every render
```

**JSX Classes with Tailwind**:

```typescript
// ✅ Use cn() utility for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  'px-4 py-2 rounded-lg',
  isActive && 'bg-blue-500 text-white',
  isDisabled && 'opacity-50 cursor-not-allowed',
)}>
  Button
</div>

// ✅ Sort Tailwind classes (Biome useSortedClasses)
<div className="flex items-center justify-center px-4 py-2 rounded-lg">
```

### Error Handling

**Server Functions**:

```typescript
export const riskyOperation = createServerFn({
  method: "POST",
})
  .inputValidator((d) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      const result = await db.operation(data);
      return { success: true, data: result };
    } catch (error) {
      // Return error data, don't throw from server function
      return { success: false, error: "Operation failed" };
    }
  });
```

**Error Boundaries**:

- Define `errorComponent` in route configuration
- Use error boundaries for error UI
- Display user-friendly error messages

---

## Common Patterns

### Authentication Context in Routes

```typescript
// __root.tsx
interface MyRouterContext {
  queryClient: QueryClient;
  user: User | null;
  isAuthenticated: boolean;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  /* ... */
});
```

### Protected Routes

```typescript
// routes/protected-route.tsx
export const Route = createFileRoute("/protected")({
  beforeLoad: async ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProtectedPage,
});
```

### Data Loading with React Query

```typescript
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/users")({
  loader: async ({ context: { queryClient } }) => {
    // Ensure data is loaded before rendering
    return {
      users: await queryClient.ensureQueryData({
        queryKey: ["users"],
        queryFn: () => fetch("/api/users").then((r) => r.json()),
      }),
    };
  },
  component: UsersList,
});

function UsersList() {
  const { users } = Route.useLoaderData();
  return (
    <div>
      {users.map((u) => (
        <div key={u.id}>{u.name}</div>
      ))}
    </div>
  );
}
```

### Form Handling with React Form + Zod

```typescript
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

function MyForm() {
  const form = useForm({
    defaultValues: { email: "", name: "" },
    onSubmit: async ({ value }) => {
      const result = await createUser(value);
      return result;
    },
    validators: { onChange: zodValidator({ schema: FormSchema }) },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => (
          <input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            type="email"
          />
        )}
      </form.Field>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Search Parameter Management

```typescript
const SearchSchema = z.object({
  query: z.string().default(""),
  page: z.number().default(1),
  category: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: SearchSchema,
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleSearch = (newQuery: string) => {
    navigate({
      search: { ...search, query: newQuery, page: 1 },
    });
  };

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {/* Results based on search.query, search.page */}
    </div>
  );
}
```

### Component Composition Pattern

```typescript
// Separate concerns into focused components
function UserProfile({ userId }: { userId: string }) {
  const { user } = Route.useLoaderData();

  return (
    <div className="space-y-4">
      <UserHeader user={user} />
      <UserStats user={user} />
      <UserActions userId={userId} />
    </div>
  );
}
```

---

## Summary

Follow these principles when developing TanStack Router and Start applications:

1. **Prioritize type safety** - Use TypeScript strict mode and eliminate `any`
2. **Embrace file-based routing** - Use the directory structure for organization
3. **Keep routes organized** - Use pathless layouts and hierarchical structure
4. **Use search params for state** - Make URLs shareable and bookmarkable
5. **Leverage loaders** - Pre-load data before rendering
6. **Type everything end-to-end** - From server functions to client components
7. **Follow Biome standards** - Keep code formatted and linted consistently
8. **Use TanStack ecosystem** - Combine Router, Start, Query, and Form
9. **Keep components simple** - Compose larger UIs from focused components
10. **Validate inputs** - Use Zod for schemas, especially in forms and server functions
