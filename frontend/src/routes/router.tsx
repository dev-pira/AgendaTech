import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '@/components/layout/protected-route';
import { RootLayout } from '@/components/layout/root-layout';
import { LoginPage } from '@/pages/auth/login-page';
import { RegistroPage } from '@/pages/auth/registro-page';
import { DetalheComunidadePage } from '@/pages/comunidades/detalhe-page';
import { FormComunidadePage } from '@/pages/comunidades/form-page';
import { ListaComunidadesPage } from '@/pages/comunidades/lista-page';
import { MembrosComunidadePage } from '@/pages/comunidades/membros-page';
import { DetalheEventoPage } from '@/pages/eventos/detalhe-page';
import { FormEventoPage } from '@/pages/eventos/form-page';
import { ListaEventosPage } from '@/pages/eventos/lista-page';

// FullCalendar é o maior dependente do bundle; carregado sob demanda.
const CalendarioPage = lazy(() =>
  import('@/pages/calendario/calendario-page').then((m) => ({ default: m.CalendarioPage })),
);

// import.meta.env.BASE_URL reflete o `base` do vite.config.ts ("/app/" em
// build de produção, "/" no dev server) — ver issue #85. O react-router não
// quer a barra final no basename.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { index: true, element: <Navigate to="/comunidades" replace /> },
        { path: 'login', element: <LoginPage /> },
        { path: 'registro', element: <RegistroPage /> },

        { path: 'comunidades', element: <ListaComunidadesPage /> },
        { path: 'comunidades/:id', element: <DetalheComunidadePage /> },

        { path: 'eventos', element: <ListaEventosPage /> },
        { path: 'eventos/:id', element: <DetalheEventoPage /> },

        {
          path: 'calendario',
          element: (
            <Suspense
              fallback={<p className="py-12 text-center text-muted-foreground">Carregando...</p>}
            >
              <CalendarioPage />
            </Suspense>
          ),
        },

        {
          element: <ProtectedRoute />,
          children: [
            { path: 'comunidades/nova', element: <FormComunidadePage /> },
            { path: 'comunidades/:id/editar', element: <FormComunidadePage /> },
            { path: 'comunidades/:id/membros', element: <MembrosComunidadePage /> },
            { path: 'eventos/novo', element: <FormEventoPage /> },
            { path: 'eventos/:id/editar', element: <FormEventoPage /> },
          ],
        },

        { path: '*', element: <p className="py-12 text-center">Página não encontrada.</p> },
      ],
    },
  ],
  { basename },
);
