import {test, expect} from "@playwright/test";
import {LoginPage} from "../../pages/LoginPage";
import {AccountsPage} from "../../pages/AccountsPage";


test.describe('add district @regression', () => {
    let recordNumber: number | null = null;

    test.beforeEach(async ({page}) => {
        const loginPage = new LoginPage(page);

        await loginPage.open();
        await loginPage.waitForOpenForm();
        await loginPage.login(process.env.STACK_LOGIN!, process.env.STACK_PASSWORD!);

    });

    test.afterEach(async ({ page }) => {
        if(recordNumber) {
            const accountPage = new AccountsPage(page);

            await accountPage.open();
            await accountPage.deleteDistrict(recordNumber);
            recordNumber = null;
        }
    });

    test ('add district @regression', async ({page}) => {
        const accountPage = new AccountsPage(page);
        const districtName: string = `new-district-${Date.now()}`;

        await accountPage.open();
        recordNumber = await accountPage.addNewDistrict(districtName);
        await accountPage.checkNoteInTable(recordNumber, districtName);
    });

    test ('add nameless district @regression @negative', async ({page}) => {
        const accountPage = new AccountsPage(page);

        await accountPage.open();
        await accountPage.openDistrictForm();
        await accountPage.stackDialog.nameInput.clear();
        await accountPage.stackDialog.saveBtn.click();

        await accountPage.stackDialog.expectVisible(/поле не может быть пустым/i);
    });
});