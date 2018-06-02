import { parse } from 'url';

// mock tableListDataSource
let tableListDataSource = [];
for (let i = 0; i < 46; i += 1) {
  tableListDataSource.push({
    id: i,
    disabled: ((i % 6) === 0),
    download: 'https://ant.design',
    avatar: ['https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png', 'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png'][i % 2],
    device_guid: `TradeCode ${i}`,
    file_path: `一个任务名称 ${i}`,
    owner: '曲丽丽',
    description: '这是一段描述',
    size: Math.floor(Math.random() * 1000),
    status: Math.floor(Math.random() * 10) % 2,
    updatedAt: new Date(`2017-07-${Math.floor(i / 2) + 1}`),
    create_time: new Date(`2017-07-${Math.floor(i / 2) + 1}`),
    progress: Math.ceil(Math.random() * 100),
  });
}

export function getDevicefile(req, res, u) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const params = parse(url, true).query;

  let dataSource = [...tableListDataSource];

  if (params.sorter) {
    const s = params.sorter.split('_');
    dataSource = dataSource.sort((prev, next) => {
      if (s[1] === 'descend') {
        return next[s[0]] - prev[s[0]];
      }
      return prev[s[0]] - next[s[0]];
    });
  }

  // if (params.status) {
  //   const status = params.status.split(',');
  //   let filterDataSource = [];
  //   status.forEach((s) => {
  //     filterDataSource = filterDataSource.concat(
  //       [...dataSource].filter(data => parseInt(data.status, 10) === parseInt(s[0], 10))
  //     );
  //   });
  //   dataSource = filterDataSource;
  // }

  // if (params.no) {
  //   dataSource = dataSource.filter(data => data.no.indexOf(params.no) > -1);
  // }

  if (params.device_guid) {
    dataSource = dataSource.filter(data => (data.device_guid).indexOf(params.device_guid) > -1);
  }

  let pageSize = 10;
  if (params.pageSize) {
    pageSize = params.pageSize * 1;
  }

  const result = {
    list: dataSource,
    pagination: {
      total: dataSource.length,
      pageSize,
      current: parseInt(params.currentPage, 10) || 1,
    },
  };

  if (res && res.json) {
    res.json(result);
  } else {
    return result;
  }
}

/* export function postDevicefile(req, res, u, b) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const body = (b && b.body) || req.body;
  const { method, no, description } = body;

  switch (method) {
    case 'delete':
      tableListDataSource = tableListDataSource.filter(item => id.indexOf(item.id) === -1);
      break;
    case 'post':
      const i = Math.ceil(Math.random() * 10000);
      tableListDataSource.unshift({
        id: `devicefile-list-${i}`,
      device_guid: dev[i % 10],
      file_path: titles[i % 8],
      size: Math.ceil(Math.random() * 100) + 100 +'kb',
      create_time: new Date(new Date().getTime() - (1000 * 60 * 60 * 2 * i)),
      download: 'https://ant.design'
      });
      break;
    default:
      break;
  }

  const result = {
    list: tableListDataSource,
    pagination: {
      total: tableListDataSource.length,
    },
  };

  if (res && res.json) {
    res.json(result);
  } else {
    return result;
  }
} */

export default {
    getDevicefile,
    //postDevicefile
  };