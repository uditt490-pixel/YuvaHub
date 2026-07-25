import { Page } from "playwright";
import { FieldMapping } from "./domAnalyzer";

export async function fillFormFields(page: Page, mappings: FieldMapping[]) {
  for (const field of mappings) {
    try {
      const element = page.locator(field.selector).first();
      const isVisible = await element.isVisible();
      if (!isVisible) continue;

      switch (field.fieldType) {
        case "text":
          await element.fill(field.valueToFill);
          break;
        case "checkbox":
          if (field.valueToFill.toLowerCase() === "true" || field.valueToFill === "1") {
            await element.check();
          } else {
            await element.uncheck();
          }
          break;
        case "radio":
          await element.check();
          break;
        case "select":
          await element.selectOption({ label: field.valueToFill });
          break;
        case "file":
          // The valueToFill should be a local file path or handled differently
          // Assuming user profile has a temp downloaded resume path for this scenario
          if (field.valueToFill && field.valueToFill.startsWith("/")) {
             await element.setInputFiles(field.valueToFill);
          }
          break;
      }
      
      // Add a slight delay to simulate human typing and prevent bot detection
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    } catch (e) {
      console.warn(`Failed to fill field ${field.selector}:`, e);
    }
  }
}
