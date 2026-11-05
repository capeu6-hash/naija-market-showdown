import { describe, expect, it } from "vitest";
import { bankSchema } from "@/lib/bank";

describe("editable bank details", () => {
  it("accepts a changed bank and retains leading zeroes", () => {
    expect(bankSchema.parse({ name: "GTBank", accountName: "GoGo Gadget", accountNumber: "0123456789" })).toEqual({ name: "GTBank", accountName: "GoGo Gadget", accountNumber: "0123456789" });
  });
  it("rejects incomplete bank details", () => {
    expect(bankSchema.safeParse({ name: "", accountName: "", accountNumber: "123" }).success).toBe(false);
  });
});