import {createFileRoute} from '@tanstack/react-router'
import {Image, Text, Title} from "@mantine/core";

export const Route = createFileRoute('/(app)/__layout/')({
    component: App,
})

function App() {
    return (
        <div className="text-center h-screen flex p-5">
            <div className={'md:w-1/2 flex flex-col items-center gap-4 m-auto'}>
                <Image className={"w-[20vh]"} src={"/ui/logo.png"} alt={"school-logo"}/>
                <Title c={'primary.8'} className={'text-[3vmax]'}>Riatirimba TVC ERP</Title>
                <Text>
                    To be a leading institution in the provision of innovative training, committed to excellence and
                    ability to shape the future of Technology.
                </Text>
            </div>
        </div>
    )
}
