export type AddItemRequestItemType =
    | 'food'
    | 'ingredient'
    | 'requestPayload'
    | 'menu';
export type AddItemRequestPayload<T> = {
    payloadType: AddItemRequestItemType;
    payloadBody: T[];
};
export type DeleteItemRequestPayload = {
    itemType: AddItemRequestItemType;
    itemIds: string[];
};
