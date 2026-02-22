import { expect, Locator, Page } from '@playwright/test';
import { waitForRecordNumberRequest } from '../../utils/get-number-from-rqst';

export class StackDialog {
    readonly page: Page;
    readonly stackDialog: Locator;
    readonly addForm: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;
    readonly nameInput: Locator;
    readonly listNumberInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.stackDialog = this.page.locator('[data-cy="stack-dialog"]');
        this.addForm = this.stackDialog.locator('[data-cy="form"]');
        this.saveBtn = this.stackDialog.locator('[data-cy="btn-save"]');
        this.cancelBtn = this.stackDialog.locator('[data-cy="btn-cancel"]');
        this.nameInput = this.addForm.locator('[data-test-id="Название района"]');
        this.listNumberInput = this.addForm.locator('[data-test-id="Номер в списке"]');
    }

    async fillDistrictForm(districtName: string, listNumber?: string) {
        await this.nameInput.fill(districtName);
        if (listNumber !== undefined) {
            await this.listNumberInput.fill(listNumber);
        }
    }

    async fillListNumber(listNumber: string) {
        await this.listNumberInput.fill(listNumber);
    }

    async getListNumberValue(): Promise<string> {
        return await this.listNumberInput.inputValue();
    }

    async saveForm(): Promise<number> {
        const [recordNumber] = await Promise.all([
            waitForRecordNumberRequest(this.page),
            this.saveBtn.click(),
        ]);
        await expect(this.stackDialog).toBeHidden();
        return recordNumber;
    }

    async cancelForm() {
        await this.cancelBtn.click();
        await expect(this.stackDialog).toBeHidden();
    }

    async expectVisible(title: string | RegExp) {
        await expect(this.stackDialog).toBeVisible();
        await expect(this.stackDialog.getByText(title)).toBeVisible();
    }

    async expectHidden() {
        await expect(this.stackDialog).toBeHidden();
    }

    async expectSaveButtonState(state: 'enabled' | 'disabled') {
        if (state === 'enabled') {
            await expect(this.saveBtn).toBeEnabled();
        } else {
            await expect(this.saveBtn).toBeDisabled();
        }
    }

    async simulateTabPress(times: number) {
        await this.nameInput.focus();
        for (let i = 0; i < times; i++) {
            await this.page.keyboard.press('Tab');
        }
    }
}
