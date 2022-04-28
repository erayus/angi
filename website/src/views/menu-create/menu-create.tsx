import { Box, FormControl, FormLabel, Grid, Input, GridItem, Flex, Button } from '@chakra-ui/react';
import React from 'react'
import { useForm } from 'react-hook-form'
import { Redirect, useHistory } from 'react-router-dom'
import FoodAddOptionsModal from '../../components/food-add-options-modal/food-add-options-modal';
import FoodAdd from '../../components/food-add/food-add';
import useAddMenu from '../../hooks/menu/useAddMenu'
import useMenu from '../../hooks/menu/useMenu'
import { Food, IUserFoodCategoryQuantity } from '../../models/Food'
import { Menu } from '../../models/Menu';
import { useStore } from '../../store/root-store';
import { NavPath } from '../../utils/nav-path'
import { generateRenewDate } from '../../utils/renewTime';
import useUserFood from '../../hooks/food/useUserFood';

type Props = {}
type MenuCreationFormValues = {
    renewPeriod_: number
    food_: Food[],
    entreeQuantity_: number,
    mainQuantity_: number,
    soupQuantity_: number,
    dessertQuantity_: number,
}


const MenuCreate = (props: Props) => {
    const { foodStore } = useStore();
    const history = useHistory();
    const { register, handleSubmit, formState: { errors }, watch } = useForm<MenuCreationFormValues>()
    const { mutate } = useAddMenu();
    const { data: menu, isLoading: isLoadingMenu, error: errorLoadingMenu, } = useMenu();
    const { data: userFood, isLoading: isLoadingUserFood, error: errorLoadingUserFood, } = useUserFood();

    const onMenuCreationSubmitted = (data: MenuCreationFormValues) => {
        if (isLoadingUserFood) {
            throw new Error('Error Loading User Food');
        }
        const foodCategoryQuantities: IUserFoodCategoryQuantity[] = [
            {
                category: 'entree',
                quantity: data.entreeQuantity_,
            },
            {
                category: 'main',
                quantity: data.mainQuantity_,
            },
            {
                category: 'soup',
                quantity: data.soupQuantity_,
            },
            {
                category: 'dessert',
                quantity: data.dessertQuantity_,
            },
        ];
        const menu: Menu = {
            menuId: Math.round(Math.random() * 10000000000).toString(),
            foodCategoriesQuantity: foodCategoryQuantities,
            food: foodStore.generateMenuFood(userFood!, foodCategoryQuantities),
            renewPeriod: +data.renewPeriod_,
            renewDateTimestamp: generateRenewDate(+data.renewPeriod_),
            checkedIngredientIds: [],
        }
        mutate(menu);
    }

    const menuCreationForm = (
        <form onSubmit={handleSubmit(onMenuCreationSubmitted)}>
            <FormControl isRequired mt={3}>
                <FormLabel htmlFor='renew-period'>Renew Period</FormLabel>
                <Input type="number" id='renew-period' placeholder='Number of days your menu to be automatically renewed' {...register("renewPeriod_")} />
            </FormControl>

            <FormLabel mt={3}>Category Quantity</FormLabel>
            <FormControl as={Flex} alignItems="center" justifyContent="space-between" isRequired mt={3}>
                <Box flex={2}>Entree:</Box>
                <Input flex={2} type="number" id='entree-quantity' placeholder='1' {...register("entreeQuantity_")} />
            </FormControl>
            <FormControl as={Flex} alignItems="center" justifyContent="space-between" isRequired mt={3}>
                <Box flex={2}>Main:</Box>
                <Input flex={2} type="number" id='main-quantity' placeholder='1' {...register("mainQuantity_")} />
            </FormControl>
            <FormControl as={Flex} alignItems="center" justifyContent="space-between" isRequired mt={3}>
                <Box flex={2}>Soup:</Box>
                <Input flex={2} type="number" id='soup-quantity' placeholder='1' {...register("soupQuantity_")} />
            </FormControl>
            <FormControl as={Flex} alignItems="center" justifyContent="space-between" isRequired mt={3}>
                <Box flex={2}>Dessert:</Box>
                <Input flex={2} type="number" id='dessert-quantity' placeholder='1' {...register("dessertQuantity_")} />
            </FormControl>
            <Box mt={7}>
                <Button mt={2} isFullWidth onClick={() => history.goBack()}>Back</Button>
                <Button mt={2} colorScheme="green" isFullWidth type='submit'>Create Menu</Button>
            </Box>

        </form>
    )

    return (
        <Box p={3}>
            {
                menu &&
                <Redirect
                    to={{
                        pathname: `${NavPath.Menu}`,
                    }}
                />
            }
            {menuCreationForm}
        </Box>
    )
}

export default MenuCreate