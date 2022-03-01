export type RequestItemType = 'food' | 'ingredient' | 'requestPayload';
export type RequestPayload = {
    payloadType: RequestItemType;
    payloadBody: any | any[];
};
