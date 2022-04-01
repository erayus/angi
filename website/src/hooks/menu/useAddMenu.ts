import { QueryClient, useMutation } from 'react-query';
import { Menu } from '../../models/Menu';
import { AddItemRequestPayload } from '../../models/RequestPayload';
import axiosApi from '../../utils/axios-api';

const queryClient = new QueryClient();

const useAddMenu = () => {
    return useMutation(
        async (menu: Menu) => {
            const data: AddItemRequestPayload<Menu> = {
                payloadType: 'menu',
                payloadBody: [menu],
            };

            await axiosApi.Menu.add(data).then((res) => {
                return res.data;
            });
        },
        {
            onMutate: (addingMenu: Menu) => {
                queryClient.setQueryData('menu', addingMenu);

                return () => queryClient.setQueryData('menu', addingMenu);
            },

            onError: (error, addingMenu, rollback) => {
                console.error(error);
            },

            onSettled: (data, error, addingMenu) => {
                queryClient.removeQueries(['menu', addingMenu]);
                queryClient.refetchQueries('menu');
            },
        }
    );
};

export default useAddMenu;
