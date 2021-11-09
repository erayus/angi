export enum NavPath {
    Menu = 'menu',
    ToBuyList = 'to-buy-list',
    FoodDetails = 'food-details',
    Settings = 'settings',
}

export type NavItem  = {
    path: string,
    headerTitle: string,
    navFooterIcon: string,
    showOnNavFooter: boolean,
}