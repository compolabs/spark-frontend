import { expect, test } from "@playwright/test";

import { openTermsDialog } from "../helpers/openTermsDialog";
import { TermsOfUseDialog } from "../pageObjects/TermsOfUseDialog";

test.describe('Dialog "Terms of Use" during the first wallet connection', () => {
  let terms: TermsOfUseDialog;

  test.beforeEach(async ({ page }) => {
    await openTermsDialog(page);
    terms = new TermsOfUseDialog(page);
  });

  test("should render all required elements on open", async () => {
    await terms.expectVisibleElements();
  });

  test("should disable the Confirm button when no checkboxes are checked", async () => {
    await expect(terms.dialog).toBeVisible();
    await terms.uncheckAllCheckboxes();
    await expect(terms.confirmButton).toBeDisabled();
  });

  test("should not enable the Confirm button when only one checkbox is checked", async () => {
    await expect(terms.dialog).toBeVisible();

    await terms.checkAcceptOnly();
    await expect(terms.acceptTermsCheckbox).toBeChecked();
    await expect(terms.acknowledgeCheckbox).not.toBeChecked();
    await expect(terms.confirmButton).toBeDisabled();

    await terms.checkAcknowledgeOnly();
    await expect(terms.acceptTermsCheckbox).not.toBeChecked();
    await expect(terms.acknowledgeCheckbox).toBeChecked();
    await expect(terms.confirmButton).toBeDisabled();
  });

  test("should enable the Confirm button when both checkboxes are checked and proceed to wallet options", async () => {
    await expect(terms.dialog).toBeVisible();

    await terms.checkBothCheckboxes();
    await expect(terms.confirmButton).toBeEnabled();

    await terms.agreeAndContinue();
    await terms.expectClosed();
  });

  test("should close the dialog when clicking X, pressing Escape, or clicking backdrop", async () => {
    await terms.closeByX();

    await terms.connectWalletButton.click();
    await expect(terms.dialog).toBeVisible();
    await terms.closeByEscape();

    await terms.connectWalletButton.click();
    await expect(terms.dialog).toBeVisible();
    await terms.closeByBackdropClick();
  });

  test("should preserve checkbox state after closing and reopening the modal", async () => {
    await terms.uncheckAllCheckboxes();
    await terms.checkAcknowledgeManually();

    await expect(terms.acceptTermsCheckbox).not.toBeChecked();
    await expect(terms.acknowledgeCheckbox).toBeChecked();

    await terms.closeByX();

    await terms.connectWalletButton.click();
    await expect(terms.dialog).toBeVisible();

    await expect(terms.acceptTermsCheckbox).not.toBeChecked();
    await expect(terms.acknowledgeCheckbox).toBeChecked();
  });

  test("should toggle the Terms dropdown content visibility on trigger click", async () => {
    await expect(terms.dialog).toBeVisible();

    await expect(terms.termsDropdownContent).toBeHidden();
    await terms.toggleTermsDropdown();
    await expect(terms.termsDropdownContent).toBeVisible();

    await terms.toggleTermsDropdown();
    await expect(terms.termsDropdownContent).toBeHidden();
  });

  test("should trap focus inside the modal", async ({ page }) => {
    await terms.dialog.focus();

    const expectedFocusMarkers = ["Close", "checkbox", "terms.dialog.dropdown.trigger", "terms.dialog.button.confirm"];
    const seen = new Set<string>();

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");

      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;

        const style = window.getComputedStyle(el);
        const isTrap =
          el.tagName === "DIV" &&
          el.getAttribute("tabindex") === "0" &&
          (style.outline === "none" || style.width === "0px" || style.height === "0px" || style.overflow === "hidden");

        if (isTrap) return null;

        if (el.tagName === "INPUT" && el.getAttribute("type") === "checkbox") {
          return "checkbox";
        }

        return (
          el.getAttribute("data-testid") ||
          el.getAttribute("aria-label") ||
          el.getAttribute("id") ||
          el.getAttribute("name")
        );
      });

      if (focused) seen.add(focused);
      if (expectedFocusMarkers.every((id) => seen.has(id))) break;
    }

    console.log("🔍 Focused elements visited by Tab:", Array.from(seen));
    expect(Array.from(seen).sort()).toEqual(expectedFocusMarkers.sort());
  });
});
