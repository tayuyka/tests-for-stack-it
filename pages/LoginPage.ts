import { expect, Locator, Page } from '@playwright/test';
import {waitClickable} from "../utils/wait-clickable";

export class LoginPage {
    readonly page: Page;
    readonly dialog: Locator;
    readonly loginInput: Locator;
    readonly passwordInput: Locator;
    readonly submitBtn: Locator;
    readonly confirmLogin: Locator;

    constructor(page: Page) {
        this.page = page;

        this.dialog = page.locator('[role="dialog"][aria-modal="true"]').filter({
            has: page.getByText('Вход', { exact: true }),
        });

        this.loginInput = this.dialog
            .getByLabel(/Логин/i)
            .or(this.dialog.getByPlaceholder(/логин/i))
            .or(this.dialog.locator('input').nth(0));

        this.passwordInput = this.dialog
            .getByLabel(/Пароль/i)
            .or(this.dialog.locator('input[type="password"]'));

        this.submitBtn = this.dialog.getByRole('button', { name: /войти/i });

        this.confirmLogin = page.locator('[data-test-id="stack-yes-no"]')
    }

    async open() {
        await this.page.goto('/fl/');
    }

    async waitForOpenForm() {
        await expect(this.dialog).toBeVisible();
    }

    async login(username: string, password: string) {
        await this.waitForOpenForm();
        await this.loginInput.fill(username);
        await this.passwordInput.fill(password);
        await this.submitBtn.click();

        const yesBtn = this.confirmLogin.locator('[data-cy="btn-yes"]');
        try {
            await yesBtn.waitFor({ state: 'visible', timeout: 15000 });
            await yesBtn.click();
        } catch {}

        const userMenu: Locator = this.page.locator('[data-cy="user-menu"]')
        await waitClickable(userMenu);
        await expect(userMenu).toBeVisible();

        await userMenu.click();
        await expect(this.page.getByText("Администратор")).toBeVisible();
    }
}
