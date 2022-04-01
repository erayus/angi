import { useQuery } from 'react-query';

import axiosApi from '../../utils/axios-api';

const getMenu = async () => {
    const { data } = await axiosApi.Menu.get();
    return data[0];
};

const useMenu = () => {
    return useQuery('menu', getMenu);
};

export default useMenu;
