import {Image} from "@mantine/core";

export default function PendingLoading() {

    return (
        <div className={"w-full h-full flex-1 flex items-center justify-center"}>
            <div className={"w-max h-max m-auto p-5"}>
                <Image src={'favicon.svg'}/>
            </div>
        </div>
    )
}

