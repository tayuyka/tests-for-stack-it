import { expect, Locator } from '@playwright/test';

export async function waitClickable(
    target: Locator,
    timeout = 45_000,
    trialTimeout = 5_000
) {
    await expect(target).toBeVisible({ timeout });
    await expect(target).toBeEnabled({ timeout });

    await expect
        .poll(
            async () => {
                try {
                    await target.click({ trial: true, timeout: trialTimeout });
                    return true;
                } catch {
                    return false;
                }
            },
            { timeout, intervals: [200, 500, 1000] }
        )
        .toBe(true);
}