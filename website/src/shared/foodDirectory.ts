import { FoodCategory, IFood } from '../models/food';

export const FoodDirectory: IFood[] = [
      {
        id: 1,
        name: 'Braised Pork with Shrimp paste',
        category: FoodCategory.Main,
        imgUrl: '',
        ingredients: ['Pork belly', 'Shallot', 'Spring onions', 'Garlic', 'Chilli', 'Shrimp paste', 'Lemongrass'],
      },
      {
        id: 2, 
        name: 'BBQ Pork',
        category: FoodCategory.Main,
        imgUrl: '',
        ingredients: ['Pork belly'],
      }, 
      {
        id: 3, 
        name: 'Braised Pork with Pineapple',
        category: FoodCategory.Main,
        imgUrl: '',
        ingredients: ['Pork belly', 'Pineapple', 'Shallot', 'Garlic'],
      },
      {
        id: 4, 
        name: 'Kho quet',
        category: FoodCategory.Main,
        imgUrl: '',
        ingredients: ['Pork belly', 'Shallot', 'Garlic'],
      },
      {
        id: 5, 
        name: 'Pork and Egg steamed cake/loafnnn',
        category: FoodCategory.Main,
        imgUrl: '',
        ingredients: ['Mince pork', 'Eggs', 'Mushroom', 'Onion'],
      },
      {
        id: 6, 
        name: 'Canh bí đỏ tôm',
        category: FoodCategory.Soup,
        imgUrl: '',
        ingredients: ['Tôm', 'Bí đỏ'],
      },
      {
        id: 7, 
        name: 'Canh mồng tơ cua đồng',
        category: FoodCategory.Soup,
        imgUrl: '',
        ingredients: ['Mồng tơi', 'Cua đồng'],
      },
      {
        id: 8, 
        name: 'Canh brocoli thịt viên',
        category: FoodCategory.Soup,
        imgUrl: '',
        ingredients: ['Brocoli', 'Thit vien'],
      },
]