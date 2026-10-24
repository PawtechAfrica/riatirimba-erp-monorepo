import Sidebar from "@/components/navigation/Sidebar";
import Topbar from "@/components/navigation/Topbar";
import {
    createFileRoute,
    Outlet,
    redirect,
    useLocation,
    useNavigate,
    type ValidateFromPath
} from "@tanstack/react-router";
import {useStore} from "zustand/react";
import useAuthStore from "@/stores/useAuthStore.ts";
import {useEffect} from "react";
import AOS from "aos";
import 'aos/dist/aos.css'
import { showSuccess } from "@/utils/notification.util.tsx";
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";
import {Image} from "@mantine/core";
import BrokenPage from "@/components/screens/BrokenPage.tsx";
import GlobalLoadingBar from "@/components/components/GlobalLoadingBar.tsx";
import GlobalNotificationBanner from "@/components/components/GlobalNotificationBanner.tsx";
import config from "@/libs/config.ts";
import {timeDifference} from "@/libs/utils.ts";
import {notifications} from "@mantine/notifications";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";

export const Route = createFileRoute('/(app)/__layout')({
    component: RouteLayoutComponent,
    errorComponent: BrokenPage,
    pendingComponent: () => (
        <div
            // hidden={!state.isLoading || !state.isTransitioning}
            className={"w-max h-max z-40 fixed top-0 bottom-0 left-0 right-0 m-auto p-2 rounded-lg0"}>
            {/*<CgSpinner size={'5vh'} className={"animate-spin text-white duration-100"}/>*/}
            <Image className={'w-[100px] animate-pulse'} src={'/favicon.svg'}/>
        </div>
    ),
    beforeLoad: async () => {
        const authState = useAuthStore.getState()
        // if access_token (meaning the user was previously logged in)
        // and it was last fetched more than 15 minutes ago, refresh it
        if (authState.accessToken && dayjs(authState.modified).diff(new Date(), 'minutes') >= 15) {
            return await useAuthStore.getState().refresh()
                .catch(() => {
                    throw redirect({to: "/auth/$step", params: {step: "login"}})
                })
        }
        if (!authState.loggedIn) {
            throw redirect({to: "/auth/$step", params: {step: "login"}})
        }
    }
})

function RouteLayoutComponent() {
    const {loggedIn, refresh, modified, logout} = useStore(useAuthStore)
    const {pathname} = useLocation()
    const navigate = useNavigate()

    useQuery({
        queryKey: ['fetch-intakes-global'],
        queryFn: async () => {
            const result = await useAdmissionStore.getState().fetchIntakes()
            localStorage.setItem('cached-intakes', JSON.stringify(result))
            return result
        },
        refetchInterval: 30 * 60 * 1000, // 30 minutes
        enabled: loggedIn,
        refetchOnWindowFocus: true,
    })

    useEffect(() => {
        if (!loggedIn)
            navigate({to: "/auth/$step", params: {step: "login"}, from: pathname as ValidateFromPath}).catch()
        if (loggedIn && pathname === "/auth/$step")
            navigate({to: "/"}).catch()
    }, [loggedIn, pathname]);

    useEffect(() => {
        AOS.init({
            offset: -400,
            once: false,
            disable: 'phone'
        })
    }, []);


    useQuery({
        queryKey: ['refresh-token', modified],
        queryFn: async () => {
            // log the user out if they've been inactive for 30 minutes
            if (modified && timeDifference(modified, new Date(), 'minutes') > 30) {
                return await logout().then(
                    () => notifications.show(showSuccess("You have been logged out due to inactivity.", "Authentication")))
            }
            if (modified && timeDifference(modified) >= config.REFRESH_TOKEN_MIN) {
                return await refresh()
            }
            return {}
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchInterval: config.REFRESH_TOKEN_MS, // 13 minutes
        refetchIntervalInBackground: true,
        enabled: true
    })

    return (
        <>
            <div className={"w-full h-screen flex gap-2 bg-neutral-100"}>
                <Sidebar/>
                <div className={"w-full h-full grid auto-rows-max gap-2 overflow-y-auto"}>
                    <GlobalLoadingBar/>
                    <GlobalNotificationBanner/>
                    <Topbar/>
                    <div data-aos={'fade-down'}>
                        <Outlet/>
                    </div>
                </div>
            </div>
        </>
    );
}
