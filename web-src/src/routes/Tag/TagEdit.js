import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon,
   Button, Dropdown, Menu, InputNumber, Switch,
    DatePicker, Modal, message, Badge, Divider,List,Cascader } from 'antd';

import styles from './TagList.less';
const { TextArea } = Input;

const FormItem = Form.Item;
@Form.create()
export default class TagEdit extends PureComponent{
  state = {
    disabled:false,
  }

  render() {
    const {data, record, modalVisible, form, handleEdit, handleModalVisible } = this.props;

    const { getFieldDecorator, getFieldValue } = form;

    const lastState = [{value:'0',label:'未盘点'},{value:'1',label:'在库'},{value:'2',label:'盘亏'}];
    const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      this.props.handleEdit(record.key,fieldsValue);
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
  return (
    <Modal
      title="编辑标签"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => this.props.handleEditModalVisible()}
    >
    <FormItem {...formItemLayout} label="EPC编码">
    {
      getFieldDecorator('EPC', {
          rules: [{
              required: true,
              message: '必须输入EPC编码'
          }, {
              validator: record.EPC
          }],
      })( <Input placeholder = "请输入EPC编码" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout} label="资产名称">
    {
      getFieldDecorator('AssetId', {
          rules: [{
              required: true,
              message: '必须输入资产名称'
          }, {
              validator: record.AssetId
          }],
      })( <Input placeholder = "请输入资产名称" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout} style={{display:'none'}} label="位置">
    {
      getFieldDecorator('SiteName', {
          rules: [{
              required: true,
              message: '必须输入位置'
          }, {
              validator: record.SiteName
          }],
      })( <Input placeholder = "请输入位置" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout} label="更新时间">
       {getFieldDecorator('LastCheck', {
          validator: Moment(record.LastCheck)
       })(
          <DatePicker />
       )}
    </FormItem>

    <FormItem {...formItemLayout} label="状态">
    {getFieldDecorator('LastState',{
      validator:record.LastState,
    })(
      <Select placeholder="请选择" style={{ width: '100%' }}>
      <Select.Option value="0">未盘点</Select.Option>
      <Select.Option value="1">在库</Select.Option>
      <Select.Option value="2">盘亏</Select.Option>
      </Select>
    )}
    </FormItem>

    </Modal>
  );
  }
}
