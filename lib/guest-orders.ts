import Order from "@/lib/models/order"
import { normalizeGuestEmail, normalizeGuestPhone } from "@/lib/order-access"

export async function linkGuestOrdersToUser(input: {
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
}) {
  const email = normalizeGuestEmail(input.userEmail)
  const phone = input.userPhone ? normalizeGuestPhone(input.userPhone) : ""

  const orConditions: Array<Record<string, unknown>> = [{ "customer.email": email }]

  if (phone) {
    orConditions.push({ "customer.phoneNormalized": phone })
  }

  await Order.updateMany(
    {
      userId: { $in: [null, ""] },
      $or: orConditions,
    },
    {
      $set: {
        userId: input.userId,
        userName: input.userName,
        userEmail: email,
      },
    }
  )
}
