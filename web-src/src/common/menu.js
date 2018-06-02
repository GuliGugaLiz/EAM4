import {
  isUrl
} from '../utils/utils';

const menuData = [{
    name: '首页',
    icon: 'dashboard',
    path: 'dashboard',
    children: [{
        name: '监控面板',
        path: 'main',
      },
      {
        name: '监控页',
        path: 'monitor',
        hideInMenu: true,
      },
      {
        name: '工作台',
        path: 'workplace',
        hideInMenu: true,
      }, {
        name: '地图',
        path: 'map',
        hideInMenu: true,
      }
    ],
  },
  {
    name: '资产管理',
    icon: 'table',
    path: 'asset',
    children: [{
      name: '资产列表',
      path: 'asset-list',
    }, {
      name: '标签列表',
      path: 'tag-list',
    }, {
      name: '读卡器管理',
      path: 'tagreader-list',
    }, {
      name: '基站管理',
      path: 'site-list',
    }, {
      name: '维护人员',
      hideInMenu: true,
      path: 'maintainer-list',
    }],
  }, {
    name: '变动维修',
    icon: 'check-circle-o',
    path: 'change-repair',
    children: [{
      name: '位置变动',
      path: 'change-list',
    }, {
      name: '维修记录',
      path: 'repair-list',
      hideInMenu: true,
    }],
  }, {
    name: '用户设置',
    icon: 'solution',
    path: 'setting',
    children: [{
      name: '当前设置',
      path: 'current',
    }, {
      name: '用户日志',
      path: 'log',
      hideInMenu: true,
    }]
  }, {
    name: '系统管理',
    icon: 'setting',
    authority: 'admin',
    path: 'system',
    children: [{
      name: '用户管理',
      path: 'user-list',
    }, {
      name: '日志管理',
      path: 'log',
      hideInMenu: true,
    },{
      name: '上报文件',
      path: 'device-file',
    },{
      name:'数据字典',
      path:'data-dictionary',
    }]
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let {
      path
    } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
