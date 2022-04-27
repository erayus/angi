import { Box, Button, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom';
import FoodList from '../../components/food-list/food-list.component';
import { Food } from '../../models/Food';
import { NavPath } from '../../utils/nav-path';
import axiosApi from '../../utils/axios-api';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useStore } from '../../store/root-store';
import { FoodProjection } from '../../store/food-store';
import { DeleteItemRequestPayload } from '../../models/RequestPayload';

type Props = {}

const FoodManage: React.FC<Props> = (props: Props) => {
    const history = useHistory();
    const queryClient = useQueryClient();
    const [foodProjection, setFoodProjection] = useState<FoodProjection[]>([]);
    const { foodStore } = useStore();
    const { isLoading, error, data: allFood } = useQuery<Food[]>("userFood", async () => {
        const { data } = await axiosApi.Food.list();
        return data;
    }
    );
    const deleteFunc = useMutation(
        async (id: string) => {
            const data: DeleteItemRequestPayload = {
                itemType: 'food',
                itemIds: [id]
            };

            await axiosApi
                .Food.delete(data)
                .then(res => {
                    return res.data;
                });
        },
        {
            onMutate: removingFoodId => {
                const currentUserFood: Food[] | undefined = queryClient.getQueryData("userFood");
                if (!currentUserFood) {
                    return;
                }

                const updatedUserFood = currentUserFood.filter(
                    eachValue => eachValue.id !== removingFoodId
                );

                queryClient.setQueryData("userFood", updatedUserFood);

                return () => queryClient.setQueryData("userFood", currentUserFood);
            },

            onError: (error, removingFoodId, rollback) => {
                console.error(error);
            },

            onSettled: (data, error, removingFood) => {
                queryClient.removeQueries(["userFood", removingFood]);
                queryClient.refetchQueries("userFood");
            }
        }
    )

    useEffect(() => {
        if (!allFood) {
            return;
        }
        const foodProjection = allFood?.map(food => foodStore.convertFoodToFoodProjection(food));
        setFoodProjection(foodProjection);
    }, [allFood])

    const onFoodRemoveBtnClickedHandler = (foodId: string) => {
        deleteFunc.mutate(foodId);
    }

    if (isLoading) return (<Heading>"Loading..."</Heading>);

    if (error) return (<Heading>An error has occurred: {(error as Error).message}</Heading>);

    return (
        <Box p={4}>
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