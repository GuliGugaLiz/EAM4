import { querySite, updateSite, removeSite,
 importSite, addSite, searchSite
} from '../services/site';

export default {
  namespace: 'site',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    list: [],
    currentSite: {},
  },

  effects: {
    *fetch({payload}, { call, put }) {
      const response = yield call(querySite, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addSite, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },

    *search({ payload, callback }, { call, put }) {
      const resp = yield call(searchSite, payload);
      if (callback) callback(resp);
    },

    *import ({ payload, callback }, { call, put }) {
      const resp = yield call(importSite, payload);
      if (callback) callback(resp);
    },

    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeSite, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
  
    *removeSite({payload,callback},{call,put,select}){
      const response = yield call(removeSite,payload);
      const page = yield select(state => state.data)
      yield put({
        type:'fetch',
        payload:page,
      });
      if (callback) callback();
    },
    *updateSite({id,params},{call,put,select}){
      yield call(updateSite,id,params);
      const response = yield call(updateSite,payload);
      yield put({
        type:'updateSite',
        payload:response,
      });
    },
    *update({payload},{select,call,put}){
      const id = yield select(({site}) => site.currentSite.Id)
      const newItem = {...payload,id}
      const data = yield call(update,newItem)
      yield put({
        type:'save',
      
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
    saveCurrentSite(state, action) {
      return {
        ...state,
        currentSite: action.payload,
      };
    },
    deleteSite(state,action){
      return {
        ...state,
        data:action.payload,
      };
    },
    updateSite(state,action) {
      return {
        ...state,
        data:action.payload,
      };
    }
  },
};
