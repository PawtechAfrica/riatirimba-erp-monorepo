import {Button, Text} from "@mantine/core";
import {LiaRedoAltSolid} from "react-icons/lia";
import {ImSpinner2} from "react-icons/im";

interface props {
    loading: boolean;
    message: string;
    retry?: () => any;
}

export default function EmptyOrLoadingList({loading, message, retry}: props) {
    return (
        <div className={"flex justify-center items-center h-[20vh]"}>
            {loading
                ? <ImSpinner2 size={'22px'} className={'animate-spin text-primary-600 duration-300'}/>
                :
                <div className={"flex flex-col gap-4 items-center"}>
                    <Text className={'text-primary-700'} data-aos={'zoom-in'} size={'lg'}>{message}</Text>
                    {retry && <Button onClick={retry} leftSection={<LiaRedoAltSolid/>}>Retry</Button>}
                </div>
            }
        </div>
    )
}