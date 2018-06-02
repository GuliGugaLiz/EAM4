import { queryAsset, removeAsset, addAsset, importAsset } from '../services/asset';

export default {
  namespace: 'asset',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryAsset, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addAsset, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeAsset, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *import ({ payload, callback }, { call, put }) {
      const resp = yield call(importAsset, payload);
      if (callback) callback(resp);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
