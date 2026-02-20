import {Page} from "@playwright/test";

export async function waitForRecordNumberRequest(page: Page, timeout = 15000): Promise<number> {
    const req = await page.waitForRequest((r) => {
        if (r.method() !== 'POST') return false;

        const url = r.url();
        if (!url.includes('/fl/')) return false;

        const data = r.postData();
        if (!data) return false;

        if (!data.includes('номерЗаписи')) return false;

        try {
            const json = JSON.parse(data);

            const tasks = json?.tasks;
            if (!Array.isArray(tasks)) return false;

            return tasks.some((t: any) =>
                t?.params?.номерЗаписи != null &&
                t?.objectName === 'ЛицевыеСчета' &&
                t?.methodName === 'получитьПапкуЗаписи'
            );
        } catch {
            return false;
        }
    }, { timeout });

    const body = req.postData()!;
    const json = JSON.parse(body);
    const task = json.tasks.find((t: any) =>
        t?.params?.номерЗаписи != null &&
        t?.objectName === 'ЛицевыеСчета' &&
        t?.methodName === 'получитьПапкуЗаписи'
    );

    return Number(task.params.номерЗаписи);
}