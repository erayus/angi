import {Category, IFood } from '../models/food';

export const FoodDirectory: IFood[] = [
      {
        id: 1,
        name: 'Braised Pork with Shrimp paste',
        category: Category.Main,
        imgUrl: '',
        ingredients: [
          {
            name: 'Pork belly',
            quantity: 500,
            unit: 'gram'
          },
          {
            name: 'Shallot',
            quantity: 500,
            unit: 'gram'
          },
          {
            name: 'Shrimp paste',
            quantity: 500,
            unit: 'lon'
          }
        ]
      },
      {
        id: 2, 
        name: 'BBQ Pork',
        category: Category.Main,
        imgUrl: '',
        ingredients: [ 
          {
            name: 'Pork belly',
            quantity: 500,
            unit: 'gram'
          },
        ] 
      }, 
      {
        id: 3, 
        name: 'Braised Pork with Pineapple',
        category: Category.Main,
        imgUrl: '',
        ingredients: [ {
          name: 'Pine Apple',
          quantity: 1,
          unit: 'trai'
        }
      ],
      },
      {
        id: 4, 
        name: 'Kho quet',
        category: Category.Main,
        imgUrl: '',
        ingredients: [{
          name: 'Pork belly',
          quantity: 500,
          unit: 'gram'
        },],
      },
      {
        id: 5, 
        name: 'Pork and Egg steamed cake/loafnnn',
        category: Category.Main,
        imgUrl: '',
        ingredients: [
          {
            name: 'Mince Pork',
            quantity: 500,
            unit: 'gram'
          }
        ],
      },
      {
        id: 6, 
        name: 'Canh bí đỏ tôm',
        category: Category.Soup,
        imgUrl: '',
        ingredients: [
          {
            name: 'Tôm',
            quantity: 800,
            unit: 'gram'
          },
          {
            name: 'Bí đỏ',
            quantity: 1,
            unit: 'trai'
          }
        ],
      },
      {
        id: 7, 
        name: 'Canh mồng tơ cua đồng',
        category: Category.Soup,
        imgUrl: '',
        ingredients: [ 
          {
          name: 'Mong toi',
          quantity: 1,
          unit: 'bo'
          }
        ],
      },
      {
        id: 8, 
        name: 'Canh brocoli thịt viên',
        category: Category.Soup,
        imgUrl: '',
        ingredients: [ {
          name: 'Brocoli',
          quantity: 1,
          unit: 'cu'
        }],
      },
      {
        id: 9, 
        name: 'Canh cải thảo',
        category: Category.Soup,
        imgUrl: '',
        ingredients: [ {
          name: 'Cai thao',
          quantity: 1,
          unit: 'bo'
        }],
      },
      {
        id: 10, 
        name: 'Snack',
        category: Category.Dessert,
        imgUrl: '',
        ingredients: [
          {
            name: 'Bim bim',
            quantity: 1,
            unit: 'goi'
          }
        ],
      },
      {
        id: 11, 
        name: 'Snack 2',
        category: Category.Dessert,
        imgUrl: '',
        ingredients: [
          {
            name: 'Bim bim 2',
            quantity: 1,
            unit: 'goi'
          }
        ],
      },
      {
        id: 12, 
        name: 'Snack 3',
        category: Category.Dessert,
        imgUrl: '',
        ingredients: [
          {
            name: 'Bim bim 3',
            quantity: 1,
            unit: 'goi'
          }
        ],
      },
      // {
      //   id: 13, 
      //   name: 'Snack 4',
      //   category: Category.Dessert,
      //   imgUrl: '',
      //   ingredients: ['bim bim 4'],
      // },
      // {
      //   id: 14, 
      //   name: 'Snack 5',
      //   category: Category.Dessert,
      //   imgUrl: '',
      //   ingredients: ['bim bim 5'],
      // },
      // {
      //   id: 15, 
      //   name: 'Snack 6',
      //   category: Category.Dessert,
      //   imgUrl: '',
      //   ingredients: ['bim bim 6'],
      // },
]