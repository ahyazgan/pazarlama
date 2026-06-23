import { describe, expect, it } from "vitest";
import { saveBrandRemote, savePackageRemote } from "./persist";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { ContentPackage } from "./types";

// Test ortaminda NEXT_PUBLIC_SUPABASE_* tanimsiz → guard'li no-op yol.
describe("supabase persist — guard'li no-op (yapilandirilmamis)", () => {
  it("saveBrandRemote yapilandirma yoksa null doner, throw etmez", async () => {
    await expect(saveBrandRemote(HAMMADDEM_SAMPLE)).resolves.toBeNull();
  });

  it("savePackageRemote brandId yoksa false doner", async () => {
    const pkg = { topic: "t" } as ContentPackage;
    await expect(savePackageRemote(null, pkg)).resolves.toBe(false);
  });
});
