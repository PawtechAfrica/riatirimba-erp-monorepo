/**
 * List all student documents and search
 */
import type {DocumentObj} from "@/libs/types/admission.types.ts";
import {useMemo, useState} from "react";
import ViewTraineeDocument from "@/components/components/ViewTraineeDocument.tsx";
import {Text, TextInput} from "@mantine/core";
import {BiSearch} from "react-icons/bi";

interface props {
    documents: DocumentObj[],
}

export default function ListTraineeDocuments({documents}: props) {

    const [search, setSearch] = useState("");

    const list = useMemo(() => {
        if (search.length > 1) {
            return documents.filter(doc => doc.documentKey.toLowerCase().includes(search.toLowerCase()))
                .sort((a, b) => new Date(b.createdAt).getMilliseconds() - new Date(a.createdAt).getMilliseconds());
        }
        return documents.sort((a, b) => new Date(b.createdAt).getMilliseconds() - new Date(a.createdAt).getMilliseconds());
    }, [documents, search])

    return (
        <div className={'grid gap-2'}>
            <div className={'bg-white p-2'}>
                <TextInput value={search} onChange={(e) => setSearch(e.target.value)}
                           leftSection={<BiSearch/>} placeholder={'Find file'}/>
            </div>
            {list.length < 1 &&
                <div data-aos={'fade-up'} className={"w-full h-[20vh] flex justify-around items-center"}>
                    <Text>No documents found</Text>
                </div>}
            <div className={'w-full grid md:grid-cols-3 gap-3 p-2'}>
                {list.map((doc) =>
                    <ViewTraineeDocument key={doc.id} {...doc} />)
                }
            </div>
        </div>
    )
}