import { expect, type Locator, type Page } from "@playwright/test";

export class TermsOfUseDialog {
  private readonly page: Page;

  private readonly selectors = {
    dialog: '[data-testid="terms.dialog"]',
    accept: '[data-testid="terms.dialog.checkbox.accept"]',
    acknowledge: '[data-testid="terms.dialog.checkbox.acknowledge"]',
    confirm: '[data-testid="terms.dialog.button.confirm"]',
    title: '[data-testid="terms.dialog.title"]',
    trigger: '[data-testid="terms.dialog.dropdown.trigger"]',
    content: '[data-testid="terms.dialog.dropdown.content"]',
    close: 'button[aria-label="Close"]',
    connectWallet: 'button[data-connect-button="true"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  get dialog(): Locator {
    return this.page.locator(this.selectors.dialog);
  }

  get closeButton(): Locator {
    return this.page.locator(this.selectors.close);
  }

  get title(): Locator {
    return this.dialog.locator(this.selectors.title);
  }

  get acceptTermsCheckbox(): Locator {
    return this.dialog.locator(this.selectors.accept);
  }

  get acknowledgeCheckbox(): Locator {
    return this.dialog.locator(this.selectors.acknowledge);
  }

  get termsDropdownTrigger(): Locator {
    return this.dialog.locator(this.selectors.trigger);
  }

  get termsDropdownContent(): Locator {
    return this.dialog.locator(this.selectors.content);
  }

  get confirmButton(): Locator {
    return this.dialog.locator(this.selectors.confirm);
  }

  get connectWalletButton(): Locator {
    return this.page.locator(this.selectors.connectWallet);
  }

  async expectVisibleElements() {
    await expect(this.dialog).toBeVisible();
    await expect(this.closeButton).toBeVisible();
    await expect(this.title).toHaveText(/terms of use/i);
    await expect(this.acceptTermsCheckbox).toBeVisible();
    await expect(this.acknowledgeCheckbox).toBeVisible();
    await expect(this.termsDropdownTrigger).toBeVisible();
    await expect(this.confirmButton).toBeVisible();
    await expect(this.confirmButton).toHaveText(/agree and continue/i);
  }

  async isOpen() {
    return this.dialog.isVisible();
  }

  async isClosed() {
    return this.dialog.isHidden();
  }

  async uncheckAllCheckboxes() {
    await this.acceptTermsCheckbox.uncheck();
    await this.acknowledgeCheckbox.uncheck();
  }

  async checkBothCheckboxes() {
    await this.acceptTermsCheckbox.check();
    await this.acknowledgeCheckbox.check();
  }

  async checkAcceptOnly() {
    await this.uncheckAllCheckboxes();
    await this.acceptTermsCheckbox.check();
  }

  async checkAcknowledgeOnly() {
    await this.uncheckAllCheckboxes();
    await this.acknowledgeCheckbox.check();
  }

  async agreeAndContinue() {
    await this.confirmButton.click();
  }

  async expectClosed() {
    await expect(this.dialog).toBeHidden();
  }

  async closeByX() {
    await this.closeButton.click();
    await this.expectClosed();
  }

  async closeByEscape() {
    await this.dialog.focus();
    await this.page.keyboard.press("Escape");
    await this.expectClosed();
  }

  async checkAcknowledgeManually() {
    await this.acknowledgeCheckbox.check();
  }

  async closeByBackdropClick() {
    const wrap = this.dialog;
    const modal = wrap.locator(".rc-dialog");

    const wrapBox = await wrap.boundingBox();
    const modalBox = await modal.boundingBox();

    if (wrapBox && modalBox) {
      const clickX = wrapBox.x + 10;
      let clickY = wrapBox.y + 10;

      if (
        clickX >= modalBox.x &&
        clickX <= modalBox.x + modalBox.width &&
        clickY >= modalBox.y &&
        clickY <= modalBox.y + modalBox.height
      ) {
        clickY = modalBox.y + modalBox.height + 10;
      }

      await this.page.mouse.click(clickX, clickY);
    } else {
      await wrap.click({ force: true });
    }

    await this.expectClosed();
  }

  async toggleTermsDropdown() {
    await this.termsDropdownTrigger.click();
  }
}
