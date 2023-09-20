import { afterAll, beforeAll, expect, describe, it, beforeEach } from "vitest";
import supertest from "supertest";
import {app} from "../src/app";
import { execSync } from "child_process";


describe("Transactions routes", () => {
	beforeAll(async () => {
		await app.ready();
	});
	
	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		execSync("npm run knex migrate:rollback --all");
		execSync("npm run knex migrate:latest");
	});
	
	it("should be able to create a new transaction", async () => {
		const response = await supertest(app.server).post("/transactions").send({
			title: "Test",
			amount: 5000,
			type: "credit"
		});
	
		expect(response.statusCode).toBe(201);
	});

	it("should be able to list all transactions", async () => {
		const createTransactionResponse = await supertest(app.server).post("/transactions").send({
			title: "Test",
			amount: 5000,
			type: "credit"
		});

		const listTransactionsResponse = await supertest(app.server).get("/transactions/").set("Cookie", createTransactionResponse.get("Set-Cookie"));

		expect(listTransactionsResponse.status).toBe(200);
		expect(listTransactionsResponse.body.data).toEqual([expect.objectContaining({
			title: "Test",
			amount: 5000
		})]);
	});

	it("should be able to get a transaction by id", async () => {
		const createTransactionResponse = await supertest(app.server).post("/transactions").send({
			title: "Test",
			amount: 5000,
			type: "credit"
		});

		const transactionId = await supertest(app.server).get("/transactions").set("Cookie", createTransactionResponse.get("Set-Cookie")).then(response => response.body.data[0].id);

		const transactionResponse = await supertest(app.server).get(`/transactions/${transactionId}`).set("Cookie", createTransactionResponse.get("Set-Cookie"));

		expect(transactionResponse.status).toBe(200);
		expect(transactionResponse.body.data).toEqual(expect.objectContaining({
			title: "Test",
			amount: 5000
		}));
	});

	it("should be able to get sum of amount by session_id", async () => {
		const createFirstTransactionResponse = await supertest(app.server).post("/transactions").send({
			title: "Test 1",
			amount: 5000,
			type: "credit"
		});

		await supertest(app.server).post("/transactions").send({
			title: "Test 2",
			amount: 3000,
			type: "debit"
		}).set("Cookie", createFirstTransactionResponse.get("Set-Cookie"));

		const summaryTransactionsResponse = await supertest(app.server).get("/transactions/summary").set("Cookie", createFirstTransactionResponse.get("Set-Cookie"));

		expect(summaryTransactionsResponse.status).toBe(200);
		expect(summaryTransactionsResponse.body.data.amount).toEqual(2000);
	});
});

