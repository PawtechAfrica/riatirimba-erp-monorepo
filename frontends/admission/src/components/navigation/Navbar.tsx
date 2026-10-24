import {Link} from "@tanstack/react-router";
import {Button, Image, Title} from "@mantine/core";
import {useStore} from "zustand/react";
import {MdLogout} from "react-icons/md";
import {notifications} from "@mantine/notifications";
import useAuthStore from "@/stores/useAuthStore.ts";


export default function Navbar() {
    const {logout} = useStore(useAuthStore)

    const handleLogout = () => {
        notifications.show({title: "Logging out", message: "Signing you out!", loading: true})
        setTimeout(() => {
            logout()
        }, 700)
    }
    return (
        <nav className={"w-full h-[70px] sticky top-0 z-40 bg-white px-[5%] flex justify-between items-center"}>
            <div className={"w-full h-full border-b border-b-slate-200 m-auto flex justify-between items-center"}>
                <Link className={"flex items-center gap-2"} to={'/'}>
                    <Image className={'w-[50px]'} src={"/ui/logo.png"}/>
                    <Title order={4} c={'primary'} className={"truncate hidden md:block"}>Riatirimba TVC Application
                        Portal</Title>
                    <Title order={5} c={'primary'} className={"truncate block md:hidden"}>RTVC</Title>
                </Link>

                <Button
                    onClick={handleLogout}
                    variant={'outline'} radius={'xl'} color={'accent'}
                    rightSection={<MdLogout/>}
                >
                    Logout
                </Button>
            </div>
        </nav>
    )
}

