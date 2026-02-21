import {test, expect} from "@playwright/test";
import {LoginPage} from "../../pages/LoginPage";
import {AccountsPage} from "../../pages/AccountsPage";


test.describe('add district @regression', () => {
    let recordNumber: number | null = null;

    test.beforeEach(async ({page}) => {
        const loginPage = new LoginPage(page);

        await test.step('Login to application', async () => {
            await loginPage.open();
            await loginPage.waitForOpenForm();
            await loginPage.login(process.env.STACK_LOGIN!, process.env.STACK_PASSWORD!);
        });
    });

    test.afterEach(async ({ page }) => {
        if(recordNumber) {
            const accountPage = new AccountsPage(page);

            await test.step(`Clean up: delete district with ID ${recordNumber}`, async () => {
                await accountPage.open();
                await accountPage.deleteDistrict(recordNumber!);
            });
            recordNumber = null;
        }
    });

    test ('add district @regression', async ({page}) => {
        const accountPage = new AccountsPage(page);
        const districtName: string = `new-district-${Date.now()}`;

        await test.step('Open accounts page', async () => {
            await accountPage.open();
        });

        await test.step(`Add new district: "${districtName}"`, async () => {
            recordNumber = await accountPage.addNewDistrict(districtName);
        });

        await test.step(`Verify district "${districtName}" in table`, async () => {
            await accountPage.checkNoteInTable(recordNumber!, districtName);
        });
    });

    test ('add nameless district @regression @negative', async ({page}) => {
        const accountPage = new AccountsPage(page);

        await test.step('Open accounts page', async () => {
            await accountPage.open();
        });

        await test.step('Open district form', async () => {
            await accountPage.openDistrictForm();
        });

        await test.step('Clear name input and try to save', async () => {
            await accountPage.stackDialog.nameInput.clear();
            await accountPage.stackDialog.saveBtn.click();
        });

        await test.step('Verify validation error is shown', async () => {
            await accountPage.stackDialog.expectVisible(/поле не может быть пустым/i);
        });
    });
});