import {Button, Image, Text, Title} from "@mantine/core";
import type {ErrorComponentProps} from "@tanstack/react-router";
import {GoReport} from "react-icons/go";
import {RxReload} from "react-icons/rx";
import {BiSolidError} from "react-icons/bi";

export default function BrokenPage({reset, error}: ErrorComponentProps) {

    return (
        <div className={"w-full h-screen flex items-center"}>
            <Image
                src={'/ui/broken-page.png'}
                alt={""}
                className={"w-full h-full brightness-100 absolute "}
            />
            <div className={"w-max max-w-[95%] p-5 bg-red-500 text-white m-auto rounded-md shadow-xl grid gap-2"}>
                <span className={'flex  items-center gap-2'}>
                    <BiSolidError size={'42px'} />
                    <Title order={4}>Something went wrong</Title>
                </span>
                <Text>{error.message}</Text>
                <div className={'w-full justify-between flex flex-wrap gap-2'}>
                    <Button className={'flex-1 min-w-[100px]'} leftSection={<RxReload/>} onClick={reset}>
                        Refresh page
                    </Button>
                    <Button className={'flex-1 min-w-[100px]'} leftSection={<GoReport/>} color={'secondary.8'}>
                        Report issue
                    </Button>
                </div>
            </div>
        </div>
    )
}

