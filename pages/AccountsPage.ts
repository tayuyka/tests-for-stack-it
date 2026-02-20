import { expect, Locator, Page } from '@playwright/test';
import {waitClickable} from "../utils/wait-сlickable";
import {waitForRecordNumberRequest} from "../utils/get-number-from-rqst";

export class AccountsPage {
    readonly page: Page;
    readonly addBtn: Locator;
    readonly stackMenu: Locator;
    readonly stackDialog: Locator;
    readonly addForm: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;
    readonly nameInput: Locator;


    constructor(page: Page) {
        this.page = page;
        this.addBtn = this.page.locator('[data-cy="btn-add"]');
        this.stackMenu = this.page.locator('[data-cy="stack-menu-list"]');
        this.stackDialog = this.page.locator('[data-cy="stack-dialog"]');
        this.addForm = this.stackDialog.locator('[data-cy="form"]');
        this.saveBtn = this.stackDialog.locator('[data-cy="btn-save"]');
        this.cancelBtn = this.stackDialog.locator('[data-cy="btn-cancel"]');
        this.nameInput = this.addForm.locator('[data-cy="stack-input"]').first();
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

    async checkNoteInTable(name: string) {
        const row = this.page.locator('tr', {
            has: this.page.locator('td[data-field="название"]', { hasText: name }),
        });

        await expect(row).toHaveCount(1);
        await expect(row).toBeVisible();
    }

}
