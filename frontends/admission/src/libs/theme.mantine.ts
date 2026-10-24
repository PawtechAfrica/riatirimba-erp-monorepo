import {createTheme} from "@mantine/core";


export default createTheme({
    defaultRadius: "sm",
    primaryColor: 'primary',
    primaryShade: 4,
    black: "#151e1e",
    autoContrast: true,
    luminanceThreshold: 0.4,
    components: {
        TextInput: {
            defaultProps: {
                inputWrapperOrder: ['label', 'input', 'description', 'error']
            }
        },
        Select: {
            defaultProps: {
                comboboxProps: {keepMounted: false},
                inputWrapperOrder: ['label', 'input', 'description', 'error'],
            }
        }
    },
    colors: {
        text: [
            "#e1eaea",
            "#c3d5d5",
            "#a5c0c0",
            "#87abab",
            "#699696",
            "#547878",
            "#3f5a5a",
            "#2a3c3c",
            "#151e1e",
            "#0a0f0f"
        ],
        background: [
            "#e7ddee",
            "#cfbbdd",
            "#b899cc",
            "#a077bb",
            "#8855aa",
            "#6d4488",
            "#523366",
            "#362244",
            "#1b1122",
            "#0e0911"
        ],
        primary: [
            "#d9dbf2",
            "#b3b8e6",
            "#8c94d9",
            "#6670cc",
            "#404cbf",
            "#333d99",
            "#262e73",
            "#191f4d",
            "#0d0f26",
            "#060813"
        ],
        secondary: [
            "#ccfff1",
            "#99ffe2",
            "#66ffd4",
            "#33ffc5",
            "#00ffb7",
            "#00cc92",
            "#00996e",
            "#006649",
            "#003325",
            "#001a12"
        ],
        accent: [
            "#ffccd3",
            "#ff99a7",
            "#ff667a",
            "#ff334e",
            "#ff0022",
            "#cc001b",
            "#990014",
            "#66000e",
            "#330007",
            "#1a0003"
        ]
    }

})

