import StepFormLayout from "@/components/layout/StepFormLayout.tsx";
import {Select, TextInput} from "@mantine/core";
import {useEffect, useState} from "react";
import {type ApplicantData, GenderEnum, IdTypeEnum} from "@/libs/types.ts";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import {DatePickerInput} from "@mantine/dates";

export default function Step1ProfileForm() {
    const [profile, setProfile] = useState<Record<string, any>>({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        birthCertNumber: "",
        idNumber: "",
        gender: null,
        dateOfBirth: "",
    });

    const {admissionData} = useStore(useAdmissionDataStore);

    useEffect(() => {
        if (admissionData) {
            const copy: Record<string, any> = {};
            for (const key of Object.keys(profile)) {
                copy[key] = admissionData[key as keyof ApplicantData];
            }
            setProfile((prev) => ({...prev, ...copy}));
        }
    }, [admissionData]);

    const handleChange = (field: string, value: any) => {
        setProfile((prev) => ({...prev, [field]: value}));
    };

    return (
        <StepFormLayout title={"Profile"} step={"profile"} proppedData={profile}>
            <div data-aos={'fade-down'} className={"grid md:grid-cols-2 lg:grid-cols-3 gap-2"}>
                <TextInput
                    required
                    label="First Name"
                    placeholder="Enter your first name"
                    value={profile.firstName ?? ""}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                />
                <TextInput
                    label="Middle Name"
                    placeholder="Enter your middle name"
                    value={profile.middleName ?? ""}
                    onChange={(e) => handleChange("middleName", e.target.value)}
                />
                <TextInput
                    required
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={profile.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                />
                <TextInput
                    required
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    value={profile.email ?? ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                />
                <TextInput
                    name={'phone'}
                    placeholder={"Phone number"}
                    label={"Phone"}
                    value={profile.phone ?? ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                />
                <TextInput
                    name={'birthCertNumber'}
                    label={"Birth Certificate Number"}
                    placeholder={'Birth certificate number'}
                    required
                    value={profile.birthCertNumber ?? ""}
                    onChange={(e) => handleChange("birthCertNumber", e.target.value)}
                />
                {/*<Select*/}
                {/*    required*/}
                {/*    label="ID Type"*/}
                {/*    description="Pick Birth Certificate if you don’t have National ID"*/}
                {/*    placeholder="Select ID type"*/}
                {/*    data={[*/}
                {/*        {value: IdTypeEnum.BIRTH_CERTIFICATE, label: "Birth Certificate"},*/}
                {/*        {value: IdTypeEnum.NATIONAL_ID, label: "National ID"},*/}
                {/*    ]}*/}
                {/*    value={profile.idType}*/}
                {/*    onChange={(value) => handleChange("idType", value)}*/}
                {/*/>*/}
                <TextInput
                    // required
                    label={`${profile.idType ? profile.idType === IdTypeEnum.NATIONAL_ID ? "ID" : "Birth certification" : "ID"} Number`}
                    placeholder="Enter your ID number"
                    value={profile.idNumber ?? ""}
                    onChange={(e) => handleChange("idNumber", e.target.value)}
                />
                <Select
                    required
                    label="Gender"
                    placeholder="Select your gender"
                    data={[
                        {value: GenderEnum.MALE, label: "Male"},
                        {value: GenderEnum.FEMALE, label: "Female"},
                    ]}
                    value={profile.gender}
                    onChange={(value) => handleChange("gender", value)}
                />
                <DatePickerInput
                    required
                    label={`Date of Birth`}
                    placeholder="Pick your date of birth"
                    value={profile.dateOfBirth ? new Date(profile.dateOfBirth) : null}
                    onChange={(date) =>
                        handleChange("dateOfBirth", date ? date.toString() : "")
                    }
                />
            </div>
        </StepFormLayout>
    );
}
