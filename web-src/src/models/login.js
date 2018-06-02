import { routerRedux } from 'dva/router';
import { userLogin} from '../services/api';
import { setAuthority, setToken } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const resp= yield call(userLogin, payload);
      //console.info(resp)
      yield put({
        type: 'changeLoginStatus',
        payload: resp,
      });
      // Login successfully
      if (resp && resp.status === 'ok') {
        //const urlParams = new URL(window.location.href);
          //urlParams.searchParams.set('redirect', '/');
        //}
        setToken(resp.token);
        reloadAuthorized();
        yield put(routerRedux.push('/'));
      }
    },
    *logout(_, { put, select }) {
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        if(urlParams.searchParams.get('redirect') != '/user/login'){
          urlParams.searchParams.set('redirect', pathname);
        }
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        setToken(null);
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      if (payload && payload.currentAuthority){
        setAuthority(payload.currentAuthority);
      }else if(!payload){
        setAuthority('guest');
        return {
          ... state
        };
      }
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
