import {LineChart} from "@mantine/charts";
import {Title} from "@mantine/core";
import * as React from "react";
import {useMemo} from "react";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import {useStore} from "zustand/react";

interface props extends React.HTMLProps<HTMLDivElement> {
    period?: "All time" | "Specific year"
}

type ChartDataObj = { period: string, total: number }
type ChartDataSeries = ChartDataObj[]

export default function IntakeProgressOverTime({period, ...rest}: props) {
    period = period ? period : "All time";
    const stats = useStore(useAdmissionStore, store => store.admissionStats)

    const chartData: ChartDataSeries = useMemo(() => {
        const data: ChartDataSeries = []
        for (const [year, values] of stats) {
            const obj: ChartDataObj = {period: year, total: 0}
            obj.total = Array.from(values).reduce((acc, [_str, val]) => acc + val.total, 0)
            data.push(obj)
        }
        return data
    }, [stats])

    return (
        <div {...rest} className={`break-inside-avoid grid gap-10 p-5 bg-white auto-rows-max ${rest.className}`}>
            <Title order={3}>Application trend over time ({period})</Title>
            <LineChart
                withLegend={true}
                className={"w-full h-[50vh]"}
                data={chartData}
                dataKey={"period"}
                series={[
                    {name: "total", color: 'secondary.7'}
                ]}
                curveType={"natural"}
            />
        </div>
    )
}

