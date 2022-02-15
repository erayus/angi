export const getRenewDate = (renewPeriod: number): string => {
    const renewDateObj = new Date();
    renewDateObj.setDate(renewDateObj.getDate() + renewPeriod); // set renewDate to the next 7 day;
    return generateStringFormatDate(renewDateObj);
};

const generateStringFormatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-AU', options);
};

export const isTimeToRenewFood = (
    todayDate: string,
    renewDate: string | null
): boolean => {
    if (!renewDate) {
        return true;
    }

    if (!Date.parse(todayDate) || !Date.parse(renewDate)) {
        throw new Error('Invalid todayDate or renewDate ');
    }

    const today = new Date(todayDate);
    const renewDateObj = new Date(renewDate);
    if (today > renewDateObj) {
        return true;
    } else {
        return false;
    }
};
