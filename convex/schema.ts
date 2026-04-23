import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const addressFields = {
  street: v.string(),
  city: v.string(),
  postCode: v.string(),
  country: v.string(),
};

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.optional(v.string()),
  }).index("by_email", ["email"]),

  invoices: defineTable({
    userId: v.string(),
    invoiceNumber: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("paid")
    ),

    clientName: v.string(),
    clientEmail: v.string(),
    clientAddress: v.object(addressFields),
    senderAddress: v.object(addressFields),

    issueDate: v.number(),
    dueDate: v.number(),
    paymentTerms: v.number(),
    description: v.string(),

    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
        total: v.number(),
      })
    ),
    total: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),
});
