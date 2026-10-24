import {Button} from "@mantine/core";
import type {LinkGroupObj} from "@/libs/types/admission.types.ts";
import {Link, useLocation} from "@tanstack/react-router";
import {CgChevronRight} from "react-icons/cg";
import {BiRightArrowAlt} from "react-icons/bi";


interface props extends LinkGroupObj {
    index: number;
    openIndex: number | null;
    setOpen: (open: number | null) => void;
}

export default function LinkGroupButton({label, path, openIndex, index, setOpen, childPaths, ...rest}: props) {
    const open = openIndex === index;
    // const [open, setOpen] = useState(false);
    const {pathname} = useLocation();
    return (
        <div className={"grid gap-1 auto-rows-max"}>
            <div onClick={() => setOpen(open ? null : index)}>
                <Button
                    leftSection={rest.icon ? <rest.icon/> : undefined}
                    className={'w-full'}
                    variant={'transparent'}
                    color={'white'}
                    classNames={{inner: "w-max"}}
                >
                    {label}
                </Button>
                <CgChevronRight
                    className={`transition-all text-white absolute top-0 bottom-0 m-auto right-5 ${open ? "rotate-90" : ""}`}/>
            </div>
            <div
                className={`w-[95%] transition-all ${open ? 'h-full' : 'h-0 overflow-hidden'} grid auto-rows-max ml-auto`}>
                {(childPaths || []).map((path, i) => (
                    <Link
                        to={path.path as any}
                        params={(path.params ?? {}) as any}
                        search={(path.search ?? {}) as any}
                        activeOptions={{exact: true, includeSearch: false}}
                        key={i}
                    >
                        {({isActive}) => {
                            isActive = pathname === "/" ? isActive : pathname.includes(path.path)
                            return <Button
                                variant={'light'} className={"w-full"}
                                leftSection={path.icon ? <path.icon/> :
                                    <BiRightArrowAlt color={isActive ? "" : 'transparent'}/>}
                                color={isActive ? 'secondary.2' : 'white'}
                                classNames={{inner: 'w-max !transition-all ml-3'}}
                            >
                                {path.label}
                            </Button>
                        }}
                    </Link>
                ))}
            </div>
        </div>
    )
}

