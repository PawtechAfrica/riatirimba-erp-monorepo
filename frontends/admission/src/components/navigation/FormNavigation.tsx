import {ActionIcon, Button, Space, Title, Tooltip} from "@mantine/core";
import {Link} from "@tanstack/react-router";
import type {IconType} from "react-icons";
import {CgProfile, CgSelect} from "react-icons/cg";
import {FaAddressBook, FaSchool} from "react-icons/fa";
import {GiFamilyTree} from "react-icons/gi";
import {IoMdDocument} from "react-icons/io";
import React, {useLayoutEffect, useState} from "react";
import {FaAnglesLeft, FaAnglesRight} from "react-icons/fa6";
import {useClickOutside, useViewportSize} from "@mantine/hooks";
import {HiHome} from "react-icons/hi";

interface altProps extends React.HtmlHTMLAttributes<HTMLButtonElement> {
    iconBtn: boolean;
    text: string;
    icon: IconType;
}

function AlternateButton({iconBtn, text, icon, ...rest}: altProps) {
    const Icon = icon

    return iconBtn
        ? (
            <Tooltip label={text}>
                <ActionIcon {...rest} size={iconBtn ? 'xl' : 'md'} {...rest}>
                    <Icon/>
                </ActionIcon>
            </Tooltip>
        ) :
        <Button
            {...rest}
            size={iconBtn ? 'xl' : 'md'}
            classNames={{inner: "flex text-white justify-start"}}
            leftSection={<Icon/>}>
            {text}
        </Button>
}

export default function FormNavigation() {
    const steps: { name: string, icon: IconType }[] = [
        {name: "Profile", icon: CgProfile},
        {name: "Address", icon: FaAddressBook},
        {name: "Next of Kin", icon: GiFamilyTree},
        {name: "Academic history", icon: FaSchool},
        {name: "Course selection", icon: CgSelect},
        {name: "Documents", icon: IoMdDocument},
    ]
    const {width} = useViewportSize()
    const [collapsed, setCollapsed] = useState(window.innerWidth <= 500 || width <= 500);
    const clickOutside = useClickOutside(() => {
        if (width <= 500) setCollapsed(true)
    })

    useLayoutEffect(() => {
        if (width > 0)
            setCollapsed(window.innerWidth <= 500 || width <= 500)
    }, [width]);

    return (

        <div
            ref={clickOutside}
            style={{
                width: collapsed ? "max-content" : "300px",
                position: !collapsed && (width <= 500) ? "fixed" : "relative"
            }} className={"transition-all h-full py-10 z-20 px-2 bg-primary-700 text-white grid auto-rows-max "}>
            <Tooltip label={`${collapsed ? "Hide" : "Close"} side bar`}>
                <ActionIcon size={'xl'} onClick={() => setCollapsed(!collapsed)} className={'ml-auto'}>
                    {collapsed ? <FaAnglesRight/> : <FaAnglesLeft/>}
                </ActionIcon>
            </Tooltip>
            <Title style={{display: collapsed ? 'none' : 'block'}} order={2}>Form steps</Title>
            <Space h={10}/>
            <div className={"grid gap-1"}>
                {steps.map((current, i) =>
                    <Link
                        to={"/steps/$stage"} params={{stage: (i + 1).toString()}} key={i}
                        className={"w-full h-full grid"}
                        onClick={() => {
                            if (width <= 500) setCollapsed(true)
                        }
                        }
                    >
                        <AlternateButton iconBtn={collapsed} text={current.name} icon={current.icon}/>
                    </Link>
                )}
                <Space h={20}/>
                <Link className={'grid'} to={"/"}>
                    <AlternateButton iconBtn={collapsed} text={"Home"} icon={HiHome}/>
                </Link>
            </div>
        </div>
    )
}

