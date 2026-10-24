import {ModelServiceFw} from "./ModelServiceFw";
import {Address} from "../database/entities/Address.entity";
import {AppError} from "../utils/bootstrappers";
import {validateDTO} from "../utils/validateDTO";
import {UpdateAddressDto} from "../types/DTOs/address.dto";
import {Applicants} from "../database/entities/Applicants.entity";


export class AddressService extends ModelServiceFw<Address> {
    entity = Address;
    baseFields = ['county', 'location', 'subLocation', 'village', 'poBox', 'zipCode'] satisfies (keyof Address)[]

    async updateAddress(data: any, addressId?: number, applicantId?: string) {
        const invalid = !addressId && !applicantId
        if (invalid)
            throw new AppError("Invalid address ID or applicant provided!", 400)
        if (!this.em)
            throw new AppError("Unable to update address at this time!")

        if (!data)
            throw new AppError("No address data provided!")
        // validate data
        // ignore the ID to avoid updating it
        const validated = await validateDTO(UpdateAddressDto, data)
        // find the address
        let found;
        found = await this.repo?.findOne({id: addressId})
        if (!found) {
            if (!applicantId)
                throw new AppError("Applicant not found! Please try again later.")
            // create the address for the applicant
            const applicant = await this.em.findOne(Applicants, applicantId)
            if (!applicant) throw new AppError("Applicant not found! Please try again later.")
            found = this.em.create(Address, {applicant: applicantId})
            applicant.address = found
        }
        // update the address data
        this.em.assign(found, validated)
        // persist and flush
        await this.em.persistAndFlush(found)
        return found;
    }
}


