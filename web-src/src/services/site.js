import request from '../utils/request';
import { stringify } from 'qs';
/*
export async function query() {
  return request(`/api/users`);
}*/

export async function querySite(params) {
  return request(`/api/site?${stringify(params)}`);
}

export async function searchSite(params) {
  return request(`/api/site/search?${stringify(params)}`);
}

export async function importSite(params) {
  return request(`/api/site/import`, {
    method: 'POST',
    body: params,
  });
}

export async function addSite(params) {
  return request(`/api/site`, {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateSite(id,params){
  return request(`/api/site`,{
    method:'PUT',
    body: {
      ...params,
      method: 'put',
    },
  });
}

export async function removeSite(ids) {
  return request(`/api/site`, {
    method: 'POST',
    body: {
      ...ids,
      method: 'delete',
    },
  });
}
