import express from "express";
import db from '@repo/db/client'

const app = express();

app.post("/hdfcWebhook", async (req, res) => {
    //TODO: Add zod validation here?
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };

    try {
        await db.$transaction([

            // updating the balance in db
            db.balance.update({
                where: {
                    userId: paymentInformation.userId
                },
                data: {
                    amount: {
                        increment: paymentInformation.amount
                    }
                }
            }),

            // adding it in the onramptransaction
            db.onRampTransaction.update({
                where: {
                    token: paymentInformation.token
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