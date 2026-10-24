import {createFileRoute} from '@tanstack/react-router'
import {Image, Space, Title} from "@mantine/core";
import LoginForm from "@/components/forms/LoginForm.tsx";

export const Route = createFileRoute('/auth/$step')({
    component: RouteComponent,
    validateSearch: ctx => {
        return {
            ...(ctx.prev ? {prev: ctx.prev} : {}),
        }
    }
})

function RouteComponent() {

    return (
        <div style={{backgroundImage: `url(/ui/auth_bg.jpeg)`}}
             className={"w-full h-screen flex items-center justify-center bg-no-repeat bg-cover"}>
            {/*<div className={"w-full h-full absolute bg-primary-950/40"}/>*/}
            <div className={"w-full h-full absolute bg-gradient-to-tr from-primary-800/50 to-green-800/60"}/>
            <div className={"bg-white backdrop-blur-2xl backdrop-opacity-25 p-5 md:min-w-[300px] rounded-sm"}>
                <Image w={100} h={100} className={""} src={"/ui/logo.png"} alt={"school-logo"}/>
                <Title c={'primary'} order={2}>Riatirimba TVC ERP</Title>
                <Space h={20}/>
                <LoginForm/>
            </div>
        </div>
    )
}
