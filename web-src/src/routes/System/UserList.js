import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import UserAdd from './UserAdd';
import UserEdit from './UserEdit';

import styles from './UserList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ user, loading }) => ({
  user,
  loading: loading.models.user,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    addModalVisible: false,
    editModalVisible:false,
    expandForm: false,
    selectedRows: [],
    record:{},
    searchName:'',
    filterDropdownVisible: false,
    filtered: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetch',
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
      type: 'user/fetch',
      payload: params,
    });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
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
      type: 'user/fetch',
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
      type: 'user/fetch',
      payload:val
    })
  }

  handleAddModalVisible = (flag) => {
    this.setState({
      addModalVisible: !!flag,
    });
  }

  handleEditModalVisible = (flag) => {
    this.setState({
      editModalVisible: !!flag,
    });
  }

  handleItemEdit = (rec) =>{
    this.handleEditModalVisible(true);
    this.setState({
      record:rec
    });
  }

  handleAdd = (fields) => {
    var me = this;
    const { form } = this.props;
    this.props.dispatch({
      type:'user/add',
      payload: {
        ... fields
      },     
      callback:  function(resp){
        if(resp){
          if(resp.status=="ok"){
            message.success('添加成功');
            me.setState({
              addModalVisible: false,
            });
            form.resetFields();
          }else {
            message.error(resp.message);
          }
        }
      }
    });
   
  }

  handleEdit = (Id,fields) => {
    this.props.dispatch({
      type:'user/update',
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
          type:'user/remove',
          payload:{
            ids: selectedRows.map(row => row.id).join(','),
          },
        });
        console.log(selectedRows.map(row => row.id).join(','))
      },
      onCancel() {
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
    const { user: { data }, loading } = this.props;
    const { selectedRows, addModalVisible,editModalVisible, record } = this.state;
    //console.info(data)

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleEdit:this.handleEdit,
      handleAddModalVisible: this.handleAddModalVisible,
      handleEditModalVisible: this.handleEditModalVisible,
    };

    const styleRef = {
      marginTop:'-40px',
      display: loading?"none":"block"
    };

  const columns = [
  {
    title: '账号',
    dataIndex: 'Account',
  },
  {
    title: '用户角色',
    dataIndex: 'Role',
    filters: [{
      text: '管理员',
      value: 'admin',
    }, {
      text: '维护人员',
      value: 'maintainer',
    }, {
      text: '普通用户',
      value: 'user',
    }],
    render: text => {
      if(text==="admin")
      {
        return "管理员"
      }else if (text ==="maintainer"){
        return "维护人员"
      }
      return "普通用户"
    },
  },
   {
    title: '名称',
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
    title: '邮箱',
    dataIndex: 'Email',
  },
  {
    title:'手机',
    dataIndex:'Phone',
  },
  {
    title: '操作', dataIndex: '', key: 'operation',
    render: (text, record, index) => 
    <a name="edit" onClick={() => this.handleItemEdit(record)}>编辑</a> },
];

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="user" type="primary" onClick={() => this.handleAddModalVisible(true)}>
                新建
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
        <UserAdd
          {...parentMethods}
          modalVisible={addModalVisible}
        />   
        <UserEdit
        {...parentMethods}
        modalVisible={editModalVisible}
        record = {record}   
        />  
      </PageHeaderLayout>
    );
  }
}
