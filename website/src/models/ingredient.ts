export type Ingredient = {
    id: string;
    ingredientName: string;
    category: string | IIngredientCategory;
    ingredientImgUrl?: string;
    ingredientDescription?: string;
    ingredientUnit?: string | IUnit;
};

export type IIngredientCategory =
    | 'Thịt'
    | 'Hải sản'
    | 'Rau cải'
    | 'Trái cây'
    | 'Hành'
    | 'Gia vị'
    | 'Củ'
    | 'Quả'
    | 'Nấm'
    | 'Rau'
    | 'Gạo'
    | '';
export type IUnit =
    | 'kg'
    | 'gram'
    | 'củ'
    | 'con'
    | 'lon'
    | 'trái'
    | 'bó'
    | 'gói'
    | 'bịch'
    | 'chai'
    | 'bông'
    | 'hộp'
    | '';
