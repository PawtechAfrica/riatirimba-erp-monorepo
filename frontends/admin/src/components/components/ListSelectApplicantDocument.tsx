import {makeLabel} from "@/libs/utils.ts";
import {Button, Text} from "@mantine/core";
import {BsEye} from "react-icons/bs";
import {MdClose} from "react-icons/md";


interface props {
    select: (doc: string) => void;
    title: string
    active?: boolean
    file: string | null
}

export default function ListSelectApplicantDocument({select, title, active, file}: props) {
    return (
        <div
            className={`flex items-center justify-between p-4 ${active ? 'bg-primary-100' : 'bg-white'} border border-solid ${file ? "border-slate-200" : "border-accent-200"} gap-4 rounded-lg`}>
            <Text>{makeLabel(title)}</Text>
            <Button
                color={file ? 'primary' : 'accent'}
                onClick={() => file ? select(file) : {}}
                disabled={!file}
                leftSection={file ? <BsEye/> : <MdClose/>}
                variant={file ? 'light' : 'outline'}>
                {file ? "View" : "Not uploaded"}
            </Button>
        </div>
    );
}
