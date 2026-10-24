import type {MantineThemeOverride} from "@mantine/core";


export const appTheme = {
    fontSmoothing: true,
    defaultRadius: 'sm',
    fontFamily: 'Poppins, sans-serif',
    fontSizes: {sm: '11pt'},
    autoContrast: true,
    luminanceThreshold: 0.3,
    defaultGradient: {
        from: 'primary',
        to: 'secondary',
    },
    primaryColor: 'primary',
    primaryShade: 5,
    components: {
        Table: {
            defaultProps: {}
        },
        Select: {
            classNames: { option: "border-b-gray-300 border-1 border-solid", dropdown: "drop-shadow-2xl"},
            defaultProps: {
                comboboxProps: {
                    keepMounted: false
                }
            },

        },
        TextInput: {
            classNames: {root: "break-inside-avoid flex-1"},
        },
        Button: {
            classNames: {
                root: "active:scale-[99%] transition-all duration-5"
            }
        }
    },
    colors: {
        neutral: [
            "oklch(0.95 0.01 295)",
            "oklch(0.93 0.01 292)",
            "oklch(0.87 0.02 296)",
            "oklch(0.79 0.03 298)",
            "oklch(0.70 0.05 299)",
            "oklch(0.63 0.06 302)",
            "oklch(0.57 0.06 303)",
            "oklch(0.50 0.05 302)",
            "oklch(0.44 0.04 302)",
            "oklch(0.33 0.03 301)"
        ],
        primary: [
            "oklch(0.94 0.03 256)",
            "oklch(0.87 0.06 251)",
            "oklch(0.78 0.12 249)",
            "oklch(0.67 0.18 252)",
            "oklch(0.60 0.20 256)",
            "oklch(0.51 0.19 258)",
            "oklch(0.44 0.16 258)",
            "oklch(0.39 0.14 257)",
            "oklch(0.34 0.12 258)",
            "oklch(0.17 0.05 254)"
        ],
        secondary: [
            "oklch(0.96 0.05 183)",
            "oklch(0.92 0.10 182)",
            "oklch(0.87 0.13 184)",
            "oklch(0.80 0.14 185)",
            "oklch(0.72 0.13 186)",
            "oklch(0.62 0.11 188)",
            "oklch(0.52 0.09 190)",
            "oklch(0.45 0.07 192)",
            "oklch(0.39 0.06 192)",
            "oklch(0.28 0.05 197)"
        ],
        accent: [
            "oklch(0.94 0.02 18)",
            "oklch(0.90 0.04 18)",
            "oklch(0.82 0.08 17)",
            "oklch(0.72 0.13 18)",
            "oklch(0.63 0.17 19)",
            "oklch(0.56 0.18 19)",
            "oklch(0.48 0.16 18)",
            "oklch(0.43 0.14 15)",
            "oklch(0.40 0.12 13)",
            "oklch(0.26 0.08 14)"
        ],
        orange: [
            "oklch(0.98 0.02 86)",
            "oklch(0.94 0.04 85)",
            "oklch(0.88 0.08 85)",
            "oklch(0.81 0.12 80)",
            "oklch(0.75 0.14 73)",
            "oklch(0.66 0.14 60)",
            "oklch(0.60 0.15 50)",
            "oklch(0.51 0.13 42)",
            "oklch(0.44 0.11 38)",
            "oklch(0.39 0.10 38)",
        ],
        green: [
            "oklch(0.96 0.05 154)",
            "oklch(0.93 0.09 153)",
            "oklch(0.88 0.16 152)",
            "oklch(0.82 0.20 149)",
            "oklch(0.74 0.21 147)",
            "oklch(0.65 0.19 147)",
            "oklch(0.54 0.15 147)",
            "oklch(0.46 0.12 149)",
            "oklch(0.40 0.10 150)",
            "oklch(0.35 0.09 149)"
        ]

    }
} as MantineThemeOverride;
