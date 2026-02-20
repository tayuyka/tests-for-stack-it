import { expect, Locator, Page } from '@playwright/test';
import {waitClickable} from "../utils/wait-сlickable";
import {waitForRecordNumberRequest} from "../utils/get-number-from-rqst";

export class AccountsPage {
    readonly page: Page;
    readonly addBtn: Locator;
    readonly stackMenu: Locator;
    readonly headerToolbar: Locator;
    readonly stackDialog: Locator;
    readonly addForm: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;
    readonly nameInput: Locator;
    readonly listNumberInput: Locator;
    readonly deleteDialog: Locator;


    constructor(page: Page) {
        this.page = page;
        this.addBtn = this.page.locator('[data-cy="btn-add"]');
        this.stackMenu = this.page.locator('[data-cy="stack-menu-list"]');
        this.headerToolbar = this.page.locator('[data-cy="stack-table-toolbar"]');
        this.stackDialog = this.page.locator('[data-cy="stack-dialog"]');
        this.addForm = this.stackDialog.locator('[data-cy="form"]');
        this.saveBtn = this.stackDialog.locator('[data-cy="btn-save"]');
        this.cancelBtn = this.stackDialog.locator('[data-cy="btn-cancel"]');
        this.nameInput = this.addForm.locator('[data-test-id="Название района"]');
        this.listNumberInput = this.addForm.locator('[data-test-id="Номер в списке"]');
        this.deleteDialog = this.page.locator('[data-test-id="stack-yes-no"]');
    }

    async open() {
        await this.page.goto('/fl/accounts');
        await expect(this.page.locator('[data-cy="stack-table-toolbar"]').getByText(/адреса проживающих/i)).toBeVisible();
    }

    async openForOpenDistrictForm() {
        await waitClickable(this.addBtn)
        await this.addBtn.click();
        await expect(this.stackMenu).toBeVisible();

        const districtItem = this.stackMenu.locator('[data-cy="stack-menu-list-item"]')
            .filter({ hasText: /^\s*Район\s*$/});

        await expect(districtItem).toBeVisible();
        await districtItem.click();
        await expect(this.stackDialog).toBeVisible();
        await expect(this.stackDialog.getByText(' Район (создание) ')).toBeVisible();
    }

    async addNewDistrict(districtName: string): Promise<number> {
        await this.openForOpenDistrictForm();

        await this.nameInput.fill(districtName);

        const [recordNumber] = await Promise.all([
            waitForRecordNumberRequest(this.page),
            this.saveBtn.click(),
        ]);
        await expect(this.stackDialog).toBeHidden();

        return recordNumber
    }

    async checkNoteInTable(recordNumber: number) {
        const row = this.foundRowByRecordNumber(recordNumber);

        await expect(row).toHaveCount(1);
        await expect(row).toBeVisible();
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

        await expect(this.stackDialog).toBeVisible();
        await expect(this.stackDialog.getByText(/Район\s*\(редактирование\)/i)).toBeVisible();

        await this.nameInput.fill(newName)
        await this.nameInput.press('Tab');
        await expect(this.saveBtn).toBeEnabled();
        await this.saveBtn.click();

        await expect(this.stackDialog).toBeHidden();

        const updatedRow = this.foundRowByRecordNumber(recordNumber);

        await this.checkNoteInTable(recordNumber)
        await expect(updatedRow.locator('[data-field="название"]')).toHaveText(newName);
    }

    async deleteDistrict(recordNumber: number){
        await this.checkNoteInTable(recordNumber);
        const row: Locator = this.foundRowByRecordNumber(recordNumber);
        await expect(row).toHaveCount(1);



        const cbInput = row.locator('input[data-cy="checkbox"]');
        await row.hover();

        await expect(cbInput).toBeVisible({ timeout: 5000 });

        const cbWrapper = cbInput.locator('..'); // один уровень вверх
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
