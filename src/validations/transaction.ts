import zod from "zod";

export const createTransaction = zod.object({
	title: zod.string(),
	amount: zod.number(),
	type: zod.enum(["credit", "debit"])
});

export const getTransaction = zod.object({
	id: zod.string().uuid()
});