import {test, expect} from "@playwright/test";
import {LoginPage} from "../../pages/LoginPage";
import {AccountsPage} from "../../pages/AccountsPage";


test.describe('District CRUD @regression', () => {
    let recordNumber: number;
    let districtName: string;

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        const accountPage = new AccountsPage(page);

        await loginPage.open();
        await loginPage.waitForOpenForm();
        await loginPage.login(process.env.STACK_LOGIN!, process.env.STACK_PASSWORD!);

        districtName = `new-district-${Date.now()}`;

        await accountPage.open();
        recordNumber = await accountPage.addNewDistrict(districtName);
        await accountPage.checkNoteInTable(recordNumber);
    });

    test.afterEach(async ({ page }) => {
        // const accountPage = new AccountsPage(page);
        // await accountPage.open();
        // await accountPage.deleteDistrict(districtName);
    });

    test('edit district ', async ({ page }) => {
        const accountPage = new AccountsPage(page);

        const newName = `${districtName}-edited`;
        await accountPage.editDistrict(recordNumber, newName);
    });
});