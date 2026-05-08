import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Gradland',
    short_name:       'Gradland',
    description:      'Career platform for international IT graduates landing their first job in Australia.',
    start_url:        '/',
    display:          'standalone',
    background_color: '#fdf5e4',
    theme_color:      '#c0281c',
    icons: [
      {
        src:     '/icon.svg',
        type:    'image/svg+xml',
        sizes:   'any',
        purpose: 'any',
      },
      {
        src:     '/apple-icon',
        type:    'image/png',
        sizes:   '180x180',
        purpose: 'maskable',
      },
    ],
  };
}
