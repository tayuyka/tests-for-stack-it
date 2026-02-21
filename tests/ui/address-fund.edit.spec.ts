import {test, expect} from "@playwright/test";
import {LoginPage} from "../../pages/LoginPage";
import {AccountsPage} from "../../pages/AccountsPage";


test.describe('edit district @regression', () => {
    let recordNumber: number | null = null;
    let districtName: string;

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        const accountPage = new AccountsPage(page);

        await test.step('Login to application', async () => {
            await loginPage.open();
            await loginPage.waitForOpenForm();
            await loginPage.login(process.env.STACK_LOGIN!, process.env.STACK_PASSWORD!);
        });

        districtName = `new-district-${Date.now()}`;

        await test.step(`Create test district: "${districtName}"`, async () => {
            await accountPage.open();
            recordNumber = await accountPage.addNewDistrict(districtName);
            await accountPage.checkNoteInTable(recordNumber, districtName);
        });
    });

    test.afterEach(async ({ page }) => {
        if(recordNumber) {
            const accountPage = new AccountsPage(page);

            await accountPage.open();
            await accountPage.deleteDistrict(recordNumber);
            recordNumber = null;
        }
    });

    test('edit district @regression', async ({ page }) => {
        const accountPage = new AccountsPage(page);
        const newName = `${districtName}-edited`;

        await test.step(`Edit district "${districtName}" to "${newName}"`, async () => {
            await accountPage.editDistrict(recordNumber!, newName);
        });
    });

    test('check original data after cancelling edit @regression', async ({ page }) => {
        const accountPage = new AccountsPage(page);

        await test.step('Open edit form for district', async () => {
            const nameInputLocator = await accountPage.openEditDistrictForm(recordNumber!);
            const currentNameInForm = await nameInputLocator.inputValue();
            expect(currentNameInForm).toBe(districtName);
        });

        await test.step('Cancel edit without changes', async () => {
            await accountPage.stackDialog.cancelForm();
            await accountPage.stackDialog.expectHidden();
        });

        await test.step('Verify district data remains unchanged', async () => {
            await accountPage.checkNoteInTable(recordNumber!, districtName);
        });
    });

    test('save button should be disabled if no changes are made @regression', async ({ page }) => {
        const accountPage = new AccountsPage(page);

        await accountPage.openEditDistrictForm(recordNumber!);

        await accountPage.stackDialog.expectSaveButtonState('disabled');

        await accountPage.stackDialog.simulateTabPress(2);

        await accountPage.stackDialog.expectSaveButtonState('disabled');

        await accountPage.stackDialog.cancelForm();
        await accountPage.stackDialog.expectHidden();
    });
});