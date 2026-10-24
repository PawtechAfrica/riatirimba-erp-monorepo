import usePaths from "@/hooks/usePaths.ts";
import {Link, useLocation} from "@tanstack/react-router";
import {useMemo} from "react";
import {Button, Title} from "@mantine/core";
import {hasPermissions, routeIsActive} from "@/libs/utils.ts";
import useAuthStore from "@/stores/useAuthStore.ts";


export default function Topbar() {
    const paths = usePaths()
    const {pathname, href} = useLocation()


    const active = useMemo(() => {
        const motherPath = paths.find(p => pathname.includes(p.path))
        return motherPath?.childPaths?.find(f => {
            return pathname.includes(f.path)
        })
    }, [paths, pathname])
    const user = useAuthStore()
    if (!active) return <>{}</>
    return (
        <nav
            className={"w-full sticky top-0 py-5 px-5 z-40 bg-white"}>
            <div className={"w-full h-full flex items-center justify-between"}>
                <div className={"flex h-full gap-2 flex-1"}>
                    {active.childPaths?.map((ch, i) =>
                        hasPermissions(user.permissions, ch.permissions) &&
                        <Link
                            activeOptions={{includeSearch: false,}}
                            activeProps={{className: "text-primary-500"}}
                            search={ch.search ? ch.search : {}}
                            className={'flex h-full items-center gap-2'}
                            to={ch.path}
                            key={i}
                            params={ch.params}
                        >
                            {({isActive}) => {
                                isActive = routeIsActive(ch, href, isActive)
                                return (
                                    <Button
                                        radius={'xs'}
                                        variant={'transparent'} color={isActive ? 'primary' : 'black'}
                                        classNames={{root: `h-full border-b-3 ${isActive ? "border-b-primary-500" : "border-transparent"}`}}
                                        leftSection={ch.icon ? <ch.icon/> : undefined}
                                    >
                                        {ch.label}
                                    </Button>)
                            }}
                        </Link>)
                    }
                </div>
                <Title className={'flex gap-2 items-center'} c={'primary.7'} order={4}>{active.label}{active.icon ?
                    <active.icon/> : ""}
                </Title>
            </div>
        </nav>
    )
}
