import axios, { CancelTokenSource } from 'axios';
import config from '../config';
import { ApiPath } from '../models/api-path';
import { AddItemRequestPayload } from '../models/RequestPayload';
import { Food as FoodType } from '../models/Food';
import { Ingredient as IngredientType } from '../models/Ingredient';

axios.defaults.baseURL = config.getApiBaseUrl();

class AxiosApi {
    private static cancelToken: CancelTokenSource = axios.CancelToken.source();
    private static apiConfig = { cancelToken: AxiosApi.cancelToken.token };

    static get(urlAction: string, additionalConfig = {}) {
        const config = {
            ...this.apiConfig,
            headers: {
                'Content-Type': 'application/json',
                //   'Cache-Control': 'no-cache, no-store, must-revalidate',
                //   Pragma: 'no-cache',
                //   Expires: '0'
            },
            ...additionalConfig,
        };
        return axios.get(`${urlAction}`, config);
    }

    static post(urlAction: string, data = {}, additionalConfig = {}) {
        const config = {
            ...this.apiConfig,
            headers: {
                'Content-Type': 'application/json',
                'User-Id': '1', //TODO
                //   'Cache-Control': 'no-cache, no-store, must-revalidate',
                //   Pragma: 'no-cache',
                //   Expires: '0'
            },
            ...additionalConfig,
        };
        return axios.post(`${urlAction}`, data, config);
    }

    static put(urlAction: string, data = {}, additionalConfig = {}) {
        const config = {
            ...this.apiConfig,
            ...additionalConfig,
        };
        return axios.put(`${urlAction}`, data, config);
    }

    static delete(urlAction: ApiPath, data = {}, additionalConfig = {}) {
        const config = {
            ...this.apiConfig,
            data: { ...data },
            ...additionalConfig,
        };
        return axios.delete(`${urlAction}`, config);
    }

    static cancel() {
        this.cancelToken.cancel('Token cancel, component is unmounted');
    }

    isCancel = (value: any) => axios.isCancel(value);
}

const Food = {
    list: (config: any = {}) =>
        AxiosApi.get(
            `${ApiPath.GET_ITEMS_BY_USERID_ITEMTYPE}/?type=food`,
            config
        ),
    add: async (data: AddItemRequestPayload<FoodType>, config: any = {}) =>
        await AxiosApi.post(`${ApiPath.IMPORT_ITEM}`, data, config),
};

const Ingredient = {
    list: (config: any = {}) =>
        AxiosApi.get(
            `${ApiPath.GET_ITEMS_BY_USERID_ITEMTYPE}/?type=ingredient`,
            config
        ),
    add: async (
        data: AddItemRequestPayload<IngredientType>,
        config: any = {}
    ) => await AxiosApi.post(`${ApiPath.IMPORT_ITEM}`, data, config),
};

const FoodImageUploader = {
    getImgUploadUrl: () => AxiosApi.get(`${ApiPath.GET_PRESIGNED_URL}`),
    uploadImage: (image: File, uploadURL: string) =>
        AxiosApi.put(uploadURL, image, {
            headers: { 'Content-Type': 'image/jpeg' },
        }),
};

const axiosApi = {
    Food,
    Ingredient,
    FoodImageUploader,
};

export default axiosApi;
