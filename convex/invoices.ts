import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function requireUser(identity: { subject: string } | null) {
  if (!identity) throw new Error("Not authenticated");
  return identity.subject;
}

function generateInvoiceNumber(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l1 = letters[Math.floor(Math.random() * 26)];
  const l2 = letters[Math.floor(Math.random() * 26)];
  const digits = Math.floor(Math.random() * 9000 + 1000).toString();
  return `${l1}${l2}${digits}`;
}

export const list = query({
  args: {
    status: v.optional(
      v.union(v.literal("draft"), v.literal("pending"), v.literal("paid"))
    ),
  },
  handler: async (ctx, { status }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = requireUser(identity);

    if (status) {
      return ctx.db
        .query("invoices")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", status)
        )
        .order("desc")
        .collect();
    }

    return ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = requireUser(identity);
    const invoice = await ctx.db.get(id);
    if (!invoice || invoice.userId !== userId) return null;
    return invoice;
  },
});

const invoiceFields = {
  clientName: v.string(),
  clientEmail: v.string(),
  clientAddress: v.object({
    street: v.string(),
    city: v.string(),
    postCode: v.string(),
    country: v.string(),
  }),
  senderAddress: v.object({
    street: v.string(),
    city: v.string(),
    postCode: v.string(),
    country: v.string(),
  }),
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
};

export const create = mutation({
  args: {
    ...invoiceFields,
    status: v.union(v.literal("draft"), v.literal("pending")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = requireUser(identity);

    return ctx.db.insert("invoices", {
      ...args,
      userId,
      invoiceNumber: generateInvoiceNumber(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("invoices"),
    ...invoiceFields,
    status: v.union(v.literal("draft"), v.literal("pending")),
  },
  handler: async (ctx, { id, ...fields }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = requireUser(identity);
    const invoice = await ctx.db.get(id);
    if (!invoice || invoice.userId !== userId) throw new Error("Not found");
    if (invoice.status === "paid")
      throw new Error("Cannot edit a paid invoice");
    await ctx.db.patch(id, fields);
  },
});

export const markAsPaid = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = requireUser(identity);
    const invoice = await ctx.db.get(id);
    if (!invoice || invoice.userId !== userId) throw new Error("Not found");
    if (invoice.status !== "pending")
      throw new Error("Only pending invoices can be marked as paid");
    await ctx.db.patch(id, { status: "paid" });
  },
});

export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = requireUser(identity);
    const invoice = await ctx.db.get(id);
    if (!invoice || invoice.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
