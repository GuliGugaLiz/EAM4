import { parse } from 'url';

// mock tableListDataSource
let tableListDataSource = [];
for (let i = 0; i < 46; i += 1) {
  tableListDataSource.push({
    id: i,
    Province: '',
    Name: `site ${i}`,
    Lng: 22.7047 + (`${i}`/1000),
  Lat: 113.302 - (`${i}`/1000),
    currentValue: Math.floor(Math.random() * 1000),
    status: Math.floor(Math.random() * 10) % 2,
    purchaseDate: new Date(`2017-07-${Math.floor(i / 2) + 1}`),
    create_time: new Date(`2017-07-${Math.floor(i / 2) + 1}`),
    progress: Math.ceil(Math.random() * 100),
    Province: Math.floor(Math.random() * 10) % 2 ? '广东' : '广西',
    City: Math.floor(Math.random() * 10) % 2 ? '珠海' : '武汉',
  });
}

export function getSite(req, res, u) {
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

  if(params.userState) {
    const userState = params.userState.split(',');
    let filterDataSource = [];
    userState.forEach((s) => {
      filterDataSource = filterDataSource.concat(
        [...dataSource].filter(data => data.userState.indexOf(params.userState) > -1)
      );
    });
    dataSource = filterDataSource;
  }

  if (params.name) {
    dataSource = dataSource.filter(data => data.name.indexOf(params.name) > -1);
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

export function postSite(req, res, u, b) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const body = (b && b.body) || req.body;
  const { method, no, description } = body;

  switch (method) {
    /* eslint no-case-declarations:0 */
    case 'delete':
      tableListDataSource = tableListDataSource.filter(item => id.indexOf(item.id) === -1);      
      break;
    case 'post':
      const i = Math.ceil(Math.random() * 10000);
      tableListDataSource.unshift({
        id:i,
        name:`num${i}`,
        className:`class${i}`,
        brand:`br${i}`,
        purchaseDate:new Date(),
        currentValue:Math.floor(Math.random() * 1000),
        storageLocation:Math.floor(Math.random() * 10) % 2 ? '武汉' : '珠海',
        userDepartment:Math.floor(Math.random() * 10) % 2 ? '部门1' : '部门2',
        memo:'备注信息',      
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
}

export default {
  getSite,
  postSite,
};
