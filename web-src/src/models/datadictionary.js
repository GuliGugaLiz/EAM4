import { queryAssetClass, queryDepartment, importAssetClass, importDepartment, updateAssetClass, updateDepartment} from '../services/api';

export default {
  namespace: 'datadictionary',

  state: {
    assetclass: {
      list: [],
      pagination: {},
    },
    dept: {
      list: [],
      pagination: {},
    }

  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryAssetClass, payload);
      yield put({
        type: 'saveAssetClass',
        payload: response,
      });
    },

    *fetchdept({ payload }, { call, put }) {
      const response = yield call(queryDepartment, payload);
      yield put({
        type: 'saveDepartment',
        payload: response,
      });
    },

    *importassetclass ({ payload, callback }, { call, put }) {
      const resp = yield call(importAssetClass, payload);
      if (callback) callback(resp);
    },

    *importimportdept ({ payload, callback }, { call, put }) {
      const resp = yield call(importDepartment, payload);
      if (callback) callback(resp);
    },

    

    *updateclass({payload, callback}, { call, put }) {
      const resp = yield call(updateAssetClass, payload);
      if (callback) callback(resp);
    },

    *updatedept({payload, callback}, { call, put }) {
      const resp = yield call(updateDepartment, payload);
      if (callback) callback(resp);
    },

    *removeclass(){

    },

    *removedept(){

    },
    
  },

  reducers: {
    saveAssetClass(state, action) {
      return {
        ...state,
        assetclass: action.payload,
      };
    },
    saveDepartment(state, action) {
      return {
        ...state,
        dept: action.payload,
      };
    },

  },
};
