import { useQuery } from 'react-query';
import { Food } from '../../models/Food';

import axiosApi from '../../utils/axios-api';

const getUserFood = async () => {
    const { data } = await axiosApi.Food.list();
    return data;
};

const useUserFood = () => {
    return useQuery<Food[]>('userFood', getUserFood);
};

export default useUserFood;
