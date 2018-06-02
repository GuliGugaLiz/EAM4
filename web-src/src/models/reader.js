import { queryReader, getReader,updateReader} from '../services/api';

export default {
  namespace: 'reader',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({payload}, { call, put }) {
      const response = yield call(queryReader, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *update({payload, callback}, { call, put }) {
      const resp = yield call(updateReader, payload);
      if (callback) callback(resp);
    },

    *get({payload, callback}, { call, put }) {
      const resp = yield call(getReader, payload);
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
    clear() {
      return {
        data: {
          list: [],
          pagination: {},
        },
      };
    },
  },
};
