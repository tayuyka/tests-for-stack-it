import { expect, Locator } from '@playwright/test';

export async function waitClickable(target: Locator, timeout = 15000) {
    await expect(target).toBeVisible({ timeout });
    await expect(target).toBeEnabled({ timeout });
    await expect.poll(async () => {
        try {
            await target.click({ trial: true, timeout: 1000 });
            return true;
        } catch {
            return false;
        }
    }, { timeout }).toBe(true);
}
