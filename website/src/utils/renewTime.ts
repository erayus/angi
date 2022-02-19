export const generateRenewDate = (renewPeriod: number): number => {
    const renewDateObj = new Date();
    const renewDateTimestamp = renewDateObj.setDate(
        renewDateObj.getDate() + renewPeriod
    ); // set renewDate to the next 7 day;
    return renewDateTimestamp;
};

export const generateStringFormatDate = (timestamp: number): string => {
    const date: Date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-AU', options);
};

export const isTimeToRenewFood = (
    todayDateTimestamp: number,
    renewDateTimestamp: number | null
): boolean => {
    if (!renewDateTimestamp) {
        return true;
    }

    if (todayDateTimestamp > renewDateTimestamp) {
        return true;
    } else {
        return false;
    }
};
