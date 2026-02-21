import { expect, Locator, Page } from '@playwright/test';
import {waitClickable} from "../utils/wait-clickable";
import { StackDialog } from './components/StackDialog';

export class AccountsPage {
    readonly page: Page;
    readonly addBtn: Locator;
    readonly stackMenu: Locator;
    readonly headerToolbar: Locator;
    readonly deleteDialog: Locator;
    readonly stackDialog: StackDialog;

    constructor(page: Page) {
        this.page = page;
        this.addBtn = this.page.locator('[data-cy="btn-add"]');
        this.stackMenu = this.page.locator('[data-cy="stack-menu-list"]');
        this.headerToolbar = this.page.locator('[data-cy="stack-table-toolbar"]');
        this.deleteDialog = this.page.locator('[data-test-id="stack-yes-no"]');
        this.stackDialog = new StackDialog(page);
    }

    async open() {
        await this.page.goto('/fl/accounts', { waitUntil: 'domcontentloaded' });
        await expect(this.page.locator('[data-cy="stack-table-toolbar"]').getByText(/адреса проживающих/i)).toBeVisible();
    }

    async openDistrictForm() {
        await waitClickable(this.addBtn)
        await this.addBtn.click();
        await expect(this.stackMenu).toBeVisible();

        const districtItem = this.stackMenu.locator('[data-cy="stack-menu-list-item"]')
            .filter({ hasText: /^\s*Район\s*$/});

        await expect(districtItem).toBeVisible();
        await districtItem.click();
        await this.stackDialog.expectVisible(/Район\s*\(создание\)/i);
    }

    async addNewDistrict(districtName: string): Promise<number> {
        await this.openDistrictForm();
        await this.stackDialog.fillDistrictForm(districtName);
        const recordNumber = await this.stackDialog.saveForm();
        return recordNumber;
    }

    async checkNoteInTable(recordNumber: number, expectedName?: string) {
        const row = this.foundRowByRecordNumber(recordNumber);

        await expect(row).toHaveCount(1);
        await expect(row).toBeVisible();

        if (expectedName) {
            await expect(row.locator('[data-field="название"]')).toHaveText(expectedName);
        }
    }


    foundRowByRecordNumber(recordNumber: number): Locator {
        const id = String(recordNumber).trim();
        return this.page.locator(`tr[id="${id}"]`);
    }

    async editDistrict(recordNumber: number, newName: string) {
        await this.checkNoteInTable(recordNumber);
        const row: Locator = this.foundRowByRecordNumber(recordNumber);

        const editNoteBtn: Locator = row.locator('[data-cy="btn-edit"]')
        await row.hover();

        await expect(editNoteBtn).toBeVisible({ timeout: 5000 });
        await editNoteBtn.click();

        await this.stackDialog.expectVisible(/Район\s*\(редактирование\)/i);

        await this.stackDialog.nameInput.fill(newName)
        await this.stackDialog.nameInput.press('Tab');
        await expect(this.stackDialog.saveBtn).toBeEnabled();
        await this.stackDialog.saveForm();
        await this.checkNoteInTable(recordNumber, newName);
    }

    async openEditDistrictForm(recordNumber: number): Promise<Locator> {
        const row: Locator = this.foundRowByRecordNumber(recordNumber);
        const editNoteBtn: Locator = row.locator('[data-cy="btn-edit"]');
        await row.hover();
        await expect(editNoteBtn).toBeVisible({ timeout: 5000 });
        await editNoteBtn.click();
        await this.stackDialog.expectVisible(/Район\s*\(редактирование\)/i);
        return this.stackDialog.nameInput;
    }

    async deleteDistrict(recordNumber: number){
        await this.checkNoteInTable(recordNumber);
        const row: Locator = this.foundRowByRecordNumber(recordNumber);
        await expect(row).toHaveCount(1);

        const cbInput = row.locator('input[data-cy="checkbox"]');
        await row.hover();

        await expect(cbInput).toBeVisible({ timeout: 5000 });

        const cbWrapper = cbInput.locator('..');
        await cbWrapper.click();

        const deleteBth = this.headerToolbar.locator('[data-cy="btn-delete"]');
        await expect(deleteBth).toBeVisible();

        await deleteBth.click();

        await expect(this.deleteDialog).toBeVisible();
        await this.deleteDialog.locator('[data-cy="btn-yes"]').click();

        await expect(this.deleteDialog).toBeHidden();

        await expect(row).toHaveCount(0);
    }
}
