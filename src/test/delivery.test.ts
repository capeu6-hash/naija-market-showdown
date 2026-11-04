import { describe, it, expect } from "vitest";
import { deliveryFee } from "@/lib/delivery";
import { productProfit } from "@/lib/catalog";

describe("deliveryFee", () => {
  it("Ikeja is 2000", () => expect(deliveryFee("Nigeria", "Lagos", "Ikeja")).toBe(2000));
  it("Lekki is 2500", () => expect(deliveryFee("Nigeria", "Lagos", "Lekki")).toBe(2500));
  it("Surulere is 2000", () => expect(deliveryFee("Nigeria", "Lagos", "Surulere")).toBe(2000));
  it("Yaba is 1800", () => expect(deliveryFee("Nigeria", "Lagos", "Yaba")).toBe(1800));
  it("Ikorodu is 3500", () => expect(deliveryFee("Nigeria", "Lagos", "Ikorodu")).toBe(3500));
  it("Ajah is 3000", () => expect(deliveryFee("Nigeria", "Lagos", "Ajah")).toBe(3000));
  it("outside Lagos is 5000", () => expect(deliveryFee("Nigeria", "FCT (Abuja)", "Wuse")).toBe(5000));
  it("outside Nigeria is 15000", () => expect(deliveryFee("Ghana", "Accra", "")).toBe(15000));
});

describe("productProfit", () => {
  it("Samsung profit is 300000", () => expect(productProfit(1450000, 1150000, 0)).toBe(300000));
  it("subtracts delivery cost", () => expect(productProfit(68000, 45000, 2000)).toBe(21000));
});
