import {Image} from "@mantine/core";


export default function SplashScreen() {

    return (
        <div className={"w-full h-screen flex bg-gradient-to-tr from-white to-primary-100"}>
            <div className={"m-auto animate-pulse flex flex-col items-center gap-2"}>
                <Image fetchPriority={'high'} className={"w-[20vh] h-[20vh] animate-bounce p-2 rounded-md"}
                       alt={'school logo'} src={'/logo192.png'} fallbackSrc={'/logo192.png'}/>
                <span className={'text-xl animate-bounce font-bold text-primary-600'}>&copy;Riatirimba TVC Admission portal</span>
            </div>
        </div>
    )
}

