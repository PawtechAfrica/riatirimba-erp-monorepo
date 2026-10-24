import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {useClickOutside, useDebouncedCallback} from "@mantine/hooks";
import {Badge, Table, TextInput} from "@mantine/core";
import {useNavigate} from "@tanstack/react-router";
import {CgSpinner} from "react-icons/cg";
import {BiSearch} from "react-icons/bi";
import {type AxiosInstance} from "axios";
import {showErr} from "@/utils/notification.util.tsx";
import {notifications} from "@mantine/notifications";

interface SearchResultItem {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;

    [key: string]: any;
}

interface EntitySearchInputProps {
    placeholder: string;
    searchParamName: string; // e.g. "query" or "search"
    apiInstance: AxiosInstance;
    searchPath: string;
    linkTo: string;
    page: number;
    getIntake: (item: any) => string | null | undefined;
}

export default function EntitySearchInput({
                                              placeholder,
                                              searchParamName,
                                              apiInstance,
                                              searchPath,
                                              linkTo,
                                              page,
                                              getIntake,
                                          }: EntitySearchInputProps) {
    const [search, setSearch] = useState<string | null>(null);

    const clickOutsideSearch = useClickOutside(() => {
        setSearch("");
    });

    const searchQuery = useQuery({
        queryKey: ['search-entities', searchPath, search],
        queryFn: async (): Promise<SearchResultItem[]> => {
            const result = await apiInstance.get(searchPath, {
                params: {[searchParamName]: search}
            });
            return result.data.data;
        },
        enabled: !!search && search.length > 2,
        notifyOnChangeProps: 'all',
        initialData: []
    });

    const handleSearch = useDebouncedCallback(async () => {
        await searchQuery.refetch();
    }, 500);

    const navigate = useNavigate()

    const handleClick = (search: Record<string, any>, params: Record<string, any>) => {
        navigate({to: linkTo, search, params})
            .catch(err => {
                notifications.show(showErr(err))
            })
    }

    return (
        <div ref={clickOutsideSearch}>
            <TextInput
                leftSection={searchQuery.isFetching ? <CgSpinner size={'20px'}/> : <BiSearch/>}
                placeholder={placeholder}
                value={search || ""}
                onChange={e => {
                    setSearch(e.target.value);
                    handleSearch();
                }}
            />
            {!!search && (
                <div className={"w-full absolute mt-auto bg-white drop-shadow-xl rounded-lg z-30"}>
                    {searchQuery.isFetched && searchQuery.data.length < 1 ? (
                        <div
                            className={'w-max h-[40px] right-0 absolute text-orange-800 hover:bg-gray-100 p-4 gap-10 flex items-center border-b-2 border-b-gray-200'}>
                            {search.length < 3 ? "Search text is shorter than 3 characters" : `Not found ${search.length}`}
                        </div>
                    ) : (
                        <div className={'absolute w-max bg-white right-0'}>
                            <Table className={"w-max"}>
                                <Table.Tbody>
                                    {searchQuery.data?.map(item => {
                                        const intakeVal = getIntake(item);
                                        return (
                                            <Table.Tr onClick={() => handleClick(
                                                {page: page || 1}, {id: item.id})
                                            }
                                                      className={'cursor-pointer hover:bg-slate-100'} key={item.id}>
                                                <Table.Td>
                                                    {item.firstName + " " + item.lastName + " " + item.lastName}
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge
                                                        variant={'light'}
                                                        color={intakeVal ? "primary" : "accent"}
                                                    >
                                                        {intakeVal?.toString() || "No intake"}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                            // <Link
                                            //     key={item.id}
                                            //     to={linkTo}
                                            //     search={{ page: page || 1 }}
                                            //     params={{ id: item.id }}
                                            //     className={'w-full h-[40px] hover:bg-gray-100 p-4 gap-10 grid auto-rows-fr items-center border-b-2 border-b-gray-200'}
                                            // >
                                            //     <div>{item.firstName} {item.middleName} {item.lastName}</div>
                                            //     <div>|</div>
                                            //     <div>
                                            //         <Badge
                                            //             variant={'light'}
                                            //             color={intakeVal ? "blue" : "red"}
                                            //         >
                                            //             {intakeVal?.toString() || "No intake"}
                                            //         </Badge>
                                            //     </div>
                                            // </Link>
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
