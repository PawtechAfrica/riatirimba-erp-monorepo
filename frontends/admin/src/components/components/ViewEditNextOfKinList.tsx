import ViewEditTraineeNextOfKin, {defaultNextOfKin} from "@/components/forms/ViewEditTraineeNextOfKin.tsx";
import type {NextOfKinObj} from "@/libs/types/admission.types.ts";
import {useEffect, useState} from "react";
import {Button, Space} from "@mantine/core";
import {BsPersonAdd} from "react-icons/bs";
import ViewEditTraineeAspects from "@/components/layouts/ViewEditTraineeAspects.tsx";

interface props {
    list: NextOfKinObj[],
    refetch: () => void,
    traineeId: string,
}


export default function ViewEditNextOfKinList({list, refetch, traineeId}: props) {
    const [noks, setNoks] = useState<NextOfKinObj[]>([])

    const localRemoveNok = (index: number) => {
        const hold = noks.filter((_, i) => i !== index)
        setNoks(hold)
    }

    useEffect(() => {
        setNoks(list)
    }, [list]);

    return (
        <ViewEditTraineeAspects aspect={"Next of Kin"}>
            <div className={'grid gap-2'}>
                {noks.map((kin, i) =>
                    <ViewEditTraineeNextOfKin
                        index={i}
                        key={i}
                        {...kin}
                        localRemove={localRemoveNok}
                        refresh={refetch}
                        traineeId={traineeId}
                    />
                )}
            </div>
            <Space h={10} />
            <div hidden={noks.length >= 2}>
                <Button onClick={() => {
                    const list = [...noks]
                    list.push(defaultNextOfKin)
                    setNoks(() => (list))
                }}
                        leftSection={<BsPersonAdd/>} variant={'outline'}>
                    Add next of kin
                </Button>
            </div>
        </ViewEditTraineeAspects>
    )
}
