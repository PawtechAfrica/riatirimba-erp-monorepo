import express from "express";

export default function respond(res: express.Response, message: string, data: any, status: number = 200) {
	res.status(status).json({
		message,
		data,
	});
}
