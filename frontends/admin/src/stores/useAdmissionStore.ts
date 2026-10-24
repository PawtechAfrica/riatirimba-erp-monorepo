import {
    type AdmissionStatsObj,
    type ApplicantFilter,
    type ApplicationObj,
    type IntakeObj,
    type IntakeObjInput,
    type IntakeStatObj,
    type IntakeYearStatObj,
} from "@/libs/types/admission.types.ts";
import {createStore} from "zustand";
import apis from "@/libs/api.ts";
import {type AxiosResponse} from "axios";
import dayjs from "dayjs";
import config from "@/libs/config.ts";
import type {PaginatedResponse} from "@/libs/types/app.types.ts";


export type ApplicationsTree = Map<string, { data: ApplicationObj, intake: string | null }>
export type IntakePagesObj = Map<string, Map<number, Map<string, ApplicationObj>>>

const getIntakeKey = (intake: IntakeObj | string | null): null | string => {
    return !intake ? intake : typeof intake === 'object' ? intake.periodYearKey : intake
}


export interface AdmissionStoreState {
    // applicants: Map<string, ApplicationObj>
    page: number;
    pageSize: number;
    lastPageIs: number;


    // pages: MapPage<number, Map<string, ApplicationObj>>
    intakePages: IntakePagesObj;
    applications: ApplicationsTree;

    intakes: Map<string, IntakeObj>
    activeIntake: string | null;
    // activeFilters: ApplicantQueryFilter;
    admissionStats: Map<string, Map<string, IntakeStatObj>>

    setPageMeta: (page: { page?: number, pageSize?: number, lastPageIs?: number }) => void;

    getLatestIntake: () => IntakeObj | { periodYearKey: "all" };

    setProp(data: Record<keyof AdmissionStatsObj, any>): void

    addIntakes(intakes: IntakeObj[]): void

    addApplicants(applicants: Array<ApplicationObj>, page?: number): void

    searchApplicant(term: string): Array<ApplicationObj>;

    filterApplicants(filters: ApplicantFilter, applicants: Map<string, ApplicationObj>): Array<ApplicationObj>

    approveApplications(applicant_ids: string[], page?: number): Promise<{ message: string, data: ApplicationObj[] }>;

    fetchApplicants(page?: number): Promise<PaginatedResponse<ApplicationObj>>;

    fetchApplicantsByIntake(page: number, intake?: string, queries?: Record<keyof ApplicationObj, any>): Promise<PaginatedResponse<ApplicationObj>>;

    fetchApplicantById(id: string, page?: number): Promise<ApplicationObj>;

    deleteApplicants(ids: string[], page?: number, intake?: string): Promise<{ message: string, data: string[] }>;

    fetchIntakes(): Promise<IntakeObj[]>;

    openCloseIntake(id: number, open: boolean): Promise<{ message: string, intake: IntakeObj }>;

    fetchIntakeById(id: number | string): Promise<IntakeObj>;

    createUpdateIntake(intake: IntakeObjInput, create?: boolean): Promise<{ message: string, data: IntakeObj }>;

    addAdmissionStats(stats: IntakeYearStatObj): void;

    fetchAdmissionStats(): Promise<AdmissionStatsObj[]>;

    fetchAdmissionStatByIntake(intakeId: string): Promise<IntakeStatObj>;
}

const useAdmissionStore = createStore<AdmissionStoreState>()((set, get) => ({
    // pages: new Map(),
    applications: new Map(),
    getLatestIntake: () => {
        const intakes = [...get().intakes.values()].sort((a, b) => new Date(b.year).getTime() - new Date(a.year).getTime())
        const latest = intakes[0]
        return latest || {periodYearKey: "all"}
    },
    intakePages: new Map<string, Map<number, Map<string, ApplicationObj>>>(),
    intakes: (() => {
        try {
            const cached = localStorage.getItem('cached-intakes')
            if (cached) {
                const parsed = JSON.parse(cached)
                if (Array.isArray(parsed)) {
                    return new Map(parsed.map(intake => [intake.periodYearKey, intake]))
                }
            }
        } catch (err) {
            console.error("Failed to load cached intakes:", err)
        }
        return new Map()
    })(),
    admissionStats: new Map(),
    page: 1,
    activeIntake: "",
    activeFilters: {page: 1},
    pageSize: config.APPLICANT_FETCH_SIZE,
    lastPageIs: 1,
    setPageMeta: (pageMeta) => {
        set(prev => ({...prev, ...pageMeta}));
    },
    setProp(data) {
        set(prev => ({...prev, ...data}))
    },
    async deleteApplicants(ids: string[], page?: number, intake?: string) {
        try {
            const result = await apis.admission.post(`/admission/delete-applicants`, ids) as AxiosResponse<{
                message: string;
                data: string[];
            }>;

            const applicants = new Map(get().applications)
            result.data.data.forEach(id => applicants.delete(id))

            if (intake) {
                const intakePages = new Map(get().intakePages)
                const maps = new Map(intakePages.get(intake))
                if (page) {
                    const applicantMaps = new Map<string, ApplicationObj>(maps.get(page))
                    ids.forEach(id => applicantMaps.delete(id))
                    maps.set(page, applicantMaps)
                } else {
                    // traverse all pages and delete
                    maps.forEach(p => ids.forEach(id => p.delete(id)))
                }
                set(prev => ({...prev, intakePages: intakePages}))
            }
            set(prev => ({...prev, applications: applicants}))
            return result.data
        } catch (err) {
            throw err;
        }
    },
    addAdmissionStats(statsArray) {
        const newMap = new Map(get().admissionStats);
        for (const year of Object.keys(statsArray)) {
            const newStat = new Map<string, IntakeStatObj>()
            for (const intakeId in statsArray[year]) {
                const stat = statsArray[year][intakeId]
                if (stat) newStat.set(intakeId, stat);
            }
            newMap.set(year, newStat);
        }
        set(prev => ({...prev, admissionStats: newMap}))
    },
    async fetchAdmissionStatByIntake(intake_key) {
        try {
            const result = await apis.admission.get(`/stats/intake-stat/${intake_key}`) as AxiosResponse<IntakeStatObj>
            return result.data;
        } catch (err) {
            throw err;
        }
    },
    async fetchAdmissionStats() {
        try {
            const results = await apis.admission.get(`/admission/live-stats`)
            // add to local store
            get().addAdmissionStats(results.data);
            return results.data;
        } catch (err) {
            throw err;
        }
    },
    addIntakes(intakes) {
        const map = new Map(get().intakes);
        for (const intake of intakes) {
            if (map.has(intake.periodYearKey)) {
                map.delete(intake.periodYearKey)
                map.set(intake.periodYearKey, intake)
            } else map.set(intake.periodYearKey, intake)
        }
        set(prev => ({...prev, intakes: map}))
    },
    // todo: consider passing intake
    async fetchApplicantById(id, page) {
        try {
            const result = await apis.admission.get(`/admission/applicant/${id}`) as AxiosResponse<ApplicationObj>
            // save locally
            if (page && result.data.enrollments?.intake) {
                const intake = result.data.enrollments.intake
                const intakeKey = getIntakeKey(intake)
                if (intakeKey) {
                    const intakePages = new Map(get().intakePages)
                    const thisPage = new Map(intakePages.get(intakeKey))
                    thisPage?.set(page, new Map([[id, result.data]]))
                    intakePages.set(intakeKey, thisPage)
                    set(prev => ({...prev, intakePages: intakePages}))
                }
            }
            return result.data
        } catch (error) {
            console.log(error)
            throw error;
        }
    },
    async openCloseIntake(id, open) {
        try {
            const result = await apis.admission.patch(`/intakes/${open ? 'open' : 'close'}/${id}`, {open}) as AxiosResponse<{
                message: string,
                intake: IntakeObj
            }>
            // update local store
            get().addIntakes([result.data.intake])
            return result.data;
        } catch (err) {
            throw err
        }
    },
    async fetchIntakeById(id) {
        try {
            const result = await apis.admission.get(`/intakes/intake/${id}`) as AxiosResponse<IntakeObj>
            // save locally
            get().addIntakes([result.data])
            return result.data
        } catch (error) {
            throw error;
        }
    },
    async createUpdateIntake(intake, create = true) {
        try {
            const data = {...intake, year: dayjs(intake.year).year()}
            const query = create
                ? await apis.admission.post("/intakes/intake", data)
                : await apis.admission.patch(`/intakes/intake/${intake.periodYearKey}`, data)
            const result = query as AxiosResponse<{
                message: string,
                data: IntakeObj
            }>
            // store local copy
            get().addIntakes([result.data.data])
            // return
            return result.data
        } catch (error) {
            throw error;
        }
    },
    async fetchApplicantsByIntake(page = get().page || 1, intake = undefined, queries) {
        try {
            const results = await apis.admission.get("/applicants/all", {
                params: {page, ...(intake && {intake}), ...(queries && queries)}
            }) as AxiosResponse<PaginatedResponse<ApplicationObj>>

            // populate store
            get().addApplicants(results.data.data, results.data.page)
            // save last page
            set(prev => ({...prev, pageSize: results.data.pageSize, lastPageIs: results.data.lastPageIs}))
            return results.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchApplicants(page: number = get().page || 1) {
        try {
            const results = await apis.admission.get("/applicants/all", {
                params: {page}
            }) as AxiosResponse<PaginatedResponse<ApplicationObj>>

            // populate store
            get().addApplicants(results.data.data, results.data.page)
            // save last page
            set(prev => ({...prev, pageSize: results.data.pageSize, lastPageIs: results.data.lastPageIs}))
            // return
            return results.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchIntakes() {
        try {
            const results = await apis.admission.get("/intakes/intakes") as AxiosResponse<IntakeObj[]>
            get().addIntakes(results.data)
            return results.data;
        } catch (error) {
            throw error;
        }
    },
    addApplicants(applicants, page = 1) {
        const applicantsMap = new Map(get().applications)
        const intakePages = new Map(get().intakePages)
        applicants.forEach(applicant => {
            const intake = applicant.enrollments?.intake
            if (!intake) return applicant
            const intakeKey = getIntakeKey(intake)
            if (intakeKey) {
                const intakeMap = new Map(intakePages.get(intakeKey))
                const intakePage = new Map(intakeMap.get(page))
                intakePage.set(applicant.id, applicant)
                intakeMap.set(page, intakePage)
                intakePages.set(intakeKey, intakeMap)
            }
            return applicantsMap.set(applicant.id, {data: applicant, intake: intakeKey})
        })
        set(prev => ({...prev, applications: applicantsMap, intakePages: intakePages}))
        // pages.set(page, new Map(applicants.map(applicant => [applicant.id, applicant])))
        // set(prev => ({...prev, pages: pages}))
    },
    searchApplicant(term): Array<ApplicationObj> {
        const applications = [...get().applications.values()].map(app => app.data)
        // const applications = [...get().pages.values()].flatMap(page => [...page.values()])
        return applications.filter(applicant => JSON.stringify(applicant)?.toLowerCase().includes(term?.toLowerCase()))
    },
    async approveApplications(applicant_ids, page = 1) {
        try {
            const response = await apis.admission.post<{
                data: ApplicationObj[],
                message: string
            }>("/admission/approve-applications", {applicant_ids})
            if (page) {
                const approved = response.data.data
                const applications = new Map(get().applications)
                const intakePages = new Map(get().intakePages)

                approved.forEach(approved => {
                    if(!approved.enrollments)  return approved
                    const intakeKey = getIntakeKey(approved.enrollments?.intake)
                    applications.set(approved.id, {data: approved, intake: intakeKey})
                    const intakePage = intakePages.get(intakeKey!)
                    if (intakePage) {
                        const pageMap = new Map(intakePage.get(page))
                        pageMap.set(approved.id, approved)
                        intakePage.set(page, pageMap)
                    }
                })
                set(prev => ({...prev, applications: applications, intakePages: intakePages}))
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    filterApplicants(filters, applicants: Map<string, ApplicationObj>): Array<ApplicationObj> {
        // iterate through the applicants and check those that meet each condition
        const list = [...applicants.values()]
        const result: ApplicationObj[] = []
        for (const applicant of list) {
            if (!!filters.newApplicant && (applicant.enrollments?.newApplicant?.toString() != filters.newApplicant.toString()))
                continue
            if (!applicant.enrollments?.course || (filters.course && (applicant.enrollments.course.toString() != filters.course.toString())))
                continue
            if (filters.intake && (typeof applicant.enrollments.intake === 'object' && applicant.enrollments.intake?.id != Number(filters.intake)))
                continue
            if (filters.completion && (filters.completion && applicant.completionStatus < Number(filters.completion)))
                continue
            result.push(applicant)
        }
        return result;
    }
}))

export default useAdmissionStore
