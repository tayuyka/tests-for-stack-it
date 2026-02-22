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

    test('edit district', async ({ page }) => {
        const accountPage = new AccountsPage(page);
        const newName = `${districtName}-edited`;

        await test.step(`Edit district "${districtName}" to "${newName}"`, async () => {
            await accountPage.editDistrict(recordNumber!, newName);
        });
    });

    test('check original data after cancelling edit', async ({ page }) => {
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

    test('save button should be disabled if no changes are made', async ({ page }) => {
        const accountPage = new AccountsPage(page);

        await accountPage.openEditDistrictForm(recordNumber!);

        await accountPage.stackDialog.expectSaveButtonState('disabled');

        await accountPage.stackDialog.simulateTabPress(2);

        await accountPage.stackDialog.expectSaveButtonState('disabled');

        await accountPage.stackDialog.cancelForm();
        await accountPage.stackDialog.expectHidden();
    });

    test('edit district with empty name @negative', async ({ page }) => {
        const accountPage = new AccountsPage(page);

        await test.step('Open edit form', async () => {
            await accountPage.openEditDistrictForm(recordNumber!);
        });

        await test.step('Clear name field', async () => {
            await accountPage.stackDialog.nameInput.clear();
        });

        await test.step('Verify validation error is shown', async () => {
            await accountPage.stackDialog.expectVisible(/поле не может быть пустым/i);
        });

        await test.step('Cancel and verify data unchanged', async () => {
            await accountPage.stackDialog.cancelForm();
            await accountPage.checkNoteInTable(recordNumber!, districtName);
        });
    });

    test('edit district with empty list number @negative', async ({ page }) => {
        const accountPage = new AccountsPage(page);

        await test.step('Open edit form', async () => {
            await accountPage.openEditDistrictForm(recordNumber!);
        });

        await test.step('Clear list number field and try to save', async () => {
            await accountPage.stackDialog.listNumberInput.clear();
        });

        await test.step('Verify validation error for empty list number', async () => {
            await accountPage.stackDialog.expectVisible(/поле не может быть пустым/i);
        });

        await test.step('Cancel edit', async () => {
            await accountPage.stackDialog.cancelForm();
        });
    });

    test('list number field should not accept non-numeric characters on edit @negative', async ({ page }) => {
        const accountPage = new AccountsPage(page);

        await test.step('Open edit form', async () => {
            await accountPage.openEditDistrictForm(recordNumber!);
        });

        await test.step('Try to input letters in list number field', async () => {
            const originalValue = await accountPage.stackDialog.getListNumberValue();
            await accountPage.stackDialog.listNumberInput.fill('abc');
            const value = await accountPage.stackDialog.getListNumberValue();
            expect(value).toBe('');
        });

        await test.step('Try to input special characters in list number field', async () => {
            await accountPage.stackDialog.listNumberInput.fill('!@#$%^&*()');
            const value = await accountPage.stackDialog.getListNumberValue();
            expect(value).toBe('');
        });

        await test.step('Try to input mixed alphanumeric', async () => {
            await accountPage.stackDialog.listNumberInput.fill('12abc34');
            const value = await accountPage.stackDialog.getListNumberValue();
            expect(value).toMatch(/^\d*$/);
        });

        await test.step('Cancel edit', async () => {
            await accountPage.stackDialog.cancelForm();
        });
    });

    test('verify save button disabled when clearing required fields @negative', async ({ page }) => {
        const accountPage = new AccountsPage(page);

        await test.step('Open edit form', async () => {
            await accountPage.openEditDistrictForm(recordNumber!);
        });

        await test.step('Clear name field', async () => {
            await accountPage.stackDialog.nameInput.clear();
            await accountPage.stackDialog.nameInput.blur();
        });

        await test.step('Verify save button state', async () => {
            const saveButtonEnabled = await accountPage.stackDialog.saveBtn.isEnabled();
            if (saveButtonEnabled) {
                await accountPage.stackDialog.saveBtn.click();
                await accountPage.stackDialog.expectVisible(/поле не может быть пустым/i);
            } else {
                await accountPage.stackDialog.expectSaveButtonState('disabled');
            }
        });

        await test.step('Cancel edit', async () => {
            await accountPage.stackDialog.cancelForm();
        });
    });
});