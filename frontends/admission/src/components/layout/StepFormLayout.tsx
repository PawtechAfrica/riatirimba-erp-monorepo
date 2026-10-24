import * as React from "react";
import {Button, Space, Text, Title} from "@mantine/core";
import {GoArrowLeft, GoArrowRight, GoArrowUp} from "react-icons/go";
import {useParams} from "@tanstack/react-router";
import useFormNavigation from "@/hooks/useFormNavigation.ts";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import type {FormSteps} from "@/libs/types.ts";

interface childProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
    "data-aos"?: string;
}

interface props extends React.HtmlHTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    proppedData: { [key: string]: any };
    isFiles?: boolean;
    title: string;
    step?: FormSteps,
    thisProps?: childProps;
}

export default function StepFormLayout({children, title, step, proppedData, isFiles, thisProps, ...rest}: props) {
    const {stage} = useParams({from: "/(app)/__layout/steps/$stage"});
    isFiles = !!isFiles;

    const {goBack, goNext, mutate, isPending} = useFormNavigation({});
    const applicantData = useStore(useAdmissionDataStore, store => store.admissionData)


    const end = parseInt(stage) === 6
    return (
        <div {...rest} className={`w-full md:w-[85%] m-auto p-2 md:p-5 lg:p-10 ${rest.className}`}>
            <Title order={2}>Step {stage}: {title}</Title>
            {/*<Space h={10}/>*/}
            <Space h={20}/>
            <div {...thisProps}
                 className={` min-w-[300px] bg-white transition-all p-5 rounded-lg ${thisProps?.className ? thisProps.className : "grid gap-2"}`}>
                {children}
            </div>
            <Space h={10}/>
            <Text size={'sm'} c={'orange.8'}>* Save your changes before moving to the next step</Text>
            <Space h={20}/>
            <div className={"flex justify-between"}>
                <Button
                    disabled={isPending}
                    onClick={() => goBack({proppedData, isFiles, step})}
                    variant={'light'}
                    leftSection={<GoArrowLeft/>}>
                    Back
                </Button>
                <Button
                    hidden={end}
                    disabled={isPending || applicantData?.submitted} loading={isPending}
                    onClick={() => mutate({proppedData, isFiles, step})}
                    leftSection={<GoArrowUp/>}
                >
                    Save
                </Button>
                <Button
                    disabled={(end && (applicantData?.completionStatus ?? 0) < 100)}
                    // disabled={isPending}
                    onClick={() => goNext({proppedData, isFiles, step})} variant={'light'}
                    rightSection={<GoArrowRight/>}>
                    {end ? "Complete form" : "Next"}
                </Button>
            </div>
        </div>
    )
}
