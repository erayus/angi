import { Box, FormControl, FormLabel, Grid, Input, GridItem, Flex } from '@chakra-ui/react';
import React from 'react'
import { useForm } from 'react-hook-form'
import { Redirect } from 'react-router-dom'
import FoodAdd from '../../components/food-add/food-add';
import useAddMenu from '../../hooks/menu/useAddMenu'
import useMenu from '../../hooks/menu/useMenu'
import { Food, IUserFoodCategoryQuantity } from '../../models/Food'
import { NavPath } from '../../utils/nav-path'
import FoodManage from '../food-manage/food-manage';

type Props = {}
type MenuCreationFormValues = {
    renewPeriod_: number
    food_: Food[],
    entreeQuantity_: number,
    mainQuantity_: number,
    soupQuantity_: number,
    dessertQuantity_: number,
}

const categoryQuantitiesFormData:any = {
    entree: {
        label: 'Entree',
        inputId: 'entree-quantity',
        formValue: 'entreeQuantity_'
    },
    main: {
        label: 'Main',
        inputId: 'main-quantity',
        formValue: 'mainQuantity_'
    },
    soup: {
        label: 'Soup',
        inputId: 'soup-quantity',
        formValue: 'soupQuantity_'
    },
    dessert: {
        label: 'Dessert',
        inputId: 'dessert-quantity',
        formValue: 'dessertQuantity_'
    },
}

const MenuCreate = (props: Props) => {
    const { register, handleSubmit, getValues, setValue, formState: { errors }, watch } = useForm<MenuCreationFormValues>()
    const { mutate } = useAddMenu();
    const { data: menu, error: errorLoadingMenu, isLoading: isLoadingMenu } = useMenu();

    const onMenuCreationSubmitted = () => {

    }

    const menuCreationForm = (
        <form onSubmit={handleSubmit(onMenuCreationSubmitted)}>
            <FormControl isRequired mt={3}>
                <FormLabel htmlFor='renew-period'>Renew Period</FormLabel>
                <Input type="number" id='renew-period' placeholder='Renew Period' {...register("renewPeriod_")} />
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

            <FormLabel mt={3}>Food In Storage:</FormLabel>
            <FoodManage/>
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