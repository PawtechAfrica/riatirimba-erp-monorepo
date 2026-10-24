import {createRootRoute, Outlet} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools'
import {MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import themeMantine from "@/libs/theme.mantine.ts";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useEffect} from "react";
import AOS from "aos";

const queryProvider = new QueryClient({})


export const Route = createRootRoute({
    component: () => {
        useEffect(() => {
            AOS.init({disable: "phone"})
        }, []);
        return (
            <>
                <MantineProvider theme={themeMantine}>
                    <Notifications autoClose={3000} transitionDuration={320} position={'top-right'}/>
                    <QueryClientProvider client={queryProvider}>
                        <Outlet/>
                    </QueryClientProvider>
                </MantineProvider>
                <TanStackRouterDevtools/>
            </>
        )
    },
})
