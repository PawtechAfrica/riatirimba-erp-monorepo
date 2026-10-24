import {Image, Text, Title} from "@mantine/core";
import {Link} from "@tanstack/react-router";
import type {LinkGroupObj} from "@/libs/types/admission.types.ts";
import LinkGroupButton from "@/components/navigation/LinkGroupButton.tsx";
import usePaths from "@/hooks/usePaths.ts";
import SidebarProfileCard from "@/components/navigation/SidebarProfileCard.tsx";
import {useState} from "react";
import {hasPermissions} from "@/libs/utils.ts";
import useAuthStore from "@/stores/useAuthStore.ts";


export default function Sidebar() {
    const paths: LinkGroupObj[] = usePaths()
    const [open, setOpen] = useState<number | null>(0)
    const user = useAuthStore()

    return (
        <nav className={"w-[250px] h-full m-auto p-2 text-white bg-primary-950 border border-solid border-transparent"}>
            <div className={"w-full h-full flex flex-col gap-4 justify-between rounded-lg "}>
                <Link to={"/"}>
                    <div className={" border-b border-solid border-b-slate-200 py-2 flex items-center gap-2"}>
                        <Image
                            className={"w-[50px] h-[50px] bg-white rounded-lg p-1 object-contain"}
                            // src={"https://riatirimbatvc.ac.ke/assets/logo-trans-CrKrf72f.png"}
                            src={"/ui/logo.svg"}
                            alt={'logo'}
                        />
                        <div className={'grid'}>
                            <Title order={5}>Riatirimba TVC</Title>
                            <Text size={'xs'}>Enterprise Resource Management</Text>
                        </div>
                    </div>
                </Link>
                <div className={"flex-1 grid auto-rows-max"}>
                    {paths.map((path, i) => hasPermissions(user.permissions, path.permissions) && (
                        <LinkGroupButton
                            key={i} {...path}
                            index={i}
                            openIndex={open}
                            setOpen={(val) => setOpen(val)}
                        />
                    ))}
                </div>
                <SidebarProfileCard/>
            </div>
        </nav>
    );
}
