import {type AcademicHistoryObj, BasicEducationEnum, GradeEnum, TertiaryLevel} from "@/libs/types/admission.types.ts";
import ViewEditTraineeAspects from "@/components/layouts/ViewEditTraineeAspects.tsx";
import React, {useEffect, useMemo, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import apis from "@/libs/api.ts";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import {Button, Select, TextInput} from "@mantine/core";
import {RxUpdate} from "react-icons/rx";


interface props {
    refetch: () => void;
    traineeId: string;
    academicHistory: AcademicHistoryObj;
}

export default function ViewEditTraineeAcademicHistory({refetch, academicHistory}: props) {
    const [acHist, setAcHist] = useState<AcademicHistoryObj>({
        highSchool: null,
        highestEducationLevel: null,
        kcpeIndexNumber: "",
        kcseIndexNumber: null,
        primarySchool: null,
        tertiarySchool: null,
        id: 0,
        tertiaryLevel: null,
        kcseGrade: null
    })
    useEffect(() => {
        setAcHist(academicHistory)
    }, [academicHistory]);

    useEffect(() => {
        // set null appropriately according to highest education level
        if (acHist.highestEducationLevel == "primary") {
            setAcHist({
                ...acHist,
                highSchool: null,
                kcseGrade: null,
                kcseIndexNumber: null,
                tertiarySchool: null,
                tertiaryLevel: null
            })
        } else if (acHist.highestEducationLevel == "secondary") {
            setAcHist({...acHist, tertiarySchool: null, tertiaryLevel: null})
        }
    }, [acHist.highestEducationLevel]);

    const {mutate, isPending} = useMutation({
        mutationKey: ['update-registry-history'],
        mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const {id, ...payload} = acHist
            return await apis.trainees.patch(`/ac-history/update/${id}`, payload)
        },
        onSuccess: (res) => {
            notifications.show(showSuccess(res.data.message))
            refetch()
        },
        onError: (err) => {
            notifications.show(showErr(err))
        }
    })

    const rowStyle = useMemo(() => {
        if (acHist.highestEducationLevel == "tertiary") return "md:grid-cols-4"
        return "md:grid-cols-3"
    }, [acHist.highestEducationLevel])

    return (
        <ViewEditTraineeAspects aspect={"Academic history"}>
            <form onSubmit={mutate} className={"grid gap-2"}>
                <div className={`grid ${rowStyle} gap-2`}>
                    <Select
                        label="Highest Education Level"
                        data={[
                            {value: "primary", label: "Primary School"},
                            {value: "secondary", label: "High School"},
                            {value: "tertiary", label: "Tertiary"},
                        ]}
                        value={acHist.highestEducationLevel ?? null}
                        onChange={(value) =>
                            setAcHist({...acHist, highestEducationLevel: value as BasicEducationEnum})
                        }
                        required
                    />

                    <TextInput
                        label="KCPE Index Number"
                        value={acHist.kcpeIndexNumber ?? ""}
                        onChange={(e) => setAcHist({...acHist, kcpeIndexNumber: e.target.value})}
                        required
                    />

                    <TextInput
                        label="Primary School"
                        value={acHist.primarySchool ?? ""}
                        onChange={(e) => setAcHist({...acHist, primarySchool: e.target.value})}
                        required
                    />

                    {acHist.highestEducationLevel != "primary" && (
                        <>
                            <TextInput
                                label="High School"
                                value={acHist.highSchool ?? ""}
                                onChange={(e) => setAcHist({...acHist, highSchool: e.target.value})}
                                required
                            />

                            <TextInput
                                label="KCSE Index Number"
                                value={acHist.kcseIndexNumber ?? ""}
                                onChange={(e) => setAcHist({...acHist, kcseIndexNumber: e.target.value})}
                                required
                            />

                            <Select
                                label="KCSE Grade"
                                data={[
                                    {value: "A", label: "A"},
                                    {value: "A-", label: "A-"},
                                    {value: "B+", label: "B+"},
                                    {value: "B", label: "B"},
                                    {value: "B-", label: "B-"},
                                    {value: "C+", label: "C+"},
                                    {value: "C", label: "C"},
                                    {value: "C-", label: "C-"},
                                    {value: "D+", label: "D+"},
                                    {value: "D", label: "D"},
                                    {value: "D-", label: "D-"},
                                    {value: "E", label: "E"},
                                ]}
                                value={acHist.kcseGrade ?? null}
                                onChange={(value) =>
                                    setAcHist({...acHist, kcseGrade: value as GradeEnum})
                                }
                                required
                            />
                        </>
                    )}

                    {acHist.highestEducationLevel == "tertiary" && (
                        <>
                            <TextInput
                                label={"Tertiary School"}
                                placeholder={"Tertiary School"}
                                value={acHist.tertiarySchool ?? ""}
                                onChange={(e) => setAcHist({...acHist, tertiarySchool: e.target.value})}
                                required
                            />

                            <Select
                                label={"Tertiary Level"}
                                placeholder={"Tertiary Level"}
                                data={[
                                    {value: TertiaryLevel.CERTIFICATE, label: "Certificate"},
                                    {value: TertiaryLevel.DIPLOMA, label: "Diploma"},
                                    {value: TertiaryLevel.DEGREE, label: "Degree"},
                                ]}
                                value={acHist.tertiaryLevel ?? null}
                                onChange={(value) =>
                                    setAcHist({...acHist, tertiaryLevel: value as TertiaryLevel})
                                }
                                required
                            />
                        </>
                    )}
                </div>

                <Button leftSection={<RxUpdate/>} className={"w-max"} type={"submit"} loading={isPending}
                        disabled={isPending}>
                    Update
                </Button>
            </form>
        </ViewEditTraineeAspects>
    )
}

