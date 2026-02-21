import {test, expect} from "@playwright/test";
import {LoginPage} from "../../pages/LoginPage";
import {AccountsPage} from "../../pages/AccountsPage";

test ('District CRUD @e2e @regression @critical', async ({page}) => {
    let recordNumber: number;
    const districtName: string = `new-district-${Date.now()}`;

    const loginPage = new LoginPage(page);
    const accountPage = new AccountsPage(page);

    await test.step('Login to application', async () => {
        await loginPage.open();
        await loginPage.waitForOpenForm();
        await loginPage.login(process.env.STACK_LOGIN!, process.env.STACK_PASSWORD!);
    });

    await test.step(`Create district: "${districtName}"`, async () => {
        await accountPage.open();
        recordNumber = await accountPage.addNewDistrict(districtName);
        await accountPage.checkNoteInTable(recordNumber);
    });

    await test.step(`Edit district to: "${districtName}-edited"`, async () => {
        const newName = `${districtName}-edited`;
        await accountPage.editDistrict(recordNumber, newName);
    });

    await test.step(`Delete district with ID: ${recordNumber!}`, async () => {
        await accountPage.deleteDistrict(recordNumber);
    });
});