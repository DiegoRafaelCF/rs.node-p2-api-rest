import { app } from "./app";
import { env } from "./env";

try {
	app.listen({ 
		host: "0.0.0.0",
		port: env.PORT 
	})
		.then(() => console.log("HTTP server is running"));
} catch (err) {
	app.log.error(err);
}