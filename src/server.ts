import { app } from "./app";
import { env } from "./env";

try {
	app.listen({ port: env.PORT })
		.then(() => console.log("Server is running on port 3333"));
} catch (err) {
	app.log.error(err);
}