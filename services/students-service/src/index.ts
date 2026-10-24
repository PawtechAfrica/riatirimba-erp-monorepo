// import dotenv from "dotenv";
import { App } from "./app";
import { AppDataSource } from "./database/data-source";
import v1Router from "./routes/v1/v1";
// import "./workers";

// dotenv.config();

async function bootstrap(): Promise<void> {
	try {
		await AppDataSource.initialize()
			.then(() => console.log(`\n📦 DATABASE CONNECTED`))
			.catch((err) => {
				console.error(`\n⚠ Database connection failed: \nError: ${err.message}\n`);
			});
		const app = new App([["/api/v1", v1Router]]);
		const port = Number(process.env.PORT || 5002);
		const server = app.listen(port);

		process.on("SIGINT", () => {
			AppDataSource.destroy()
				.then(() => {
					server.close(() => {
						console.log("Server closed");
						process.exit(0);
					});
				})
				.catch((err) => {
					console.error("Error destroying data source: ", err);
					process.exit(1);
				});
		});
		process.on("SIGTERM", () => {
			AppDataSource.destroy()
				.then(() => {
					server.close(() => {
						console.log("Server closed");
						process.exit(0);
					});
				})
				.catch((err) => {
					console.error("Error destroying data source: ", err);
					process.exit(1);
				});
		});

		// start grpc server
		// startGrpcServer()
	} catch (error) {
		await AppDataSource.destroy();
		console.error("PROBLEM BOOTSTRAPPING APPLICATION: \n" + error);
	}
}

bootstrap().catch();
