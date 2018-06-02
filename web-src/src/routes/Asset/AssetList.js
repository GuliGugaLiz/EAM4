import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import AssetImport from './AssetImport';
import AssetEdit from './AssetEdit';

import styles from './AssetList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ asset, loading }) => ({
  asset,
  loading: loading.models.asset,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    addModalVisible: false,
    editModalVisible: false,
    detialModalVisible:false,
    expandForm: false,
    selectedRows: [],
    editingKey:'',
    record:{},
    filterDropdownVisible: false,
    filtered: false, 

    searchName: "",
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'asset/fetch',   
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
      type: 'asset/fetch',
      payload: params,
    });
  }
handleImportSuccess = () =>{
    this.props.dispatch({
      type: 'asset/fetch',
      payload: {},
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
      type: 'asset/fetch',
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
      type: 'asset/fetch',
      payload:val
    })
  }

  handleDetialModalVisible = (flag) => {
    this.setState({
      detailModalVisible: !!flag
    });
  }

  handleEditModalVisible = (flag) => {
    this.setState({
      editModalVisible: !!flag,
    });
  }

  handleAddModalVisible = (flag) => {
    this.setState({
      addModalVisible: !!flag,
    });
  }

  handleAdd = (fields) => {
    this.props.dispatch({
      type: 'asset/add',
      payload: {
        description: fields.desc,
      },
    });

    message.success('添加成功');
    this.setState({
      addModalVisible: false,
    });
  }

  handleItemEdit = (record) =>{
    this.handleEditModalVisible(true);

    this.setState({
      record:record
    });
  }

  handleEdit = (key,fields) => {
    this.props.dispatch({
      type:'asset/update',
      payload:{
        key:key,
        description:fields
      },
    });

    message.success('修改成功');
    this.setState({
      editModalVisible:false,
    });
  }

  //详情操作
  handleDetial = (record) => {
    this.handleDetialModalVisible(true);

    this.setState({
      record:record
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
          type:'asset/remove',
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
      <Form layout="inline">
     
      </Form>
    );
  }  

  render() {
    const { asset : {data} , loading } = this.props;
    const { selectedRows, addModalVisible, editModalVisible, detailModalVisible, record } = this.state;
    //console.info(data, this.props);

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleEdit:this.handleEdit,
      handleDetial:this.handleDetial,
      handleImportSuccess: this.handleImportSuccess,
      handleAddModalVisible: this.handleAddModalVisible,
      handleEditModalVisible: this.handleEditModalVisible,  
      handleDetialModalVisible:this.handleDetialModalVisible,  
    };

    const styleRef = {
      marginTop:'-40px',
      display: loading?"none":"block"
    }

  const columns = [
  {
    title: '资产编号',
    dataIndex: 'Id',
  },
  {
    title: '资产名称',
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
    title:'资产分类',
    dataIndex:'ClassName',
  },
  {
    title:'品牌',
    dataIndex:'Brand',
  },
   {
    title: '资产状态',
    dataIndex: 'UseState',    
    filters:[{
      text:'未盘点',value:0
    },{
      text:'在库',value:1
    },{
      text:'盘亏',value:2
    }],
    render: val => {
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
      return <span style={style}>{t}</span>
    },
  },
  {
    title: '当前价值',
    dataIndex:'CurrentValue'
  },{
    title: '存放地点',
    dataIndex:'StorageLocation'
  },{
    title: '购入日期',
    dataIndex: 'PurchaseDate',
    sorter: true,
    render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm')}</span>,
  },
  {
     title: '操作', dataIndex: '', key: 'operation',
     render: (text, record, index) => 
     <Fragment>
     <a name="edit"  onClick={() => this.handleItemEdit(record)}>编辑</a>     
     </Fragment>
    },
];

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus-square" type="primary" onClick={() => this.handleAddModalVisible(true)}>
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
        <AssetImport
          {...parentMethods}
          modalVisible={addModalVisible}
        />
        <AssetEdit
          {...parentMethods}
          modalVisible={editModalVisible}
          record={record}
          //data={dataList}
        />
        
      </PageHeaderLayout>
    );
  }
}
