/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AdminImport } from './routes/admin'

// Create Virtual Routes

const SignupLazyImport = createFileRoute('/signup')()
const LoginLazyImport = createFileRoute('/login')()
const IndexLazyImport = createFileRoute('/')()
const AdminIndexLazyImport = createFileRoute('/admin/')()
const ProblemsProblemSlugLazyImport = createFileRoute(
  '/problems/$problemSlug',
)()
const AdminProblemsIndexLazyImport = createFileRoute('/admin/problems/')()
const AdminProblemsSlugLazyImport = createFileRoute('/admin/problems/$slug')()

// Create/Update Routes

const SignupLazyRoute = SignupLazyImport.update({
  path: '/signup',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/signup.lazy').then((d) => d.Route))

const LoginLazyRoute = LoginLazyImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login.lazy').then((d) => d.Route))

const AdminRoute = AdminImport.update({
  path: '/admin',
  getParentRoute: () => rootRoute,
} as any)

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const AdminIndexLazyRoute = AdminIndexLazyImport.update({
  path: '/',
  getParentRoute: () => AdminRoute,
} as any).lazy(() => import('./routes/admin/index.lazy').then((d) => d.Route))

const ProblemsProblemSlugLazyRoute = ProblemsProblemSlugLazyImport.update({
  path: '/problems/$problemSlug',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/problems/$problemSlug.lazy').then((d) => d.Route),
)

const AdminProblemsIndexLazyRoute = AdminProblemsIndexLazyImport.update({
  path: '/problems/',
  getParentRoute: () => AdminRoute,
} as any).lazy(() =>
  import('./routes/admin/problems/index.lazy').then((d) => d.Route),
)

const AdminProblemsSlugLazyRoute = AdminProblemsSlugLazyImport.update({
  path: '/problems/$slug',
  getParentRoute: () => AdminRoute,
} as any).lazy(() =>
  import('./routes/admin/problems/$slug.lazy').then((d) => d.Route),
)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginLazyImport
      parentRoute: typeof rootRoute
    }
    '/signup': {
      id: '/signup'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof SignupLazyImport
      parentRoute: typeof rootRoute
    }
    '/problems/$problemSlug': {
      id: '/problems/$problemSlug'
      path: '/problems/$problemSlug'
      fullPath: '/problems/$problemSlug'
      preLoaderRoute: typeof ProblemsProblemSlugLazyImport
      parentRoute: typeof rootRoute
    }
    '/admin/': {
      id: '/admin/'
      path: '/'
      fullPath: '/admin/'
      preLoaderRoute: typeof AdminIndexLazyImport
      parentRoute: typeof AdminImport
    }
    '/admin/problems/$slug': {
      id: '/admin/problems/$slug'
      path: '/problems/$slug'
      fullPath: '/admin/problems/$slug'
      preLoaderRoute: typeof AdminProblemsSlugLazyImport
      parentRoute: typeof AdminImport
    }
    '/admin/problems/': {
      id: '/admin/problems/'
      path: '/problems'
      fullPath: '/admin/problems'
      preLoaderRoute: typeof AdminProblemsIndexLazyImport
      parentRoute: typeof AdminImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexLazyRoute,
  AdminRoute: AdminRoute.addChildren({
    AdminIndexLazyRoute,
    AdminProblemsSlugLazyRoute,
    AdminProblemsIndexLazyRoute,
  }),
  LoginLazyRoute,
  SignupLazyRoute,
  ProblemsProblemSlugLazyRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/admin",
        "/login",
        "/signup",
        "/problems/$problemSlug"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/admin": {
      "filePath": "admin.tsx",
      "children": [
        "/admin/",
        "/admin/problems/$slug",
        "/admin/problems/"
      ]
    },
    "/login": {
      "filePath": "login.lazy.tsx"
    },
    "/signup": {
      "filePath": "signup.lazy.tsx"
    },
    "/problems/$problemSlug": {
      "filePath": "problems/$problemSlug.lazy.tsx"
    },
    "/admin/": {
      "filePath": "admin/index.lazy.tsx",
      "parent": "/admin"
    },
    "/admin/problems/$slug": {
      "filePath": "admin/problems/$slug.lazy.tsx",
      "parent": "/admin"
    },
    "/admin/problems/": {
      "filePath": "admin/problems/index.lazy.tsx",
      "parent": "/admin"
    }
  }
}
ROUTE_MANIFEST_END */
