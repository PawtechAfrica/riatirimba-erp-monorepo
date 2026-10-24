import {useRouterState} from "@tanstack/react-router";

export default function GlobalLoadingBar(){
    const {isLoading, isTransitioning, status,} = useRouterState()
    const showOverlay = isLoading || isTransitioning || status === 'pending'

    return (
        <div
            hidden={!showOverlay}
            className={"w-full h-[5px] absolute top-0 left-0 z-40 animate-top-spinner"}
        />
    )
}