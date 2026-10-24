import type {DocumentObj} from "@/libs/types/admission.types.ts";
import {FaEye, FaFilePdf} from "react-icons/fa";
import {Button, Text} from "@mantine/core";
import {makeLabel} from "@/libs/utils.ts";
import {useEffect, useMemo} from "react";
import type {IconType} from "react-icons";
import {FaFile} from "react-icons/fa6";
import FilesService from "@/services/Files.service.ts";
import {useCacheStore} from "@/stores/useCacheStore.ts";
import {IoImagesSharp} from "react-icons/io5";


interface props extends DocumentObj {
}

export default function ViewTraineeDocument({documentKey, ...doc}: props) {
    const cacheStore = useCacheStore()

    const realUrl = cacheStore.getItem(doc.url)

    const Icon: IconType = useMemo(() => {
        // todo: use regex instead
        if (realUrl?.includes("png") || realUrl?.includes("jpg") || realUrl?.includes("jpeg"))
            return IoImagesSharp
        if (realUrl?.includes("pdf"))
            return FaFilePdf
        return FaFile
    }, [realUrl]);

    useEffect(() => {
        if (!cacheStore.getItem(doc.url)) {
            FilesService.getUrl(doc.url)
                .then(url => {
                    cacheStore.setItem(doc.url, url, 300)
                })
                .catch(_err => {
                });
        }
    }, [cacheStore]);

    return (
        <div data-aos={'zoom-in'}
             className={"bg-white rounded-md p-3 cursor-pointer shadow hover:shadow-xl hover:-translate-y-1 transition-all"}>
            <div className={'flex items-center gap-2 py-5'}>
                <Icon size={'22px'} className={'text-primary-600'}/>
                <Text size={'md'}>{makeLabel(documentKey)}</Text>
            </div>
            <a href={realUrl ?? ""} target={'_blank'}>
                <Button disabled={!realUrl} leftSection={<FaEye/>} variant={'light'}>
                    {!!realUrl ? "View" : "Not ready"}
                </Button>
            </a>
        </div>
    )
}

