import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  postCode: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
});

const itemSchema = z.object({
  name: z.string().min(1, "Item name required"),
  quantity: z.number().min(1, "Min 1"),
  price: z.number().min(0, "Min 0"),
  total: z.number(),
});

export const invoiceFormSchema = z.object({
  senderAddress: addressSchema,
  clientName: z.string().min(1, "Client name required"),
  clientEmail: z.string().email("Invalid email"),
  clientAddress: addressSchema,
  issueDate: z.string().min(1, "Required"),
  paymentTerms: z.number({ error: "Required" }),
  description: z.string().min(1, "Required"),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
