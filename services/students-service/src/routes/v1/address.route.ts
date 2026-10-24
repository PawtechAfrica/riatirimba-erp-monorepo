import express from "express";
import {AddressController} from "../../controllers/address.controller";
import {addressService} from "../../services";


const addressRoutes = express.Router()
const handler = new AddressController(addressService)

addressRoutes
    .post('/new/:student_id', handler.createAddress)
    .post('/update/:id', handler.updateAddress)


export default addressRoutes

