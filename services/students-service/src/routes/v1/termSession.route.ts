import express from "express";
import { TermSessionController } from "../../controllers/termSession.controller";
import services from "../../services";
import validateSchema from "../../middleware/schema.middleware";
import termSessionSchema from "../../schema/termSession.schema";
import { verifyJWT } from "../../middleware/verifyJWT";

const termSessionRoutes = express.Router();

const termSessionController = new TermSessionController(services.termSession);

termSessionRoutes
	.get("/", verifyJWT(), termSessionController.getSessions)
	.post(
		"/create",
		verifyJWT(),
		validateSchema(termSessionSchema.createTermSessionSchema),
		termSessionController.createTermSession,
	)
	.post(
		"/close/:id",
		verifyJWT(),
		validateSchema(termSessionSchema.closeTermSessionSchema),
		termSessionController.closeTermSession,
	);

export default termSessionRoutes;
