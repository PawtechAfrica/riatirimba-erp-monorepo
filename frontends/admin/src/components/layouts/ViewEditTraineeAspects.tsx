import React from "react";
import {Title} from "@mantine/core";
import {makeLabel} from "@/libs/utils.ts";


interface props extends React.HtmlHTMLAttributes<HTMLDivElement> {
    children: React.ReactNode,
    aspect: string
}

export default function ViewEditTraineeAspects({children, aspect}: props) {

    return (
        <div className={"grid gap-2 p-4 border border-slate-200 bg-white rounded-lg border-solid"}>
            <Title className={''} order={5}>{makeLabel(aspect)}</Title>
            <div className={""}>
                {children}
            </div>
        </div>
    )
}
