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
    readonly paginationFooter: Locator;
    readonly currentPageInput: Locator;
    readonly nextPageButton: Locator;
    readonly prevPageButton: Locator;
    readonly recordsOnPageSelector: Locator;
    readonly pagination: Locator;
    readonly recordsRangeText: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addBtn = this.page.locator('[data-cy="btn-add"]');
        this.stackMenu = this.page.locator('[data-cy="stack-menu-list"]');
        this.headerToolbar = this.page.locator('[data-cy="stack-table-toolbar"]');
        this.deleteDialog = this.page.locator('[data-test-id="stack-yes-no"]');
        this.stackDialog = new StackDialog(page);
        this.paginationFooter = this.page.locator('.stack-table-footer');
        this.pagination = this.paginationFooter.locator('.custom-pagination');
        this.currentPageInput = this.paginationFooter.locator('.page-input');
        this.prevPageButton = this.pagination.locator('button').first();
        this.nextPageButton = this.pagination.locator('button').nth(1);
        this.recordsOnPageSelector = this.paginationFooter.locator('.v-select__selection');
        this.recordsRangeText = this.paginationFooter.getByText(/Записей/i);
    }

    async getCurrentPageNumber(): Promise<number> {
        if (await this.currentPageInput.count() === 0) return 1;
        await expect(this.currentPageInput).toBeVisible({ timeout: 15000 });

        const value = await this.currentPageInput.inputValue();
        const n = parseInt(value, 10);
        return Number.isFinite(n) ? n : 1;
    }

    async getTotalPagesNumber(): Promise<number> {
        if (await this.pagination.count() === 0) return 1;
        await expect(this.pagination).toBeVisible({ timeout: 15000 });

        const text = (await this.pagination.textContent()) ?? '';
        const m = text.match(/из\s*(\d+)/i);
        return m ? parseInt(m[1], 10) : 1;
    }

    async goToPage(pageNumber: number) {
        const prevRange = (await this.recordsRangeText.textContent()) ?? '';

        await this.currentPageInput.fill(String(pageNumber));
        await this.currentPageInput.press('Enter');

        await expect(this.currentPageInput).toHaveValue(String(pageNumber), { timeout: 15000 });

        await expect(this.recordsRangeText).not.toHaveText(prevRange, { timeout: 15000 });
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
        const row = await this.foundRowByRecordNumber(recordNumber);

        await expect(row).toHaveCount(1);
        await expect(row).toBeVisible();

        if (expectedName) {
            await expect(row.locator('[data-field="название"]')).toHaveText(expectedName);
        }
    }

    async foundRowByRecordNumber(recordNumber: number): Promise<Locator> {
        const id = String(recordNumber).trim();
        const rowSelector = `tr[id="${id}"]`;

        const rowHere = this.page.locator(rowSelector);
        if (await rowHere.count() > 0) return rowHere;

        const current = await this.getCurrentPageNumber();
        const total = await this.getTotalPagesNumber();

        const pages: number[] = [];
        for (let p = current + 1; p <= total; p++) pages.push(p);
        for (let p = 1; p < current; p++) pages.push(p);

        for (const p of pages) {
            await this.goToPage(p);
            const row = this.page.locator(rowSelector);
            if (await row.count() > 0) return row;
        }

        return this.page.locator(rowSelector);
    }

    async editDistrict(recordNumber: number, newName: string) {
        await this.checkNoteInTable(recordNumber);
        const row: Locator = await this.foundRowByRecordNumber(recordNumber);

        const editNoteBtn: Locator = row.locator('[data-cy="btn-edit"]');
        await row.hover();

        await expect(editNoteBtn).toBeVisible({ timeout: 5000 });
        await editNoteBtn.click();

        await this.stackDialog.expectVisible(/Район\s*\(редактирование\)/i);

        await this.stackDialog.nameInput.fill(newName);
        await this.stackDialog.nameInput.press('Tab');
        await expect(this.stackDialog.saveBtn).toBeEnabled();
        await this.stackDialog.saveForm();
        await this.checkNoteInTable(recordNumber, newName);
    }

    async openEditDistrictForm(recordNumber: number): Promise<Locator> {
        const row: Locator = await this.foundRowByRecordNumber(recordNumber);
        const editNoteBtn: Locator = row.locator('[data-cy="btn-edit"]');
        await row.hover();
        await expect(editNoteBtn).toBeVisible({ timeout: 5000 });
        await editNoteBtn.click();
        await this.stackDialog.expectVisible(/Район\s*\(редактирование\)/i);
        return this.stackDialog.nameInput;
    }

    async deleteDistrict(recordNumber: number){
        await this.checkNoteInTable(recordNumber);
        const row: Locator = await this.foundRowByRecordNumber(recordNumber);
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
