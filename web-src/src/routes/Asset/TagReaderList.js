import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import TagReaderEdit from './TagReaderEdit';

import styles from './TagReaderList.less';

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
      title="导入读卡器信息"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="上传文件"
      >
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: 'Please input some description...' }],
        })(
          <Input placeholder="请选择文件" />
        )}
      </FormItem>
    </Modal>
  );
});

@connect(({ reader, loading }) => ({
  reader,
  loading: loading.models.reader,
}))
@Form.create()
export default class ReaderList extends PureComponent {
  state = {
    modalVisible: false,
    editModalVisible:false,
    expandForm: false,
    selectedRows: [],
    editRecordId: null,
    filterDropdownVisible: false,
    filtered: false, 

    searchReaderId: "",
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'reader/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { searchReaderId } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...searchReaderId,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'reader/fetch',
      payload: params,
    });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  handleAdd = (fields) => {
    this.props.dispatch({
      type: 'reader/add',
      payload: {
        description: fields.desc,
      },
    });

    message.success('添加成功');
    this.setState({
      modalVisible: false,
    });
  }

  handleEditModalVisible = (flag) => {
    this.setState({
      editModalVisible: !!flag,
    });
  }

  handleItemEdit = (rec) =>{
    console.info(rec);
    this.setState({
      editModalVisible: true,
      editRecordId:rec.Id,
    });
  }

  handleEdit = (Id,fields) => {
    this.props.dispatch({
      type:'reader/update',
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
          type:'reader/remove',
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
    this.setState({ searchReaderId:e.target.value});
  }

  handleSearch = (e) => {
    e.preventDefault();
    const { dispatch } = this.props;

    const readerId = this.state.searchReaderId;
    this.setState({
      filterDropdownVisible:false,
      filtered: !!readerId
    });
    const vals = {
      ReaderId:readerId
    };

    dispatch({
      type: 'reader/fetch',
      payload: vals,
    });
  }

  handleRefresh =(e) =>{
    e.preventDefault();
    const { dispatch } = this.props;
    const val = {
      ReaderId:this.state.searchReaderId || ''
    };
    
    dispatch({
      type: 'reader/fetch',
      payload:val
    })
  }

  render() {
    const { reader: { data }, loading } = this.props;
    const { selectedRows, modalVisible, editModalVisible } = this.state;
    const { editRecordId } = this.state;

    const columns = [
      {
        title: '读卡器编号',
        dataIndex: 'ReaderId',
        filterDropdown:(
          <div className={styles.customFilterDropdown}>
           <Input ref={ele => this.searchInput = ele}
           placeholder=""
           value={this.state.searchReaderId}
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
        title: '所在位置',
        dataIndex: 'SiteName',
      },
      {
        title: '最后更新时间',
        dataIndex: 'LastHeartBeat',    
        render: (val)  => {
          return val?<span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>:"";
        },
      },
      {
        title: '最后上传时间',
        dataIndex: 'LastUpload',
        //sorter: true,
      render: (val)  => {
        return val?<span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>:"";
    },
      },
      {
        title: '操作',
        render: (val, rec, idx) => (
          <Fragment>
          <a name="edit" key={idx} onClick={() => this.handleItemEdit(rec)}>编辑</a> 
          </Fragment>
        ),
      },
    ];
    

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      handleEditModalVisible:this.handleEditModalVisible,
    };

    const styleRef = {
      marginTop:'-40px',
      display: loading?"none":"block"
    }

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" style={{display:'none'}} onClick={() => this.handleModalVisible(true)}>
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
        <CreateForm
          {...parentMethods}
          modalVisible={modalVisible}
        />
        <TagReaderEdit
        {
          ...parentMethods
        }
        editModalVisible={editModalVisible}
        editRecordId={editRecordId}
        />
      </PageHeaderLayout>
    );
  }
}
