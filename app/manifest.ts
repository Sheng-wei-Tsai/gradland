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
    shortcuts: [
      {
        name:        'Find IT jobs',
        short_name:  'Jobs',
        description: 'AU IT job listings with sponsor filter.',
        url:         '/jobs',
      },
      {
        name:        'Visa pathway',
        short_name:  'Visa',
        description: 'Plan your 482 / 189 / 190 / 491 / 186 pathway.',
        url:         '/visa-pathway',
      },
      {
        name:        'Resume analyser',
        short_name:  'Resume',
        description: 'AI score and rewrite suggestions.',
        url:         '/resume',
      },
    ],
  };
}
