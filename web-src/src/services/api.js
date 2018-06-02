import { stringify } from 'qs';
import request  from '../utils/request';
import  download from '../utils/download';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}


export async function queryChange(params){
  return request(`/api/change?${stringify(params, { indices: false })}`);
}

export async function queryTag(params){
  return request(`/api/tag?${stringify(params, { indices: false })}`);
}

export async function queryMaintainer(params){
  return request(`/api/maintainer?${stringify(params)}`);
}

export async function queryReader(params){
  return request(`/api/reader?${stringify(params)}`);
}

export async function getReader(params){
  return request(`/api/reader/get?${stringify(params)}`);
}

export async function updateReader(params){
  return request(`/api/reader/update`,{
    method:'POST',
    body: {
      ...params,
    },
  });
}

export async function queryDeviceFile(params){
  return request(`/api/devicefile?${stringify(params)}`);
}

export async function downloadDeviceFile(params) {
  return download(`/api/devicefile/download?${stringify(params)}`);
}

export async function queryDeviceList(params){
  return request(`/api/devicelist?${stringify(params)}`);
}

export async function queryDeviceHeartbeat(params){
  return request(`/api/deviceheartbeat?${stringify(params)}`);
}

export async function queryAssetClass(params){
  return request(`/api/assetclass?${stringify(params)}`);
}

export async function importAssetClass(params) {
  return request(`/api/assetclass/import`, {
    method: 'POST',
    body: params,
  });
}

export async function updateAssetClass(params) {
  return request(`/api/assetclass/update`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function queryDepartment(params){
  return request(`/api/department?${stringify(params)}`);
}

export async function importDepartment(params) {
  return request(`/api/department/import`, {
    method: 'POST',
    body: params,
  });
}

export async function updateDepartment(params) {
  return request(`/api/department/update`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}


export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function dashboardMain() {
  return request('/api/dashboard/main');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function userLogin(params) {
  return request('/api/login', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}
