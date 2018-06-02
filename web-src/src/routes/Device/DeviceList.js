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
export default class DeviceList extends PureComponent {
  state = {
    expandForm: false,
    selectedRows: [],
    record:{},
    searchDeviceGuid:'',
    filterDropdownVisible: false,
    filtered: false, 
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'devicefile/fetchdevicelist',
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
      type: 'devicefile/fetchdevicelist',
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
      type:'devicefile/devicelistdownload',
      payload:{
        id:rec.Id,
      },
    });
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        
      </Form>
    );
  }

  render() {
    const { devicefile: { device }, loading } = this.props;
    const {selectedRows, record } = this.state;

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
    title: '标签数量',
    dataIndex: 'TagCount',
  },
   {
    title: '最后心跳时间',
    dataIndex: 'LastHeartBeat',  
    render: val => <span>{moment(val).format('HH:mm:ss')}</span>, 
  },
  {
    title: '最后上传时间',
    dataIndex: 'LastUpload',
    render: val => <span>{moment(val).format('HH:mm:ss')}</span>,
  },
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
              data={device}
              columns={columns}
              onChange={this.handleStandardTableChange}
            />
          <div style={styleRef}><Button shape="cicle" icon="sync" type="primary" ghost onClick={() => this.handleRefresh()}></Button> </div>
          </div>
        </Card>
    );
  }
}
