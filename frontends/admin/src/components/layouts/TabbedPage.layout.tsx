import * as React from "react";
import {useNavigate, type ValidateToPath} from "@tanstack/react-router";
import {Button, Space, Tabs} from "@mantine/core";
import {BsArrowLeft} from "react-icons/bs";

interface props extends React.HTMLProps<HTMLDivElement> {
    children: React.ReactNode,
    to?: ValidateToPath,
    tabs: { label: string, path: string }[]
}

export default function TabbedPageLayout({children, to, tabs, ...rest}: props) {
    const navigate = useNavigate()
    to = to ? to : ".."


    return (
        <div {...rest} className={` ${rest.className}`}>
            <Space h={2} />
            <div className={"w-full flex gap-2 px-2"}>
                <Button
                    onClick={() => navigate({to: to})} leftSection={<BsArrowLeft/>} color={'secondary'}
                    variant={'solid'}>
                    Go back
                </Button>
            </div>
            <Space h={5} />
            <Tabs defaultValue={tabs[0]?.path}>
                <Tabs.List classNames={{list: 'bg-white'}}>
                    {tabs.map(({label, path}) => <Tabs.Tab value={path} key={path}>
                        {label}
                    </Tabs.Tab>)}
                </Tabs.List>
                {children}
            </Tabs>
        </div>
    )
}