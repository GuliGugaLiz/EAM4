import { queryUsers, queryCurrent, updateUsers, removeUsers,addUser,
updateCurrent, updatePwd, fetchCurrentInfo,
disabledUsers } from '../services/user';

export default {
  namespace: 'user',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    list: [],
    currentUser: {},
    currentEdit: {},
respStatus: {status: "ok", message: ""},
  },

  effects: {
    *fetch({payload}, { call, put }) {
      const response = yield call(queryUsers, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },

    *add({ payload, callback }, { call, put }) {
      const resp = yield call(addUser, payload);
      /*if(resp){
        yield put({
          type: 'save',
          payload: resp,
        });
      }*/
      console.info(resp);
      if (callback) callback(resp);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeUsers, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },

    *disabled({ payload, callback }, { call, put }) {
      const response = yield call(disabledUsers, payload);
      if (callback) callback(response);
    },

  
    *removeUsers({payload,callback},{call,put,select}){
      const response = yield call(removeUsers,payload);
      const page = yield select(state => state.data)
      yield put({
        type:'fetch',
        payload:page,
      });
      if (callback) callback();
    },
    *updateUsers({id,params},{call,put,select}){
      yield call(updateUsers,id,params);
      const response = yield call(updateUsers,payload);
      yield put({
        type:'updateUsers',
        payload:response,
      });
    },
    *update({payload},{select,call,put}){
      const id = yield select(({user}) => user.currentUser.id)
      const newUser = {...payload,id}
      const data = yield call(update,newUser)
      yield put({
        type:'save',
      
      });
    },

    *updatePwd({payload}, { call, put }) {
      const response = yield call(updatePwd, payload);
      yield put({
        type: 'updateStatus',
        payload: response,
      });
    },

    *fetchCurrentInfo(_, { call, put }) {
      const response = yield call(fetchCurrentInfo);
      yield put({
        type: 'saveCurrentInfo',
        payload: response,
      });
    },

    *updateCurrent({payload}, { call, put }) {
      const response = yield call(updateCurrent, payload);
      yield put({
        type: 'updateCurrentDone',
        payload: response,
      });
    },

    *resetStatus({payload}, {call, put}){
      yield put({
        type: 'resetStatusOK',
      })
    }
  },

  reducers: {
    resetStatusOK(state, action) {
      return {
        ...state,
        respStatus: {status: "ok", message: ""},
      };
    },
     updateStatus(state, action) {
      return {
        ...state,
        respStatus:action.payload,
      };
    },

    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  
    updateCurrentDone(state, action) {
      let s = {
        ...state,
      };
       s.currentEdit.status = action.payload.status;
       s.currentEdit.message = action.payload.message;
       return s;
    },


    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },

    saveCurrentInfo(state, action) {
      let s = {
        ...state,
        currentEdit: action.payload,
      };
      s.currentEdit.status = "ok";
      s.currentEdit.message = "";
      return s;
    },

    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
    deleteUsers(state,action){
      return {
        ...state,
        data:action.payload,
      };
    },
    updateUsers(state,action) {
      return {
        ...state,
        data:action.payload,
      };
    }
  },
};
