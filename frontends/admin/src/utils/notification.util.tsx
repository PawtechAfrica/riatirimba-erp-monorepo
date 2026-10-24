import {AxiosError} from "axios";
import {MdError} from "react-icons/md";
import {type NotificationData} from "@mantine/notifications";
import {FaCircleCheck} from "react-icons/fa6";


export function showSuccess(message = "Success", title = "Success!"): NotificationData {
    return {
        title: title,
        message: message,
        icon: <FaCircleCheck className={"text-[24px]"}/>,
        className: "bg-secondary-700 text-white",
        classNames: {
            description: "text-white",
            title: "text-white font-bold text-lg",
            icon: "w-[50px] h-[50px]",
            closeButton: 'text-white bg-transparent hover:bg-transparent active:bg-secondary-500 border-none'
        }
    }
}

export function showErr(error: Error | AxiosError): NotificationData {
    const shared: Omit<NotificationData, "message"> = {
        color: "red",
        icon: <MdError className={'text-[24px]'}/>,
        className: "bg-accent-700 text-white",
        classNames: {
            description: "text-white",
            title: "text-white font-bold text-lg",
            icon: "w-[50px] h-[50px]",
            closeButton: 'text-white bg-transparent hover:bg-transparent active:bg-accent-500 border-none'
        }
    }
    if (error instanceof AxiosError) {
        const serverError: undefined | unknown = error.response?.data
        let message = "Something went wrong!";

        if (serverError && typeof serverError === 'object' && 'error' in serverError) message = serverError.error as string;
        else if (error.code == 'ERR_NETWORK') message = 'Unable to reach the server at this time!'
        else if (error.code == 'ERR_BAD_REQUEST') message = 'Bad request!'
        // const message = error.response?.data.error ?? error.response?.statusText ?? "Something went wrong";
        return {
            title: "Failed!", message: message, ...shared
        };
    }
    return {
        title: "Error occurred!!",
        message: error?.message || "Something went wrong!",
        ...shared
    };
}