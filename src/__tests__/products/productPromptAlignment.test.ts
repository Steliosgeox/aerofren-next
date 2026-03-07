import { describe, expect, it } from "vitest";

import { productShowcaseItems } from "@/data/product-showcase";
import { AEROFREN_SYSTEM_PROMPT } from "@/lib/chatbot/prompts";

describe("chatbot prompt alignment", () => {
  it("uses the new public products language instead of category-era copy", () => {
    expect(AEROFREN_SYSTEM_PROMPT).toContain("## ΠΡΟΪΟΝΤΑ ΣΕ ΠΡΟΒΟΛΗ");
    expect(AEROFREN_SYSTEM_PROMPT).not.toContain("## ΚΑΤΗΓΟΡΙΕΣ ΠΡΟΪΟΝΤΩΝ");
    expect(AEROFREN_SYSTEM_PROMPT).toContain("δημιουργήσει λογαριασμό");

    for (const item of productShowcaseItems) {
      expect(AEROFREN_SYSTEM_PROMPT).toContain(item.nameEl);
    }
  });
});
