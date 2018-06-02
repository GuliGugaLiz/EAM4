import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './DeviceFile.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ devicefile, loading }) => ({
  devicefile,
  loading: loading.models.devicefile,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    expandForm: false,
    selectedRows: [],
    searchDeviceGuid:'',
    filterDropdownVisible: false,
    filtered: false, 
    record:{}
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'devicefile/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { searchDeviceGuid } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...searchDeviceGuid,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'devicefile/fetch',
      payload: params,
    });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  onInputChange = (e) => {
    this.setState({ searchDeviceGuid: e.target.value});
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;
    const txt = this.state.searchDeviceGuid;
      this.setState({
        filterDropdownVisible: false,
        filtered: !!txt,
      });
      const vals = {
        DeviceGuid: txt, 
      }

      dispatch({
        type: 'devicefile/fetch',
        payload: vals,
      });
  }

  handleRefresh =(e) =>{
    e.preventDefault();
    const { dispatch } = this.props;
    const val = {
      DeviceGuid:this.state.searchDeviceGuid || ''
    };
    
    dispatch({
      type: 'devicefile/fetch',
      payload:val
    })
  }

  handleItemDownload = (rec) => {
    console.info(rec)
    this.props.dispatch({
      type:'devicefile/download',
      payload:{
        id:rec.Id,
      },
    });
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form  layout="inline">
       
      </Form>
    );
  }

  render() {
    const { devicefile: { file }, loading } = this.props;
    const {selectedRows, record } = this.state;
    const data = file;

    const parentMethods = {
      handleItemDownload:this.handleItemDownload,
     // handleAddModalVisible: this.handleAddModalVisible,
    };

    const styleRef = {
      marginTop:'-40px',
      display: loading?"none":"block"
    };

  const columns = [
  {
    title: '设备GUID',
    dataIndex: 'DeviceGuid',
    width: 295,
    filterDropdown: (
      <div className={styles.customFilterDropdown}>
        <Input
          ref={ele => this.searchInput = ele}
          placeholder=""
          value={this.state.searchDeviceGuid}
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
  },
  {
    title: '文件名',
    dataIndex: 'FilePath',
    width: 198
  },
   {
    title: '文件大小',
    dataIndex: 'Size',   
    width: 78,
  },
   {
    title: '处理状态',
    dataIndex: 'TagState',   
  },
  {
    title: '上传时间',
    dataIndex: 'CreateTime',
    width: 78,
    render: val => <span>{moment(val).format('HH:mm:ss')}</span>,
  },
  {
    title: '操作', 
    width: 48,
    dataIndex: 'download', key: 'operation',
    render: (text, record, index) => 
    <a name="download" onClick={() => this.handleItemDownload(record)}>下载
    </a> },
];

    return (      
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <StandardTable
              hideSelect="true"
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onChange={this.handleStandardTableChange}
            />
          <div style={styleRef}><Button shape="cicle" icon="sync" type="primary" ghost onClick={() => this.handleRefresh()}></Button> </div>
          </div>
        </Card>     
    );
  }
}
