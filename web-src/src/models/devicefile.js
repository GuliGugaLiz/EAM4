import { queryDeviceFile, downloadDeviceFile, queryDeviceList, queryDeviceHeartbeat} from '../services/api';

export default {
  namespace: 'devicefile',

  state: {
    file: {
      list: [],
      pagination: {},
    },
    device: {
      list: [],
      pagination: {},
    },
    heartbeat: {
      list: [],
      pagination: {},
    },

  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryDeviceFile, payload);
      yield put({
        type: 'saveDeviceFile',
        payload: response,
      });
    },

   *download({ payload }, { call, put }) {
       yield call(downloadDeviceFile, payload);
    },

    *fetchdevicelist({ payload }, { call, put }) {
      const response = yield call(queryDeviceList, payload);
      yield put({
        type: 'saveDevice',
        payload: response,
      });
    },

    *fetchheartbeat({ payload }, { call, put }) {
      const response = yield call(queryDeviceHeartbeat, payload);
      yield put({
        type: 'saveHeartBeat',
        payload: response,
      });
    },

  },

  reducers: {
    saveDeviceFile(state, action) {
      return {
        ...state,
        file: action.payload,
      };
    },
    saveDevice(state, action) {
      return {
        ...state,
        device: action.payload,
      };
    },

    saveHeartBeat(state, action) {
      return {
        ...state,
        heartbeat: action.payload,
      };
    },
  },
};
