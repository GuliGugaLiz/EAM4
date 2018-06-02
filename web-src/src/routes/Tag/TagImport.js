import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon,
   Button, Dropdown, Menu, InputNumber, Switch,
    DatePicker, Modal, message, Upload, Divider } from 'antd';

import styles from './TagImport.less';
const { TextArea } = Input;


const FormItem = Form.Item;
@Form.create()
export default class TagImport extends PureComponent{
  state = {
    fileList: [],
    displayUpButton: true,
    uploading: false,
  }

  render() {
    const { modalVisible, form, handleAdd, handleModalVisible } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      this.props.handleAdd(fieldsValue);
    });

    const { fileList } = this.state;
    if(fileList.length == 0)return;
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files[]', file);
    });

    this.setState({
      uploading: true,
    });

    // You can use any AJAX library you like
    reqwest({
      method: 'post',
      processData: false,
      data: formData,
      success: () => {
        this.setState({
          fileList: [],
          uploading: false,
        });
        message.success('upload successfully.');
      },
      error: () => {
        this.setState({
          uploading: false,
        });
        message.error('upload failed.');
      },
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
      title="导入标签"
      okText="导入"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => this.props.handleAddModalVisible()}
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
