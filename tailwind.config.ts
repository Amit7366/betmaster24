import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#111113',
        graybg: '#18181C',
        graycardbg: '#211F27',
        primary:'#081B21'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        slideIn: "slideIn 0.3s ease-out",
        'spin-custom': 'spin-horizontal 3s ease-in-out forwards',
        'coin-flip-realistic': 'coin-flip-realistic 3s ease-in-out',
         "shine": "shine 4s infinite",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        'spin-custom': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(3600deg)' }, // just visual, final result set via inline
        },
        'spin-horizontal': {
          '0%': { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(3600deg)' }, // Adjust degrees if you want more/less spins
        },
        'coin-flip-realistic': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(1800deg)' }, // 5 flips
        },
        "shine": {
          "0%": { transform: "translateX(-100%)" },
          "25%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      }
    },
  },
  plugins: [

  ],
}
export default config
