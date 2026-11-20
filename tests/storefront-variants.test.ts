import { test } from "node:test";
import assert from "node:assert/strict";
import { isStorefrontVariantAllowed } from "../src/lib/storefront-variants";
const options = (value:string) => [{attributeValue:{value,attribute:{slug:"sim"}}}];
test("iPhone legacy SIM-only SKU is unavailable while supported SKUs retain their identity",()=>{
 assert.equal(isStorefrontVariantAllowed("iphone-18-pro",options("SIM")),false);
 assert.equal(isStorefrontVariantAllowed("iphone-18-pro-max",options("eSIM")),true);
 assert.equal(isStorefrontVariantAllowed("iphone-14",options("SIM + eSIM")),true);
 assert.equal(isStorefrontVariantAllowed("galaxy-s26",options("SIM")),true);
});
