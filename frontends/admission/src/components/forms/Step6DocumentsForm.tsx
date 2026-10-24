import StepFormLayout from "@/components/layout/StepFormLayout.tsx";
import AppFileInput from "@/components/inputs/AppFileInput.tsx";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import {BasicEducationEnum, TertiaryLevel} from "@/libs/types.ts";
import {FileSizeValidator, getEnumKey, makeLabel} from "@/libs/functions.ts";

export default function Step6DocumentsForm() {
    const applicantData = useStore(useAdmissionDataStore, store => store.admissionData);

    const tertiaryLevel = applicantData?.academicHistory?.tertiaryLevel
        ? makeLabel(getEnumKey(TertiaryLevel, applicantData.academicHistory.tertiaryLevel) ?? "")
        : undefined;

    return (
        <StepFormLayout proppedData={{}} title="Documents" isFiles>
            <AppFileInput
                name="passportPhoto"
                placeholder="Passport"
                label="Upload Photo"
                validators={[FileSizeValidator(5)]}
                accept="image/jpeg, image/png, image/jpg"
                description="Upload Photo (5.5cm * 5.5cm)"
                uploadedData={applicantData?.documents?.passportPhoto ?? null}
                withCrop
            />

            <AppFileInput
                name="birthCertificate"
                placeholder="Birth certificate"
                label="Upload Birth certificate"
                description="Maximum 5mb"
                accept="application/pdf"
                validators={[FileSizeValidator(5)]}
                uploadedData={applicantData?.documents?.birthCertificate ?? null}
            />

            {/*{applicantData?.idType === IdTypeEnum.NATIONAL_ID && (*/}
            <AppFileInput
                name="nationalId"
                placeholder="National ID scanned copy"
                label="Upload national ID"
                description="Maximum 5mb"
                accept="application/pdf"
                validators={[FileSizeValidator(5)]}
                uploadedData={applicantData?.documents?.nationalId ?? null}
            />
            {/*)}*/}

            <AppFileInput
                name="kcpeCertificate"
                placeholder="KCPE Certificate"
                label="Upload KCPE Certificate"
                description="Maximum 5mb"
                accept="application/pdf"
                validators={[FileSizeValidator(5)]}
                uploadedData={applicantData?.documents?.kcpeCertificate ?? null}
            />

            <AppFileInput
                name="kcseCertificate"
                placeholder="KCSE Certificate"
                label="Upload KCSE Certificate"
                description="Maximum 5mb"
                accept="application/pdf"
                validators={[FileSizeValidator(5)]}
                uploadedData={applicantData?.documents?.kcseCertificate ?? null}
            />

            {applicantData?.academicHistory?.highestEducationLevel === BasicEducationEnum.TERTIARY && (
                <AppFileInput
                    name="tertiaryCertificate"
                    placeholder={`Upload your ${tertiaryLevel ?? ""} certificate`}
                    label="Upload your tertiary certificate"
                    description="Maximum 5mb"
                    accept="application/pdf"
                    validators={[FileSizeValidator(5)]}
                    uploadedData={applicantData?.documents?.tertiaryCertificate ?? null}
                />
            )}
        </StepFormLayout>
    );
}
