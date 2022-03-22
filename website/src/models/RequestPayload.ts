export type AddItemRequestItemType = 'food' | 'ingredient' | 'requestPayload';
export type AddItemRequestPayload<T> = {
    payloadType: AddItemRequestItemType;
    payloadBody: T[];
};
