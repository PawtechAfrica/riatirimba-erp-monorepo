import {ActionIcon, Button, FileInput, Text, Tooltip,} from "@mantine/core";
import {BsTrash, BsUpload} from "react-icons/bs";
import {FaEye} from "react-icons/fa6";
import {BiEdit} from "react-icons/bi";
import React, {useEffect, useRef, useState} from "react";
import {getErr, makeLabel} from "@/libs/functions.ts";
import {LuCircleCheckBig} from "react-icons/lu";
import {useMutation} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import {useFileService} from "@/hooks/useFileService.ts";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import useAuthStore from "@/stores/useAuthStore.ts";
import {RxCross1} from "react-icons/rx";
import useFormNavigation from "@/hooks/useFormNavigation.ts";
import CropModal from "@/components/components/CropModal.tsx";

interface AppFileInputProps {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
    validators?: ((file: File | null) => Promise<boolean>)[];
    accept?: string;
    uploadedData: string | null;
    withCrop?: boolean;
}

export default function AppFileInput({
                                         name,
                                         label,
                                         description,
                                         placeholder,
                                         validators,
                                         accept,
                                         uploadedData,
                                         withCrop,
                                     }: AppFileInputProps) {
    const {admissionData, update} = useStore(useAdmissionDataStore);
    const {deleteFile, getUrl} = useFileService();
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [uploaded, setUploaded] = useState<boolean>(!!uploadedData);
    const [errors, setErrors] = useState<string[]>([]);
    const [thisFile, setThisFile] = useState<File | null>(null);
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [edit, setEdit] = useState<boolean>(false);
    const formRef = useRef<HTMLFormElement | null>(null);

    const {mutate, isPending} = useFormNavigation({formRef, callback: () => setEdit(false)});

    // Fetch file URL for preview if available
    useEffect(() => {
        if (!fileUrl && uploadedData) {
            getUrl(uploadedData)
                .then((res) => setFileUrl(res ?? null))
                .catch((err) =>
                    setErrors([getErr(err).message?.toString() ?? "Failed to load file"])
                );
        }
    }, [uploadedData]);

    useEffect(() => {
        setUploaded(!!uploadedData);
    }, [uploadedData]);

    const handleChange = async (file: File | null) => {
        setErrors([]);
        if (!file) {
            setThisFile(null);
            return;
        }

        try {
            await Promise.all((validators ?? []).map((fn) => fn(file)));
            if (withCrop) {
                setCropFile(file);
            } else {
                setThisFile(file);
            }
        } catch (err: any) {
            setErrors([err.message ?? "Invalid file"]);
        }
    };

    const handleCropSave = (cropped: File) => {
        setCropFile(null);
        setThisFile(cropped);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutate({proppedData: {[name]: thisFile}, isFiles: true});
    };

    const delFile = useMutation({
        mutationFn: async () => {
            if (!uploadedData) throw Error("No uploaded file to delete!");
            return await deleteFile(
                uploadedData,
                name,
                useAuthStore.getState().id ?? ""
            );
        },
        onSuccess: (resp) => {
            notifications.show({title: "Success!", message: resp.message});
            update({documents: resp.documents});
            setUploaded(false);
            setFileUrl(null);
            setEdit(false);
        },
        onError: (err) => notifications.show(getErr(err)),
    });

    return (
        <div className="flex flex-col gap-2">
            <div className="flex w-full flex-1 flex-wrap md:items-center gap-2">
                {/* IF NOT uploaded OR currently editing → show input */}
                {!uploaded || edit ? (
                    <div className="grid gap-2 flex-1">
                        <form
                            ref={formRef}
                            onSubmit={handleSubmit}
                            className="flex gap-2 flex-wrap"
                        >
                            <FileInput
                                name={name}
                                label={label}
                                placeholder={placeholder}
                                description={description}
                                accept={accept}
                                clearable
                                disabled={admissionData?.submitted}
                                error={errors.join("\n")}
                                value={thisFile}
                                onChange={handleChange}
                                className="flex-1 min-w-[150px]"
                            />
                            <Button
                                type="submit"
                                leftSection={<BsUpload/>}
                                loading={isPending}
                                disabled={!thisFile}
                                className={"mt-auto"}
                            >
                                Upload
                            </Button>
                        </form>

                        {withCrop && (
                            <CropModal
                                file={cropFile}
                                onClose={() => {
                                    setCropFile(null)
                                }}
                                onCrop={handleCropSave}
                            />
                        )}
                    </div>
                ) : (
                    // ✅ Uploaded view (only when not editing)
                    <div
                        className="flex min-w-[100px] w-full h-full p-2 rounded-lg flex-1 items-center bg-secondary-50 gap-2">
                        <LuCircleCheckBig/>
                        <Text>Uploaded {makeLabel(name)}</Text>
                    </div>
                )}

                {/* File Actions */}
                <div
                    hidden={!uploadedData}
                    className="min-w-max justify-between h-max p-[2px] flex gap-2 mt-auto"
                >
                    {/* Edit button toggles between edit and cancel */}
                    <Tooltip label={edit ? "Cancel" : "Edit"}>
                        <ActionIcon
                            onClick={() => {
                                setEdit((v) => !v)
                                setCropFile(null)
                                setThisFile(null)
                            }}
                            size="lg"
                            variant="light"
                            disabled={admissionData?.submitted}
                        >
                            {edit ? <RxCross1/> : <BiEdit/>}
                        </ActionIcon>
                    </Tooltip>

                    {/* View */}
                    <Tooltip label="View document">
                        <ActionIcon disabled={!fileUrl} size="lg" variant="light">
                            <a href={fileUrl ?? undefined} target="_blank" rel="noopener">
                                <FaEye/>
                            </a>
                        </ActionIcon>
                    </Tooltip>

                    {/* Delete */}
                    <Tooltip label="Delete document">
                        <ActionIcon
                            disabled={delFile.isPending || admissionData?.submitted}
                            loading={delFile.isPending}
                            onClick={() => delFile.mutate()}
                            size="lg"
                            color="accent"
                            variant="light"
                        >
                            <BsTrash/>
                        </ActionIcon>
                    </Tooltip>
                </div>
            </div>

            {/* Error message (file URL loading etc.) */}
            {errors.length > 0 && <Text c="red">{errors.join("\n")}</Text>}
        </div>
    );
}
