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
        accent: '#FECA1F',
        secondary: '#313640',
        cardbg: '#262C35',
        primary: '#010928',
        navbg: '#0F0238',
        textcolor: '#898B8F'
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
        marquee: 'marquee 5s linear infinite',
        doubleBounceGap: "doubleBounceGap 2.4s ease-in-out infinite",
        animateWave: " wave 0.6s ease infinite alternate"
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
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        doubleBounceGap: {
          "0%": { transform: "scale(1)" },

          // First bounce
          "10%": { transform: "scale(1.3)" },
          "20%": { transform: "scale(1)" },

          // Second bounce
          "30%": { transform: "scale(1.3)" },
          "40%": { transform: "scale(1)" },

          // GAP (no movement)
          "40%, 100%": { transform: "scale(1)" },
        },
        wave: {
          "0%": { opacity: '0.2', transform: 'translateY(2px)' },
          "50%": { opacity: '1', transform: 'translateY(-1px)' },
          "100%": { opacity: '0.9', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        ".inverted-curve": {
          clipPath: `path(
        'M0 0 
         H300 
         C260 0 260 40 220 40
         C180 40 180 80 140 80
         H0 
         Z'
      )`,
        },
      });
    },
  ],
}
export default config
