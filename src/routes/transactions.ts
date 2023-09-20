import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { createTransaction, getTransaction } from "../validations/transaction";
import { randomUUID } from "crypto";

export async function transactionsRoutes(app: FastifyInstance) {
	app.get("/", async function handle(req) {
		const sessionId = req.cookies.session_id;
		const transactions = await knex("transactions").where("session_id", sessionId);
		return {
			data: transactions
		};
	});

	app.get("/:id", async(req) => {
		const sessionId = req.cookies.session_id;
		const {id} = getTransaction.parse(req.params);
		const transaction = await knex("transactions").where("id", id).andWhere("session_id", sessionId).first();

		return {
			data: transaction
		};
	});

	app.get("/summary", async(req) => {
		const sessionId = req.cookies.session_id;
		const total = await knex("transactions").sum("amount", {as: "amount"}).where("session_id", sessionId).first();

		return {
			data: total
		};
	});

	app.post("/", async function handle(req, res) {
		const {body} = req;

		try {
			const id = randomUUID();
			const {title, amount, type} = createTransaction.parse(body);
			let sessionId = req.cookies.session_id;

			if(!sessionId) {
				sessionId = randomUUID();

				res.cookie("session_id", sessionId, {
					path: "/",
					maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
				});
			}

			await knex("transactions").insert({
				id,
				title,
				amount: type === "credit" ? amount : amount * -1,
				session_id: sessionId
			}).returning("*");
			
			return res.status(201).send();
			
		} catch(err) {
			console.error(err);
			return res.status(400).send();
		}
	});
}