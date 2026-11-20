import {test} from "node:test";
import assert from "node:assert/strict";
import {prioritizeCatalogCampaigns} from "../src/lib/catalog-order";
test("campaigns stay in the first-page list without dropping or duplicating products", () => {
 const input = [{slug:"regular-a"},{slug:"galaxy-tab-s11-ultra"},{slug:"iphone-18-pro-max"},{slug:"regular-b"},{slug:"galaxy-s26-ultra"},{slug:"iphone-18-pro"}];
 const output = prioritizeCatalogCampaigns(input);
 assert.deepEqual(output.map(p=>p.slug), ["iphone-18-pro","iphone-18-pro-max","galaxy-s26-ultra","galaxy-tab-s11-ultra","regular-a","regular-b"]);
 assert.equal(new Set(output.map(p=>p.slug)).size, input.length);
 assert.equal(input[0].slug,"regular-a");
});
