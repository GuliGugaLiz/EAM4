import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon,
   Button, Dropdown, Menu, InputNumber, Switch,
    DatePicker, Modal, message, Upload, Divider } from 'antd';

import styles from './AssetImport.less';
const { TextArea } = Input;


const FormItem = Form.Item;
@connect(({ asset, loading }) => ({
  asset,
  loading: loading.models.asset,
}))
@Form.create()
export default class AssetImport extends PureComponent{
  state = {
    fileList: [],
    displayUpButton: true,
    uploading: false,
  }

  render() {
    const { modalVisible, form, handleAdd, handleModalVisible } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const okHandle = () => {
      //let me = this;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { fileList } = this.state;
      if(fileList.length == 0)return;
      this.setState({
        uploading: true,
      });
      let data = new FormData();
      data.append('file', fileList[0]);
      let me = this;
      this.props.dispatch({
        type:'asset/import',
        payload: data,     
        callback:  function(resp){
          if(resp){
            if(resp.status=="ok"){
              message.success('导入成功');
              me.setState({
                uploading: false,
              });
              form.resetFields();
              me.props.handleAddModalVisible(false);
              me.props.handleImportSuccess();
            }else {
              message.error(resp.message);
              me.setState({
                uploading: false,
              });
            }
          }
        }
      });
    });
  };

    const formItemLayout = {
      labelCol: {
        xs: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 15 },
      },
    };
    const props = {
      onRemove: (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
            displayUpButton: true,
          };
        });
      },
      beforeUpload: (file) => {
        if(this.state.fileList.length == 1){
          return false;
        }
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file],
          displayUpButton: false,
        }));
        return false;
      },
      fileList: this.state.fileList,
    };
    const bdisabled = this.state.displayUpButton?false:true;
  return (
    <Modal
      title="导入资产"
      okText="导入"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => this.props.handleAddModalVisible(false)}
    >
      <FormItem
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="选择文件"
      >
       <Upload {...props}>
          <Button disabled={bdisabled}>
            <Icon type="upload" /> 选择文件
          </Button>
        </Upload>
      </FormItem>
    </Modal>
  );
  }
}