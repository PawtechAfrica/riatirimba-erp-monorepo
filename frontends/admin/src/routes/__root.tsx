import {createRootRoute, Outlet} from '@tanstack/react-router'
import {appTheme} from "@/libs/app-theme.ts";
import {MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {useContext} from "react";
import {LightDarkContext, LightDarkContextProvider} from "@/contexts/LightDarkContext.tsx";
import {ConfirmActionProvider} from "@/contexts/ConfirmActionContext.tsx";

export const Route = createRootRoute({
    component: () => {
        const {theme} = useContext(LightDarkContext)
        return (
            <>
                <MantineProvider defaultColorScheme={theme} theme={appTheme}>
                    <Notifications position={"top-center"}/>
                    <LightDarkContextProvider>
                        <ConfirmActionProvider>
                            <Outlet/>
                        </ConfirmActionProvider>
                    </LightDarkContextProvider>
                </MantineProvider>
                {/*<TanStackRouterDevtools position={'bottom-right'}/>*/}
            </>
        )
    },
})
