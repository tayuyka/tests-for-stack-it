import {test, expect} from "@playwright/test";
import {LoginPage} from "../../pages/LoginPage";

test ('login @smoke', async ({page}) => {
    const loginPage = new LoginPage(page)
    await loginPage.open()

    await loginPage.waitForOpenForm()
    await loginPage.login(process.env.STACK_LOGIN!, process.env.STACK_PASSWORD!);
})
