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
        children: [{ path: '', component: () => import('@/Docs/pages/components/Buttons/ButtonDocs.vue') }],
      }
    ]
  },
  {
    path: '/notify',
    children: [
      {
        path: '',
        component: () => import('@/Docs/layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('@/Docs/pages/components/Notify/NotifyDocs.vue') }],
      }
    ]
  },
  {
    path: '/use-api',
    children: [
      {
        path: '',
        component: () => import('@/Docs/layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('@/Docs/pages/components/Api/ApiDocs.vue') }],
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/Docs/pages/ErrorNotFound.vue')
  }
]

export default routes