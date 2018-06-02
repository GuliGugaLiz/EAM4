import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider,Layout } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SiteAdd from './SiteAdd';
import SiteEdit from './SiteEdit';
import SiteImport from './SiteImport';

import styles from './SiteList.less';

const FormItem = Form.Item;
const { Option } = Select;
const {Content} = Layout;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ site, loading }) => ({
  site,
  loading: loading.models.site,
}))
@Form.create()
export default class SiteList extends PureComponent {
  state = {
    addModalVisible: false,
    importModalVisible: false,
    editModalVisible:false,
    expandForm: false,
    selectedRows: [],
    record:{},
    filterDropdownVisible: false,
    filtered: false, 

    searchName: "",
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'site/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { searchName } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...searchName,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'site/fetch',
      payload: params,
    });
  }
  handleImportSuccess= ()=>{
    const { dispatch } = this.props;
 dispatch({
      type: 'site/fetch',
      payload: {},
 })
}


  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleImportModalVisible = (flag) => {
    this.setState({
      importModalVisible: !!flag,
    });
  }

  handleEditModalVisible = (flag) => {
    this.setState({
      editModalVisible: !!flag,
    });
  }

  handleItemEdit = (record) =>{
    this.handleEditModalVisible(true);

    this.setState({
      record:record
    });
  }
/*
  handleImport = (fields) => {
    this.props.dispatch({
      type:'site/import',
      payload: {
        description: fields.desc,
      },     
    });

    message.success('添加成功');
    this.setState({
      addModalVisible: false,
    });   
  }
  */

  handleEdit = (Id,fields) => {
    this.props.dispatch({
      type:'site/update',
      payload:{
        Id:Id,
        description:fields,
      },
    });
    message.success('修改成功');
    this.setState({
       editModalVisible:false,
     });
  }

  handleDelete = (selectedRows) => {
    const { dispatch } = this.props;
    const confirm = Modal.confirm;
    confirm({
      title: '确定删除选中的数据吗',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk()  {
        dispatch({
          type:'site/remove',
          payload:{
            ids: selectedRows.map(row => row.id).join(','),
          },
        });
        console.log(selectedRows.map(row => row.id).join(','))
      },
      onCancel() {
        //console.log('Cancel');
      },
    });    
  } 

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form >
       
      </Form>
    );
  }

  //查询
  onInputChange = (e) => {
    this.setState({ searchName:e.target.value});
  }

  handleSearch = (e) => {
    e.preventDefault();
    const { dispatch } = this.props;

    const name = this.state.searchName;
    this.setState({
      filterDropdownVisible:false,
      filtered: !!name
    });
    const vals = {
      Name:name
    };

    dispatch({
      type: 'site/fetch',
      payload: vals,
    });
  }

  handleRefresh =(e) =>{
    e.preventDefault();
    const { dispatch } = this.props;
    const val = {
      Name:this.state.searchName || ''
    };
    
    dispatch({
      type: 'site/fetch',
      payload:val
    })
  }

  render() {
    const { site: { data }, loading } = this.props;
    const { selectedRows, importModalVisible, addModalVisible, editModalVisible, record } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleEdit:this.handleEdit,
      handleImportSuccess: this.handleImportSuccess,
      handleAddModalVisible: this.handleAddModalVisible,
      handleImportModalVisible: this.handleImportModalVisible,
      handleEditModalVisible: this.handleEditModalVisible,
    };

    const styleRef = {
      marginTop:'-40px',
      display: loading?"none":"block"
    };

  const columns = [
  {
    title: '城市',
    dataIndex: 'City',
  },
  {
    title:'地区',
    dataIndex:'District'
  },
   {
    title: '基站名称',
    dataIndex: 'Name',  
    filterDropdown:(
      <div className={styles.customFilterDropdown}>
       <Input ref={ele => this.searchInput = ele}
       placeholder=""
       value={this.state.searchName}
       autoFocus
       onChange={this.onInputChange}
       onPressEnter={this.handleSearch}
       />
       <Button type="primary" onClick={this.handleSearch}>查询</Button>
       </div>
    ),
    filterIcon:<Icon type="filter" style={{color: this.state.filtered ? '#108ee9' : '#aaa'}} />,
    filterDropdownVisible:this.state.filterDropdownVisible,
    onFilterDropdownVisibleChange: (visible) => {
      this.setState({
        filterDropdownVisible: visible,
      }, () => this.searchInput && this.searchInput.focus());
    } 
  },
  {
    title: '地址',
    dataIndex: 'Address',
  },
  {
    title:'经度',
    dataIndex:'Lng',
  },
  {
    title:'纬度',
    dataIndex:'Lat'
  },
  {
    title:'维护人员',
    dataIndex:'Maintainer',
  },
  {
    title:'创建时间',
    dataIndex:'CreateTime',
    render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm')}</span>,
  },
  {
    title: '操作', dataIndex: '', key: 'operation',
    render: (text, record, index) => 
    <a name="edit" onClick={() => this.handleItemEdit(record)}>编辑</a> },
];

    return (
      <Content>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleImportModalVisible(true)}>
                导入
              </Button>
              {
                selectedRows.length > 0 && (
                  <span>
                    <Button icon="delete" type="primary" onClick={() =>
                    this.handleDelete(selectedRows)}>删除</Button>                   
                  </span>
                )
              }
            </div>
            <StandardTable
              rowKey = {rec=>rec.Id}
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          <div style={styleRef}><Button shape="cicle" icon="sync" type="primary" ghost onClick={() => this.handleRefresh()}></Button> </div>
          </div>
        </Card>
        <SiteImport
          {...parentMethods}
          modalVisible={importModalVisible}
        />   
        <SiteEdit
        {...parentMethods}
        modalVisible={editModalVisible}
        record = {record}   
        />  
      </Content>
    );
  }
}
