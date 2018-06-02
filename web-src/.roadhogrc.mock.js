import mockjs from 'mockjs';
import { getRule, postRule } from './mock/rule';
import { getUser, postUser} from './mock/user';
import { getAsset, postAsset} from './mock/asset';
import { getTag, postTag} from './mock/tag';
import { getMaintainer, postMaintainer} from './mock/maintainer';
import { getReader, postReader} from './mock/reader';
import { getChange, postChange} from './mock/change';
import { getSite, postSite} from './mock/site';
import { getActivities, getNotice, getFakeList } from './mock/api';
import { getFakeChartData } from './mock/chart';
import { getProfileBasicData } from './mock/profile';
import { getProfileAdvancedData } from './mock/profile';
import { getNotices } from './mock/notices';
import { format, delay } from 'roadhog-api-doc';
import { getDevicefile } from './mock/devicefile';
import { getDevicelist } from './mock/devicelist';
import { getDeviceheartbeat } from './mock/deviceheartbeat';
import { getAssetClass,getDepartment} from './mock/datadictionary';


// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';

// 代码中会兼容本地 service mock 以及部署站点的静态数据
const proxy = {
  // 支持值为 Object 和 Array
  'GET /api/user/current': {
    $desc: "获取当前用户接口",
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: {
      name: '陈小明',
      userid: '00000001',
      notifyCount: 12,
    },
  },

  // GET POST 可省略
  'GET /api/user': getUser,
  'POST /api/user': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postUser,
  },

  'DELETE /api/user':{
    $params:{
      pageSize:{
        desc:'分页',
        exp:2,
      },
    },
    $body:postUser,
  },

  'GET /api/asset': getAsset,
  'POST /api/asset': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postAsset,
  },

  'GET /api/maintainer': getMaintainer,
  'POST /api/maintainer': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postMaintainer,
  },

  'GET /api/reader': getReader,
  'POST /api/reader': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postReader,
  },

  'GET /api/site': getSite,
  'POST /api/site': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postSite,
  },

  'GET /api/tag': getTag,
  'POST /api/tag': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postTag,
  },

  'GET /api/change': getChange,
  'POST /api/change': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postChange,
  },

  'GET /api/project/notice': getNotice,
  'GET /api/activities': getActivities,
  'GET /api/rule': getRule,
  'POST /api/rule': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postRule,
  },
  'GET /api/devicefile': getDevicefile,
  'GET /api/devicelist': getDevicelist,
  'GET /api/deviceheartbeat': getDeviceheartbeat,

  'GET /api/assetclass': getAssetClass,
  'GET /api/department': getDepartment,
  
  'POST /api/forms': (req, res) => {
    res.send({ message: 'Ok' });
  },
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 150, 'type|0-2': 1 }]
  }),
  'GET /api/fake_list': getFakeList,
  'GET /api/dashboard/main': getFakeChartData,
  'GET /api/profile/basic': getProfileBasicData,
  'GET /api/profile/advanced': getProfileAdvancedData,
  'POST /api/login': (req, res) => {
    const { password, userName, type } = req.body;
    if(password === 'dingli' && userName === 'admin'){
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin'
      });
      return ;
    }
    if(password === 'test' && userName === 'test'){
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'user'
      });
      return ;
    }
    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest'
    });
  },
  'POST /api/register': (req, res) => {
    res.send({ status: 'ok', currentAuthority: 'user' });
  },
  'GET /api/notices': getNotices,
  'GET /api/500': (req, res) => {
    res.status(500).send({
      "timestamp": 1513932555104,
      "status": 500,
      "error": "error",
      "message": "error",
      "path": "/base/category/list"
    });
  },
  'GET /api/404': (req, res) => {
    res.status(404).send({
      "timestamp": 1513932643431,
      "status": 404,
      "error": "Not Found",
      "message": "No message available",
      "path": "/base/category/list/2121212"
    });
  },
  'GET /api/403': (req, res) => {
    res.status(403).send({
      "timestamp": 1513932555104,
      "status": 403,
      "error": "Unauthorized",
      "message": "Unauthorized",
      "path": "/base/category/list"
    });
  },
  'GET /api/401': (req, res) => {
    res.status(401).send({
      "timestamp": 1513932555104,
      "status": 401,
      "error": "Unauthorized",
      "message": "Unauthorized",
      "path": "/base/category/list"
    });
  },
};

export default noProxy ? {} : delay(proxy, 1000);
