import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs, Alert
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './style.less';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane; 
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

@connect(({ user, loading }) => ({
  user,
  loading: loading.models.user,
  submitting: loading.effects['user/updateCurrent'],
}))
@Form.create()
export default class BaseEdit extends PureComponent {
  state = {
    confirmDirty:false
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchCurrentInfo',
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
}

  handleBaseSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'user/updateCurrent',
          payload: values,
        });
      }
    });
  }
  render() {
    const { user: { currentEdit }, loading } = this.props;
    const { submitting } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const data = currentEdit;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 2 },
      },
    };
    const msg= !data.message?null:( 
        <div className={styles.tableError}>
          <Alert
            message={
              <Fragment>
                {data.message}
              </Fragment>
            }
            type="error"
            showIcon
          />
        </div>)

    return (
          <Form
            onSubmit={this.handleBaseSubmit}
            hideRequiredMark
            style={{ marginTop: 2 }}
          >
          {msg}
            <FormItem
              {...formItemLayout}
              label="账号"
            >
              {getFieldDecorator('Account', {
                rules: [{
                  required: true, message: '请输入账号',
                }],
                initialValue: data.Account,
              })(
                <Input placeholder="" disabled={true} />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="名称"
            >
              {getFieldDecorator('Name', {
                rules: [{
                  required: true, message: '请输入名称',
                }],
                initialValue: data.Name,
              })(
                <Input />
              )}
            </FormItem>
 
 
            <FormItem
              {...formItemLayout}
              label="邮箱"
            >
              {getFieldDecorator('Email', {
                rules: [{
                  type:'email',message:'请输入正确格式'
                },{
                  required: true, message: '请输入邮箱',
                }],
                initialValue:data.Email,
              })(
                <Input />
              )}
            </FormItem>

            <FormItem
              {...formItemLayout}
              label="手机号码"
            >
              {getFieldDecorator('Phone', {
                rules: [{
                  required: true, message: '请输入手机号码',
                }],
                initialValue: data.Phone,
              })(
                <Input />
              )}
            </FormItem>

            <FormItem {...submitFormLayout} style={{ marginTop: 16 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
              保存
              </Button>
            </FormItem>
          </Form>
    );
  }
}
