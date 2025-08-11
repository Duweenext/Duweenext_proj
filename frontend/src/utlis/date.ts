// utils/formatDate.ts
export function formatDisplayDate(
    isoString: string,
    locale?: string,
    withTime: boolean = false
): string {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return isoString;  // fallback on invalid input
    }

    // Base options: year/month/day
    const baseOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    };

    if (withTime) {
        const dateTimeOptions: Intl.DateTimeFormatOptions = {
            ...baseOptions,
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,  
            timeZone: 'UTC',         
        };
        return date.toLocaleString(locale || undefined, dateTimeOptions);
    } else {
        return date.toLocaleDateString(locale || undefined, baseOptions);
    }
}

export function DateDisplayOnCard(isoString: string,
    locale?: string,) {
    return formatDisplayDate(isoString, locale, true).split('at')[0] +
        formatDisplayDate(isoString, locale, true).split('at')[1]
        ;
}
