import { parse } from 'url';

// mock tableListDataSource
let tableListDataSource = [];
for (let i = 0; i < 46; i += 1) {
  tableListDataSource.push({
    id:i,
    account:`acc${i}`,
    role:Math.floor(Math.random() * 10) % 2 ? '管理员' : '维护人员',
    name:`num${i}`,
    email:`test ${i} @test.com`,
    phone:'188******',
    memo:'备注信息',
  });
}

export function getUser(req, res, u) {
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

  if(params.role) {
    const role = params.role.split(',');
    let filterDataSource = [];
    role.forEach((s) => {
      filterDataSource = filterDataSource.concat(
        [...dataSource].filter(data => data.role.indexOf(params.role) > -1)
      );
    });
    dataSource = filterDataSource;
  }

  if (params.account) {
    dataSource = dataSource.filter(data => data.account.indexOf(params.account) > -1);
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

export function postUser(req, res, u, b) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const body = (b && b.body) || req.body;
  const { method, ids, description } = body;

  switch (method) {
    /* eslint no-case-declarations:0 */
    case 'delete':    
      tableListDataSource = tableListDataSource.filter(item => ids.indexOf(item.id) === -1); 
      //tableListDataSource.shift({}) 
      break;
    case 'post':
      const i = Math.ceil(Math.random() * 10000);
      tableListDataSource.unshift({
        id:i,
        account:`acc${i}`,
        role:Math.floor(Math.random() * 10) % 2 ? '管理员' : '维护人员',
        name:`num${i}`,
        email:`test ${i} @test.com`,
        phone:'188******',
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
  getUser,
  postUser,
};
