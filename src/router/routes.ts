import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    children: [
      {
        path: '',
        component: () => import('@/Docs/layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('@/Docs/pages/Home.vue') }],
      }
    ]
  },
  {
    path: '/button',
    children: [
      {
        path: '',
        component: () => import('@/Docs/layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('@/Docs/pages/components/Buttons/VxButtonDocs.vue') }],
      }
    ]
  },
  {
    path: '/input',
    children: [
      {
        path: '',
        component: () => import('@/Docs/layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('@/Docs/pages/components/Input/VxInputDocs.vue') }],
      }
    ]
  },
  {
    path: '/notify',
    children: [
      {
        path: '',
        component: () => import('@/Docs/layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('@/Docs/pages/components/Notify/VxNotifyDocs.vue') }],
      }
    ]
  },
  {
    path: '/use-api',
    children: [
      {
        path: '',
        component: () => import('@/Docs/layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('@/Docs/pages/components/Api/VxApiDocs.vue') }],
      }
    ]
  },
  {
    path: '/use-fiscal-code',
    children: [
      {
        path: '',
        component: () => import('@/Docs/layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('@/Docs/pages/components/Cf/VxFiscalCodeDocs.vue') }],
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/Docs/pages/ErrorNotFound.vue')
  }
]

export default routes