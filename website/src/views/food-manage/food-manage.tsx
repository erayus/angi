import { Box, Button, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom';
import FoodList from '../../components/food-list/food-list.component';
import { Food } from '../../models/Food';
import { NavPath } from '../../utils/nav-path';
import axiosApi from '../../utils/axios-api';
import { useQuery } from 'react-query';
import { useStore } from '../../store/root-store';
import { FoodProjection } from '../../store/food-store';

type Props = {}

const FoodManage: React.FC<Props> = (props: Props) => {
    const history = useHistory();
    const [foodProjection, setFoodProjection] = useState<FoodProjection[]>([]);
    const { foodStore } = useStore();
    const { isLoading, error, data } = useQuery<Food[]>("food", async () => {
        const { data } = await axiosApi.Food.list();
        return data;
    }
    );

    useEffect(() => {
        if (!data) {
            return;
        }
        const foodProjection = data?.map(food => foodStore.convertFoodToFoodProjection(food));
        setFoodProjection(foodProjection);
    }, [data])

    const onFoodRemoveBtnClickedHandler = () => {

    }

    if (isLoading) return (<Heading>"Loading..."</Heading>);

    if (error) return (<Heading>An error has occurred: {(error as Error).message}</Heading>);

    return (
        <Box p={4}>
            <Button w="100%" onClick={() => history.push(`/${NavPath.FoodAdd}`)} >Add Food</Button>

            {foodProjection.length > 0 ? <FoodList
                foodList={foodProjection}
                enableViewDetails
                enableFoodRemove
                onFoodRemoveBtnClicked={onFoodRemoveBtnClickedHandler}
            /> : "No Food"}

        </Box>
    )
}

export default FoodManage