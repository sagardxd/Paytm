import z from 'zod'

export const PaymentInformation = z.object({
    token: z.string(),
    userId : z.number(),
    amount : z.number()
})