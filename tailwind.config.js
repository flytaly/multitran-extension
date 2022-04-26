const spacing = (n) => `calc(${n / 4}*var(--base-spacing))`;
const fontSize = (n) => `calc(${n}*var(--font-size))`;

module.exports = {
    content: ['./src/**/*.{html,js,css}', './extension/**/*.html'],
    theme: {
        fill: {
            current: 'currentColor',
            none: 'none',
        },
        extend: {
            maxWidth: {
                'popup-w': 'var(--popup-max-width)',
            },
            maxHeight: {
                'popup-h': 'var(--popup-max-height)',
            },
            spacing: {
                px: '1px',
                'popup-w': 'var(--popup-max-width)',
                'popup-h': 'var(--popup-max-height)',
                0: '0',
                0.5: spacing(0.5),
                1: spacing(1),
                1.5: spacing(1.5),
                2: spacing(2),
                2.5: spacing(2.5),
                3: spacing(3),
                3.5: spacing(3.5),
                4: spacing(4),
                5: spacing(5),
                6: spacing(6),
                7: spacing(7),
                8: spacing(8),
                9: spacing(9),
                10: spacing(10),
            },
        },
        fontSize: {
            xs: fontSize(0.75),
            sm: fontSize(0.875),
            base: fontSize(1),
            lg: fontSize(1.125),
            xl: fontSize(1.25),
            '2xl': fontSize(1.5),
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
