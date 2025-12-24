import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
  {
    path: 'ver-mais/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'editar-demanda/:id',
    renderMode: RenderMode.Client,
  },
];
