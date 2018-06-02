import { queryMaintainer} from '../services/api';

export default {
  namespace: 'maintainer',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({payload}, { call, put }) {
      const response = yield call(queryMaintainer, payload);
      yield put({
        type: 'save',
        payload: response,
      });
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
