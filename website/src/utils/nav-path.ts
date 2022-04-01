export enum NavPath {
    Menu = 'menu',
    ToBuyList = 'to-buy-list',
    FoodDetails = 'food-details',
    Settings = 'settings',
    FoodManage = 'food-manage',
    FoodAdd = 'food-manage/food-add',
    SignUp = 'signup',
    Login = 'login',
    MenuCreate = 'menu-create',
}

export type NavItem = {
    path: string;
    headerTitle: string;
    navFooterIcon: string;
    showOnNavFooter: boolean;
};
