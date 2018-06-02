import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import ChangeEdit from './ChangeEdit';

import styles from './ChangeList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');



const CreateForm = Form.create()((props) => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      title="新建规则"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="描述"
      >
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: 'Please input some description...' }],
        })(
          <Input placeholder="请输入" />
        )}
      </FormItem>
    </Modal>
  );
});

@connect(({ change, loading }) => ({
  change,
  loading: loading.models.change,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    modalVisible: false,
    editModalVisible:false,
    expandForm: false,
    selectedRows: [],
    filterDropdownVisible: false,
    filtered: false, 
    searchEPC: "",
    record:{},
    filteredInfo:null
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'change/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { searchEPC } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...searchEPC,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'change/fetch',
      payload: params,
    });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  onInputChange = (e) => {
    this.setState({ searchEPC: e.target.value});
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

  handleItemEdit = (record) => {
    this.handleEditModalVisible(true);

    this.setState({
      record:record
    });
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  handleEditModalVisible = (flag) => {
    this.setState({
      editModalVisible: !!flag
    });
  }

  handleAdd = (fields) => {
    this.props.dispatch({
      type: 'change/add',
      payload: {
        description: fields.desc,
      },
    });

    message.success('添加成功');
    this.setState({
      modalVisible: false,
    });
  }

  handleEdit = (id,fields) => {
    this.props.dispatch({
      type:'change/update',
      payload:{
        id:id,
        description:fields
      }
    });

    message.success('修改成功');
    this.setState({
      editModalVisible:false
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
          type:'change/remove',
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
      <Form  layout="inline">
        
      </Form>
    );
  }


  render() {
    const { change: { data }, loading } = this.props;
    const { selectedRows, modalVisible,editModalVisible,record } = this.state;
    const styleRef = {
      marginTop:'-40px',
      display: loading?"none":"block"
    };
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleEdit:this.handleEdit,
      handleModalVisible: this.handleModalVisible,
      handleEditModalVisible:this.handleEditModalVisible
    };

    let {filteredInfo} = this.state;
    filteredInfo = filteredInfo || {};

    const columns = [
      {
        title: '编号',
        dataIndex: 'Id',
        width: 58,
      },{
        title: 'EPC编码',
        dataIndex: 'EPC',
        width: 188,
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
      },{
        title:'资产名称',
        dataIndex:'AssetName',
      },/*{
        title:'资产编号',
        dataIndex:'AssetId',
      },*/
      {
        title: '之前位置',
        width: 98,
        dataIndex: 'LastSiteName',   
      },{
        title:'当前位置',
        width: 98,
        dataIndex:'CurrentSiteName'
      },{
        title: '审核人员',
        width: 98,
        dataIndex: 'CheckUserAccount',   
      },{
        title:'是否通过',
        width: 98,
        dataIndex:'IsPass',
        filters:[{
          text:'未通过',value:0
        },{
          text:'通过',value:1
        }],
        filterdValue:filteredInfo.IsPass || null,
        onFilter: (value, record) => record.IsPass.toString() === value,
        render: val => {
          let style = {}
          let t = ""
          if(val===0)
          {
            style= {color:"red"}
            t = "未通过"
          }else if (val===1){
            style= {color:"green"}
            t = "通过"
          }
          return <span style={style}>{t}</span>
        },
      },
      {
        title: '时间',
        dataIndex: 'CreateTime',
        width: 128,
        //sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm')}</span>,
      },
      {
        title: '操作',
        width: 48,
        render: (text,record,index) => (
          <Fragment>
            <a key={index} onClick ={() => {this.handleItemEdit(record)}} >编辑</a>
          </Fragment>
        ),
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
              {
                selectedRows.length > 0 && (
                  <span>
                    <Button icon="delete" type="primary" onClick={() =>
                    this.handleDelete(selectedRows)}>批量通过</Button>                  
                  </span>
                )
              }
            </div>
            <StandardTable
              hideSelect = "true"
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
        <ChangeEdit
        {...parentMethods}
        modalVisible={editModalVisible}
        record={record}
        />
      </PageHeaderLayout>
    );
  }
}
