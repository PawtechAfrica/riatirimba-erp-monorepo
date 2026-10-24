import * as v from "@/libs/types/voucher.types.ts";
import {createStore} from "zustand";
import apis from "@/libs/api.ts";
import {downloadBlob, printDialogue} from "@/libs/utils.ts";


interface VoucherStoreObj {
    vouchers: Map<number, Partial<v.VoucherObj>>
    addVouchers: (voucher: Partial<v.VoucherObj>[]) => void
    removeVoucher: (id: number) => void

    fetchAllVouchers: () => Promise<v.VoucherObj[]>
    fetchSpecificVoucher: (id: number) => Promise<v.VoucherObj>
    createVoucher: (voucher: v.CreateVoucherRequest) => Promise<v.VoucherObj>
    createBulkVouchers: (data: v.BatchCreateVouchersRequest) => Promise<v.BatchCreateVouchersResponse>
    updateVoucher: (id: number, voucher: v.UpdateVoucherRequest) => Promise<Partial<v.VoucherObj>>
    deleteVoucher: (id: number) => Promise<{ message: string }>

    getVoucherPdf: (id: number) => Promise<Blob>;
    printVoucher: (id: number) => Promise<void>;
    downloadVoucher: (id: number) => Promise<void>;
}

const useVoucherStore = createStore<VoucherStoreObj>()((set, get) => ({
    vouchers: new Map(),
    addVouchers(vouchers) {
        const newMap = new Map(get().vouchers)
        vouchers.forEach(voucher => newMap.set(voucher.id!, voucher))
        set(prev => ({...prev, vouchers: newMap}))
    },
    getVoucherPdf: async (id): Promise<Blob> => {
        const result = await apis.voucher.get<Blob>(`/${id}/pdf`, {
            responseType: "blob"
        })
        return result.data
    },
    downloadVoucher: async (id) => {
        const blob = await get().getVoucherPdf(id);
        const voucher = get().vouchers.get(id)
        downloadBlob(blob, `voucher-${voucher ? voucher.voucherNo : id}.pdf`)
    },
    printVoucher: async (id) => {
        const blob = await get().getVoucherPdf(id);
        printDialogue(blob)
    },
    removeVoucher(id) {
        const newMap = new Map(get().vouchers)
        newMap.delete(id)
        set(prev => ({...prev, vouchers: newMap}))
    }
    ,
    fetchAllVouchers: async () => {
        const results = await apis.voucher.get<v.VoucherObj[]>("/")
        // add to local store
        get().addVouchers(results.data)
        return results.data
    },
    fetchSpecificVoucher:
        async (id) => {
            const result = await apis.voucher.get<v.VoucherObj>(`/${id}`)
            // add to local store
            get().addVouchers([result.data])
            return result.data;
        },
    createVoucher:
        async (voucher) => {
            const result = await apis.voucher.post<v.VoucherObj>("/", voucher)
            // add to local store
            get().addVouchers([result.data])
            return result.data;
        },
    createBulkVouchers:
        async (data) => {
            const result = await apis.voucher.post<v.BatchCreateVouchersResponse>("/batch", data)
            // add to local store
            get().addVouchers(result.data.vouchers)
            return result.data;
        },
    updateVoucher:
        async (id: number, voucher) => {
            const result = await apis.voucher.put<Partial<v.VoucherObj>>(`/${id}`, voucher)
            // update local store
            get().addVouchers([result.data])
            return result.data;
        },
    deleteVoucher:
        async (id) => {
            const result = await apis.voucher.delete<{ message: string }>(`/${id}`)
            // remove from local store
            get().removeVoucher(id)
            return result.data;
        },
}))

export default useVoucherStore

