import request from '../utils/request';
import { stringify } from 'qs';
/*
export async function query() {
  return request(`/api/users`);
}*/

export async function queryUsers(params) {
  return request(`/api/user?${stringify(params)}`);
}

export async function queryCurrent() {
  return request(`/api/user/current`);
}

export async function addUser(params) {
  return request(`/api/user/add`, {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateUsers(id,params){
  return request(`/api/user`,{
    method:'PUT',
    body: {
      ...params,
      method: 'put',
    },
  });
}

export async function disabledUsers(ids) {
  return request(`/api/user/disabled`, {
    method: 'POST',
    body: {
      ...ids,
      method: 'disabled',
    },
  });
}

export async function removeUsers(ids) {
  return request(`/api/user`, {
    method: 'POST',
    body: {
      ...ids,
      method: 'delete',
    },
  });
}

export async function fetchCurrentInfo() {
  return request(`/api/user/currentinfo`);
}

export async function updateCurrent(params){
  return request(`/api/user/updatecurrent`,{
    method:'POST',
    body: {
      ...params,
      method: 'put',
    },
  });
}

export async function updatePwd(params){
  return request(`/api/user/updatepwd`,{
    method:'POST',
    body: {
      ...params,
      method: 'put',
    },
  });
}


