module.exports = {
  theme: {
    extend: {
      keyframes: {
        fill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
      },
      animation: {
        fill: 'fill 0.8s ease-out forwards',
      },
    },
  },
};
