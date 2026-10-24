import {Button, Text} from "@mantine/core";
import {MdCheck} from "react-icons/md";
import {RxCross2} from "react-icons/rx";
import useAuthStore from "@/stores/useAuthStore.ts";
import {useStore} from "zustand/react";
import {useMutation} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";

interface props {
    cancel: () => void;
}

export default function LogoutForm({cancel}: props) {
    const {logout} = useStore(useAuthStore)
    const {isPending, mutate} = useMutation({
        mutationKey: ['auth'],
        mutationFn: logout,
        onSuccess: () => notifications.show(showSuccess("You have been logged out!", "Goodbye!")),
        onError: error => notifications.show(showErr(error))
    })
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            mutate()
        }} className={"grid gap-4"}
        >
            <Text>Are you sure you want to logout?</Text>
            <div className={'flex gap-2'}>
                <Button
                    disabled={isPending}
                    leftSection={<RxCross2/>}
                    onClick={cancel}
                    variant={'filled'}
                >
                    No
                </Button>
                <Button
                    type={'submit'}
                    loading={isPending}
                    disabled={isPending}
                    leftSection={<MdCheck/>}
                    variant={'light'}
                    color={'accent'}
                >
                    Yes
                </Button>
            </div>
        </form>
    )
}

