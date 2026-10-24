import {Button, Text} from "@mantine/core";
import {RxCross2} from "react-icons/rx";
import {MdCheck} from "react-icons/md";
import {useMutation} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import {showErr} from "@/utils/notification.util.tsx";

interface props {
    question: string;
    acceptFn: () => Promise<any>;
    cancelFn: () => void;
    onSuccess?: () => void;
    onFailure?: () => void;
}

export default function ({question, acceptFn, cancelFn, onSuccess, onFailure}: props) {

    const {isPending, mutate} = useMutation({
        mutationKey: ['confirm-action'],
        mutationFn: acceptFn,
        onSuccess: () => {
            if (onSuccess !== undefined) onSuccess();
        },
        onError: (err) => {
            if (onFailure !== undefined) onFailure();
            notifications.show(showErr(err))
        }
    })

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                mutate()
            }}
            className={"grid gap-4"}
        >
            <Text>{question}</Text>
            <div className={'flex gap-2'}>
                <Button
                    disabled={isPending}
                    leftSection={<RxCross2/>}
                    onClick={cancelFn}
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