import {createFileRoute} from '@tanstack/react-router'
import CreateTraineeForm from "@/components/forms/CreateTraineeForm.tsx";
import FinalPageLayout from "@/components/layouts/FinalPageLayout.tsx";

export const Route = createFileRoute(
    '/(app)/__layout/registry/__registry_layout/trainees/create',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <FinalPageLayout>
            <CreateTraineeForm/>
        </FinalPageLayout>
    )
}
