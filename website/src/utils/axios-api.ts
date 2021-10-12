import axios, {  CancelTokenSource } from 'axios';
import config from '../config';
import { ApiPath } from '../models/api-path';

axios.defaults.baseURL = config.getApiBaseUrl();

class AxiosApi {
  private static cancelToken: CancelTokenSource = axios.CancelToken.source();
  private static apiConfig =  { cancelToken: AxiosApi.cancelToken.token }

  static get(urlAction: ApiPath, additionalConfig = {}) {
      const config = {
          ...this.apiConfig,
          headers: {
              'Content-Type': 'application/json',
            //   'Cache-Control': 'no-cache, no-store, must-revalidate',
            //   Pragma: 'no-cache',
            //   Expires: '0'
          },
          ...additionalConfig
      };
      return axios.get(`${urlAction}`, config);
  }

  static post(urlAction: ApiPath, data = {}, additionalConfig = {}) {
      const config = {
          ...this.apiConfig,
          ...additionalConfig
      };
      return axios.post(`${urlAction}`, data, config);
  }

  static put(urlAction: ApiPath, data = {}, additionalConfig = {}) {
      const config = {
          ...this.apiConfig,
          ...additionalConfig
      };
      return axios.put(`${urlAction}`, data, config);
  }

  static delete(urlAction: ApiPath, data = {}, additionalConfig = {}) {
      const config = {
          ...this.apiConfig,
          data: { ...data },
          ...additionalConfig
      };
      return axios.delete(`${urlAction}`, config);
  }

  static cancel() {
      this.cancelToken.cancel("Token cancel, component is unmounted");
  }

  isCancel = (value: any) => axios.isCancel(value)
}

const Food = {
    list: (config: any = {})  => AxiosApi.get(ApiPath.GET_ALL_FOOD, config)
}

const axiosApi = {
    Food,
}

export default axiosApi;