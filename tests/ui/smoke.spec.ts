import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AccountsPage } from '../../pages/AccountsPage';

test.describe('smoke tests @smoke', () => {

    test('login-dialog has open', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.open();
        await loginPage.waitForOpenForm();
    });

    test('accounts page opens', async ({page}) => {
        const loginPage = new LoginPage(page);
        const accountsPage = new AccountsPage(page);

        await loginPage.open();
        await loginPage.waitForOpenForm();
        await loginPage.login(process.env.STACK_LOGIN!, process.env.STACK_PASSWORD!);

        await accountsPage.open();
        await expect(accountsPage.headerToolbar).toBeVisible();
    });

    test('district add form opens', async ({page}) => {
        const loginPage = new LoginPage(page);
        const accountsPage = new AccountsPage(page);

        await loginPage.open();
        await loginPage.waitForOpenForm();
        await loginPage.login(process.env.STACK_LOGIN!, process.env.STACK_PASSWORD!);

        await accountsPage.open();

        await accountsPage.openDistrictForm();
        await accountsPage.stackDialog.expectVisible('Район (создание)');
    });
});