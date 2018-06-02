import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Tooltip, Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import TagImport from './TagImport';
import TagEdit from './TagEdit';

import styles from './TagList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ tag, loading }) => ({
  tag,
  loading: loading.models.tag,
}))
@Form.create()
export default class TagList extends PureComponent {
  state = {
    filterDropdownVisible: false,
    filtered: false, 

    searchEPC: "",
    searchStateId: "",

    selectedRows: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'tag/fetch',
    });
  }

  onInputChange = (e) => {
    this.setState({ searchEPC: e.target.value});
  }

  
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { searchEPC } = this.state;
    /*
    console.info(filtersArg)

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = JSON.stringify(filtersArg[key]);
      return newObj;
    }, {});*/
    const vals = {EPC:searchEPC,  ...filtersArg}
    //console.info(vals)
    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...vals,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }
    this.setState({ searchFilters : filtersArg});

    dispatch({
      type: 'tag/fetch',
      payload: params,
    });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (e) => {
    e.preventDefault();


    const { dispatch, form } = this.props;
    const txt = this.state.searchEPC;
      this.setState({
        filterDropdownVisible: false,
        filtered: !!txt,
      });
      const vals = {
          EPC: txt, 
          ... this.state.searchFilters
      }

      dispatch({
        type: 'tag/fetch',
        payload: vals,
      });
  }

  handleRefresh =(e) =>{
    e.preventDefault();
    const { dispatch } = this.props;
    const val = {
      EPC:this.state.searchFilters || ''
    };
    
    dispatch({
      type: 'tag/fetch',
      payload:val
    })
  }

  exportAll = () => {
    const { dispatch } = this.props;   
  }

  exportSelect = (selectedRows) => {
    const { dispatch } = this.props;   
  }

  render() {
    const { tag: { data }, loading } = this.props;
    const { selectedRows} = this.state;
    const styleRef = {
      marginTop:'-40px',
      display: loading?"none":"block"
    };
    const columns = [
      {
        title: 'EPC编码',
        dataIndex: 'EPC',
        width: 228,
        filterDropdown: (
          <div className={styles.customFilterDropdown}>
            <Input
              ref={ele => this.searchInput = ele}
              placeholder=""
              value={this.state.searchEPC}
              onChange={this.onInputChange}
              onPressEnter={this.handleSearch}
            />
            <Button type="primary" onClick={this.handleSearch}>查询</Button>
          </div>
        ),
        filterIcon: <Icon type="filter" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
        filterDropdownVisible: this.state.filterDropdownVisible,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            filterDropdownVisible: visible,
          }, () => this.searchInput && this.searchInput.focus());
        },
      }, {
        title:'资产名称',
        dataIndex:'AssetName',
      }, {
        title:'基站名称',
        dataIndex:'SiteName',
        width: 108,
      },
      {
        title: '更新时间',
        width: 128,
        dataIndex: 'LastCheck',
        render: val => {
          if(!val) return "";
          return <span>{moment(val).format('YYYY-MM-DD HH:mm')}</span>},
        },
      {
        title: '状态',
        dataIndex: 'LastState',
        width: 68,
        filters: [{
            text: '未盘点',
            value: 0,
          }, {
            text: '在库',
            value: 1,
          }, {
            text: '盘亏',
            value: 2,
          }],
        render: (val, rec) => {
          let style = {}
          let t = "未盘点"
      if(val===1)
      {
        style= {color:"green"}
        t = "在库"
      }else if (val===2){
        style= {color:"red"}
        t = "盘亏"
      }
      let lost = ""
      if(rec.Lost){
        lost = moment(rec.Lost).format('YYYY-MM-DD HH:mm');
      }
      return <Tooltip title={lost}>
<span style={style}>{t}</span>
    </Tooltip>
    },
      },
    ];


    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button type="primary"  onClick={() => this.exportAll()}>
              导出所有
              </Button>
              {
                selectedRows.length > 0 && (
                  <span>
                    <Button type="primary" onClick={() =>
                    this.exportSelect(selectedRows)}>导出已选</Button>                  
                  </span>
                )
              }
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data?data:[]}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
         <div style={styleRef}><Button shape="cicle" icon="sync" type="primary" ghost onClick={() => this.handleRefresh()}></Button> </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
