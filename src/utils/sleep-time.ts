type TimeRange = [string, string];
type Scheduler = Record<number, TimeRange>;

const scheduler: Scheduler = {
    1: ['09:30', '16:00'],
    2: ['09:30', '16:00'],
    3: ['09:30', '16:00'],
    4: ['09:30', '16:00'],
    5: ['09:30', '16:00'],
};

export function getSleepSeconds(timeZone: string): number {
    const now = new Date();

    let chileOffset: number;

    switch (timeZone) {
        case 'GMT-3':
            chileOffset = -3;
            break;
        case 'GMT-4':
            chileOffset = -4;
            break;
        default:
            throw new Error('Unsupported timezone');
    }

    // Calculate Chile time in UTC
    const chileTime = new Date(now.getTime() + chileOffset * 60 * 60 * 1000);

    // Get day of week (1=Monday, ..., 5=Friday, 6=Saturday, 7=Sunday)
    let day = chileTime.getUTCDay();
    if (day === 0) day = 7; // Sunday as 7

    // Only consider Monday to Friday (1-5)
    if (day < 1 || day > 5) {
        // Find next Monday
        const daysUntilMonday = (8 - day) % 7;
        const nextMonday = new Date(chileTime);
        nextMonday.setUTCDate(chileTime.getUTCDate() + daysUntilMonday);
        nextMonday.setUTCHours(9, 30, 0, 0);
        return (nextMonday.getTime() - chileTime.getTime()) / 1000;
    }

    const [startStr, endStr] = scheduler[day] || ['09:30', '16:00'];
    const [shRaw, smRaw] = startStr.split(':');
    const [ehRaw, emRaw] = endStr.split(':');
    const sh = Number(shRaw) || 9;
    const sm = Number(smRaw) || 30;
    const eh = Number(ehRaw) || 16;
    const em = Number(emRaw) || 0;

    const start = new Date(chileTime);
    start.setUTCHours(sh, sm, 0, 0);

    const end = new Date(chileTime);
    end.setUTCHours(eh, em, 0, 0);

    if (chileTime >= start && chileTime <= end) {
        return 0;
    } else if (chileTime < start) {
        return (start.getTime() - chileTime.getTime()) / 1000;
    } else {
        // After end, find next valid start (could be next weekday)
        let nextDay = day + 1;
        let daysToAdd = 1;
        while (nextDay < 1 || nextDay > 5) {
            nextDay = (nextDay % 7) + 1;
            daysToAdd++;
        }
        const [nextStartStr] = scheduler[nextDay] || ['09:30', '16:00'];
        const [nshRaw, nsmRaw] = nextStartStr.split(':');
        const nsh = Number(nshRaw) || 9;
        const nsm = Number(nsmRaw) || 30;

        const nextStart = new Date(chileTime);
        nextStart.setUTCDate(chileTime.getUTCDate() + daysToAdd);
        nextStart.setUTCHours(nsh, nsm, 0, 0);

        return (nextStart.getTime() - chileTime.getTime()) / 1000;
    }
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
