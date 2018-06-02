import request from '../utils/request';
import { stringify } from 'qs';


export async function queryAsset(params) {
  return request(`/api/asset?${stringify(params)}`);
}

export async function removeAsset(params) {
  return request('/api/asset', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addAsset(params) {
  return request('/api/asset', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function importAsset(params) {
  return request(`/api/asset/import`, {
    method: 'POST',
    body: params,
  });
}
