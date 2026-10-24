import * as React from "react";
import {Button} from "@mantine/core";
import {BsArrowLeft} from "react-icons/bs";
import {useNavigate, type ValidateToPath} from "@tanstack/react-router";

interface props extends React.HTMLProps<HTMLDivElement> {
    children: React.ReactNode,
    to?: ValidateToPath
}


export default function FinalPageLayout({children, to, ...rest}: props) {
    const navigate = useNavigate()
    to = to ? to : ".."
    return (
        <div {...rest} className={` ${rest.className}`}>
            <div className={"w-full flex gap-2 px-2"}>
                <Button
                    onClick={() => navigate({to: to})} leftSection={<BsArrowLeft/>} color={'secondary'}
                    variant={'subtle'}>
                    Go back
                </Button>
            </div>
            {children}
        </div>
    )
}

