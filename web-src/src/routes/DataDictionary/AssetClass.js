import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider,Layout, Popconfirm } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import ClassEdit from './ClassEdit';
import ClassImport from './ClassImport';

import styles from './AssetClass.less';

const FormItem = Form.Item;
const { Option } = Select;
const {Content} = Layout;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ datadictionary, loading }) => ({
    datadictionary,
  loading: loading.models.datadictionary,
}))
@Form.create()
export default class AssetClass extends PureComponent {
  state = {
    importModalVisible: false,
    editModalVisible:false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    data:this.props.datadictionary.assetclass.list
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'datadictionary/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'datadictionary/fetch',
      payload: params,
    });
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'datadictionary/fetchdept',
      payload: {},
    });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (vals) => {
    console.log(vals)
    const { dispatch, form } = this.props;

      dispatch({
        type: 'datadictionary/fetch',
        payload: vals,
    });
  }

  handleImportModalVisible = (flag) => {
    this.setState({
      importModalVisible: !!flag,
    });
  }

  handleImport = (fields) => {
    this.props.dispatch({
      type:'datadictionary/importclass',
      payload: {
        description: fields.desc,
      },     
    });

    message.success('添加成功');
    this.setState({
      addModalVisible: false,
    });   
  }

  handleEdit = (Id,fields) => {
    this.props.dispatch({
      type:'datadictionary/updateclass',
      payload:{
        Id:Id,
        description:fields,
      },
      callback:function(resp){
        if(resp){
          if(resp.status=="ok"){
            message.success('修改成功');           
          }else{
            message.error(resp.message);
          }
        }
      }
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
          type:'datadictionary/removeclass',
          payload:{
            ids: selectedRows.map(row => row.id).join(','),
          },
        });
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

  render() {
    const { loading } = this.props;
    const { dataList,selectedRows, importModalVisible, addModalVisible, editModalVisible, record } = this.state;
    const { getFieldDecorator } = this.props.form;

    const parentMethods = {
      handleEdit:this.handleEdit,
      handleDelete:this.handleDelete,
      handleSearch:this.handleSearch,
      handleAddModalVisible: this.handleAddModalVisible,
      handleImportModalVisible: this.handleImportModalVisible,
    };

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
            <div >
          {getFieldDecorator('assetclass', {
            initialValue: this.state.data,
          })(<ClassEdit {...parentMethods} />)}
        </div>
          </div>
        </Card>
        <ClassImport
          {...parentMethods}
          modalVisible={importModalVisible}
        />   
        
      </Content>
    );
  }
}
