import {createFileRoute, useParams} from '@tanstack/react-router'
import {useMemo} from "react";
import Step1ProfileForm from "@/components/forms/Step1ProfileForm.tsx";
import CompletedApplicationForm from "@/components/screens/CompletedApplicationForm.tsx";
import Step2AddressForm from "@/components/forms/Step2AddressForm.tsx";
import Step3NextOfKinForm from "@/components/forms/Step3NextOfKinForm.tsx";
import Step4AcademicHistoryForm from "@/components/forms/Step4AcademicHistory.tsx";
import Step5CourseForm from "@/components/forms/Step5CourseForm.tsx";
import Step6DocumentsForm from "@/components/forms/Step6DocumentsForm.tsx";
import FormNavigation from "@/components/navigation/FormNavigation.tsx";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import {Progress, Space} from "@mantine/core";

export const Route = createFileRoute('/(app)/__layout/steps/$stage')({
    component: RouteComponent,
})

function RouteComponent() {
    const {stage} = useParams({from: "/(app)/__layout/steps/$stage"})
    const completion = useStore(useAdmissionDataStore, store => store.admissionData?.completionStatus ?? 0)

    const StepForm = useMemo(() => {
        switch (stage) {
            case "1":
                return Step1ProfileForm
            case "2":
                return Step2AddressForm
            case "3":
                return Step3NextOfKinForm
            case "4":
                return Step4AcademicHistoryForm
            case "5":
                return Step5CourseForm
            case "6":
                return Step6DocumentsForm
            default:
                return CompletedApplicationForm
        }
    }, [stage])

    const color = useMemo(() => {
        if (completion === 100) return 'green.7'
        if (completion > 80) return "primary"
        return "orange"
    }, [completion])

    return (
        <div className={"w-full h-[calc(100vh-70px)]"}>
            <div className={"flex w-full h-full"}>
                <FormNavigation/>
                <div className={"w-full h-full overflow-y-auto"}>
                    <Space h={20}/>
                    <Progress className={'w-[95%] md:w-[79%] bg-gray-300 m-auto'} color={color} value={completion}
                              transitionDuration={700}/>
                    <StepForm/>
                </div>
            </div>
        </div>
    )
}
