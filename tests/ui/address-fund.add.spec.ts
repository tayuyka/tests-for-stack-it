import {test, expect} from "@playwright/test";
import {LoginPage} from "../../pages/LoginPage";
import {AccountsPage} from "../../pages/AccountsPage";


test ('add district @regression', async ({page}) => {
    const loginPage = new LoginPage(page)
    const accountPage = new AccountsPage(page)
    await loginPage.open()

    await loginPage.waitForOpenForm()
    await loginPage.login(process.env.STACK_LOGIN!, process.env.STACK_PASSWORD!);

    const districtName: string = `new-district-${Date.now()}`;

    await accountPage.open()
    await accountPage.addNewDistrict(districtName)
    await accountPage.checkNoteInTable(districtName)
});