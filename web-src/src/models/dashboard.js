import { dashboardMain } from '../services/api';

export default {
  namespace: 'dashboard',

  state: {
    changeData: [],
    repairData: [],
    useDeptData: [],

    assetData:[],
    assetDataOnline:[],
    assetDataOffline:[],
    assetDataRepair:[],
    
    summaryAsset :{},
    summaryChange:{},
    summaryRepair:{},

    loading: false,
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(dashboardMain);
      yield put({
        type: 'save',
        payload: response,
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {
        changeData: [],
        repairData: [],
        useDeptData: [],

        assetData:[],
        assetDataOnline:[],
        assetDataOffline:[],
        assetDataRepair:[],

    summaryAsset :{},
    summaryChange:{},
    summaryRepair:{},
    loading: false,
      };
    },
  },
};
