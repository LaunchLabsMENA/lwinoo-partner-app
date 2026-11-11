import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { http } from '../src/api/client';

export type Reply = { status: number; data?: unknown } | 'network';

/** Answers every API call from `handler`, without touching the network. */
export const mockApi = (handler: (config: InternalAxiosRequestConfig) => Reply) => {
  const adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const reply = handler(config);
    if (reply === 'network') {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config);
    }
    const response = {
      data: reply.data,
      status: reply.status,
      statusText: '',
      headers: {},
      config,
    };
    if (reply.status >= 400) {
      throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response);
    }
    return response;
  };
  http.defaults.adapter = adapter;
  axios.defaults.adapter = adapter;
};
