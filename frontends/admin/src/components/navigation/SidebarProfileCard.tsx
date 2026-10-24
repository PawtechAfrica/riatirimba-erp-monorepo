import {Avatar, Button, Modal, Space, Text, Title} from "@mantine/core";
import {makeLabel} from "@/libs/utils.ts";
import {MdLogout} from "react-icons/md";
import {useStore} from "zustand/react";
import useAuthStore from "@/stores/useAuthStore.ts";
import {useState} from "react";
import LogoutForm from "@/components/forms/LogoutForm.tsx";


export default function SidebarProfileCard() {
    const {profile} = useStore(useAuthStore)
    const [tryLogout, setTryLogout] = useState(false);

    return (
        <div className={"grid border bg-blue-950 border-gray-200/0 p-2 py-4 rounded-lg"}>
            <Modal
                title={<span className={'text-accent-500 font-bold text-xl'}
                >
                    Confirm!
            </span>
                } opened={tryLogout} onClose={() => setTryLogout(false)}>
                <LogoutForm cancel={() => setTryLogout(false)}/>
            </Modal>
            <div className={'max-w-full h-max overflow-hidden flex items-center gap-2  '}>
                <Avatar
                    size={'md'}
                    src={"https://i.pinimg.com/736x/0b/97/6f/0b976f0a7aa1aa43870e1812eee5a55d.jpg"}
                    alt={profile.name + " profile photo"}
                />
                <div className={"max-w-full overflow-hidden"}>
                    <Title className={'truncate'} order={6}>{profile.name}</Title>
                    <Text size={'sm'}>{makeLabel(profile.role)}</Text>
                </div>
            </div>
            <Space h={10}/>
            {/*<Divider/>*/}
            <Space h={10}/>
            <Button onClick={() => setTryLogout(true)} color={'accent'} rightSection={<MdLogout/>}>
                Logout
            </Button>
        </div>
    )
}

