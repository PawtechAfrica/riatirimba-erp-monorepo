import express from "express";
import studentRouter from "./students.route";
import enrollmentRoutes from "./enrollment.route";
import nextOfKinRoutes from "./nextOfKin.route";
import addressRoutes from "./address.route";
import acHistoryRoutes from "./acHistory.route";
import admissionRoutes from "./admission.route";
import courseModuleRouter from "./module.route";
import termSessionRoutes from "./termSession.route";

const v1Router = express.Router();

v1Router
	.use("/students", studentRouter)
	.use("/enrollment", enrollmentRoutes)
	.use("/noks", nextOfKinRoutes)
	.use("/address", addressRoutes)
	.use("/ac-history", acHistoryRoutes)
	.use("/admission", admissionRoutes)
	.use("/modules", courseModuleRouter)
	.use("/sessions", termSessionRoutes);

export default v1Router;
