import {test, expect} from "@playwright/test";
import {LoginPage} from "../../pages/LoginPage";
import {AccountsPage} from "../../pages/AccountsPage";

test ('District CRUD @e2e @regression @critical', async ({page}) => {
    let recordNumber: number;
    const districtName: string = `new-district-${Date.now()}`;

    const loginPage = new LoginPage(page);
    const accountPage = new AccountsPage(page);

    await loginPage.open();
    await loginPage.waitForOpenForm();
    await loginPage.login(process.env.STACK_LOGIN!, process.env.STACK_PASSWORD!);

    await accountPage.open();
    recordNumber = await accountPage.addNewDistrict(districtName);
    await accountPage.checkNoteInTable(recordNumber);

    const newName = `${districtName}-edited`;
    await accountPage.editDistrict(recordNumber, newName);

    await accountPage.deleteDistrict(recordNumber);
});