import {createContext} from "react";
import {type MantineColorScheme, useMantineColorScheme} from "@mantine/core";
import React from "react";

export const LightDarkContext = createContext<{
    theme: MantineColorScheme,
    toggleTheme: () => void,
}>({
    theme: 'light',
    toggleTheme: () => {
    }
})

export const LightDarkContextProvider = ({children}: { children: React.ReactNode }) => {
    // const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const {colorScheme, toggleColorScheme} = useMantineColorScheme()

    return (
        <LightDarkContext.Provider
            value={{theme: colorScheme, toggleTheme: () => toggleColorScheme()}}>
            {children}
        </LightDarkContext.Provider>
    )
}


