    import express from "express";
    import db from '@repo/db/client'
    import { PaymentInformation } from "./zod/webhook";

    const app = express();

    app.post("/hdfcWebhook", async (req, res) => {
        //TODO: Add zod validation here?
        const result = PaymentInformation.safeParse(req.body);
        if (!(result.success)) {
            return res.status(411).json({ msg: "Input errors", error: result.error });
        }

        try {
            await db.$transaction([

                // updating the balance in db
                db.balance.update({
                    where: {
                        userId: result.data.userId
                    },
                    data: {
                        amount: {
                            increment: result.data.amount
                        }
                    }
                }),

                // adding it in the onramptransaction
                db.onRampTransaction.update({
                    where: {
                        token: result.data.token
                    },
                    data: {
                        status: "Sucess"
                    }
                })
            ])

            res.json({
                message: "Captured"
            })

        } catch (error) {
            console.log(error);
            res.status(411).json({
                message: "Error while processing data"
            })
        }


    })