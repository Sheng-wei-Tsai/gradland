/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(4, 75%, 97%)',
            '100': 'hsl(4, 75%, 94%)',
            '200': 'hsl(4, 75%, 86%)',
            '300': 'hsl(4, 75%, 76%)',
            '400': 'hsl(4, 75%, 64%)',
            '500': 'hsl(4, 75%, 50%)',
            '600': 'hsl(4, 75%, 40%)',
            '700': 'hsl(4, 75%, 32%)',
            '800': 'hsl(4, 75%, 24%)',
            '900': 'hsl(4, 75%, 16%)',
            '950': 'hsl(4, 75%, 10%)',
            DEFAULT: '#c0281c'
        },
        secondary: {
            '50': 'hsl(240, 100%, 97%)',
            '100': 'hsl(240, 100%, 94%)',
            '200': 'hsl(240, 100%, 86%)',
            '300': 'hsl(240, 100%, 76%)',
            '400': 'hsl(240, 100%, 64%)',
            '500': 'hsl(240, 100%, 50%)',
            '600': 'hsl(240, 100%, 40%)',
            '700': 'hsl(240, 100%, 32%)',
            '800': 'hsl(240, 100%, 24%)',
            '900': 'hsl(240, 100%, 16%)',
            '950': 'hsl(240, 100%, 10%)',
            DEFAULT: '#0000ee'
        },
        accent: {
            '50': 'hsl(41, 86%, 97%)',
            '100': 'hsl(41, 86%, 94%)',
            '200': 'hsl(41, 86%, 86%)',
            '300': 'hsl(41, 86%, 76%)',
            '400': 'hsl(41, 86%, 64%)',
            '500': 'hsl(41, 86%, 50%)',
            '600': 'hsl(41, 86%, 40%)',
            '700': 'hsl(41, 86%, 32%)',
            '800': 'hsl(41, 86%, 24%)',
            '900': 'hsl(41, 86%, 16%)',
            '950': 'hsl(41, 86%, 10%)',
            DEFAULT: '#fdf5e4'
        },
        'neutral-50': '#140a05',
        'neutral-100': '#000000',
        'neutral-200': '#ffffff',
        background: '#fdf5e4',
        foreground: '#000000'
    },
    fontFamily: {
        body: [
            'Caveat',
            'sans-serif'
        ],
        font3: [
            'Lora',
            'sans-serif'
        ]
    },
    fontSize: {
        '16': [
            '16px',
            {
                lineHeight: 'normal'
            }
        ],
        '17': [
            '17px',
            {
                lineHeight: '28.9px'
            }
        ],
        '60.8': [
            '60.8px',
            {
                lineHeight: '69.92px',
                letterSpacing: '-1.216px'
            }
        ],
        '25.6': [
            '25.6px',
            {
                lineHeight: '28.16px'
            }
        ],
        '22.4': [
            '22.4px',
            {
                lineHeight: '38.08px'
            }
        ],
        '18.4': [
            '18.4px',
            {
                lineHeight: '31.28px'
            }
        ],
        '16.8': [
            '16.8px',
            {
                lineHeight: '29.4px'
            }
        ],
        '15.2': [
            '15.2px',
            {
                lineHeight: '25.84px'
            }
        ],
        '14.4': [
            '14.4px',
            {
                lineHeight: '24.48px'
            }
        ],
        '14.08': [
            '14.08px',
            {
                lineHeight: '16.896px'
            }
        ],
        '13.6': [
            '13.6px',
            {
                lineHeight: '23.12px',
                letterSpacing: '0.68px'
            }
        ],
        '13.44': [
            '13.44px',
            {
                lineHeight: '22.848px'
            }
        ],
        '13.3333': [
            '13.3333px',
            {
                lineHeight: 'normal'
            }
        ],
        '13.28': [
            '13.28px',
            {
                lineHeight: '22.576px'
            }
        ],
        '13.12': [
            '13.12px',
            {
                lineHeight: '22.304px'
            }
        ]
    },
    spacing: {
        '6': '12px',
        '8': '16px',
        '14': '28px',
        '16': '32px',
        '20': '40px',
        '24': '48px',
        '32': '64px',
        '48': '96px',
        '126': '252px',
        '136': '272px',
        '1px': '1px',
        '23px': '23px'
    },
    borderRadius: {
        xs: '2px',
        md: '8px',
        lg: '12px',
        full: '99px'
    },
    boxShadow: {
        xs: 'rgb(20, 10, 5) 2px 2px 0px 0px',
        sm: 'rgb(20, 10, 5) 4px 4px 0px 0px',
        md: 'rgba(180, 60, 40, 0.2) 0px 2px 10px 0px'
    },
    transitionDuration: {
        '150': '0.15s',
        '180': '0.18s',
        '200': '0.2s',
        '250': '0.25s',
        '300': '0.3s',
        '400': '0.4s',
        '560': '0.56s'
    },
    transitionTimingFunction: {
        custom: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    container: {
        center: true,
        padding: '24px'
    },
    maxWidth: {
        container: '720px'
    }
},
  },
};
