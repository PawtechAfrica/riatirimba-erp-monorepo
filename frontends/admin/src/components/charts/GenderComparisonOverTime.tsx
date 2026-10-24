import {BarChart} from "@mantine/charts";
import {Title} from "@mantine/core";
import {useStore} from "zustand/react";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import {useMemo} from "react";
import * as React from "react";

interface props extends React.HtmlHTMLAttributes<HTMLDivElement>{
    period?: "All time" | "Specific year"

}

type GenderCompareDataObj = { period: number, ladies: number, males: number, unspecified: number }
type GenderCompareDataSeries = GenderCompareDataObj[]

export default function GenderComparisonOverTime({ period, ...rest}: props) {
    period = period ? period : "All time";
    const stats = useStore(useAdmissionStore, store => store.admissionStats)

    const data: GenderCompareDataSeries = useMemo(()=>{
        const data: GenderCompareDataSeries = []
        for (const [year, values] of stats) {
            const obj: GenderCompareDataObj = {period: Number(year), ladies: 0, males: 0, unspecified: 0};
            Array.from(values).forEach(( [_str, {applicants: {unspecified, F, M}}]) => {
                obj.ladies += F
                obj.males += M
                obj.unspecified += unspecified
            })
            data.push(obj)
        }
        return data
    }, [stats])
    return (
        <div {...rest} className={`break-inside-avoid grid gap-10 p-5 bg-white auto-rows-max ${rest.className}`}>
            <Title order={3}>Gender distribution over time ({period})</Title>
            <BarChart
                h={400}
                withLegend={true}
                withTooltip={true}
                classNames={{
                    bar: '!z-0',
                    tooltip: 'z-10'
                }}
                data={data}
                dataKey={'period'}
                series={[
                    {name: "males", color: "primary.7"},
                    {name: "ladies", color: "accent.2"},
                    {name: "unspecified", color: "gray.3"},
                ]}
            />
        </div>
    )
}

