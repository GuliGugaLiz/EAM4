import React, { PureComponent,Fragment } from 'react';
import { connect } from 'dva';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs, Alert, 
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
  submitting: loading.effects['user/updatepwd'],
}))
@Form.create()
export default class PwdEdit extends PureComponent {
  state = {
    confirmDirty:false
  };

 componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/resetStatus',
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
}
compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('newpass')) {
        callback('两次密码不一致，请重新输入!');
    } else {
        callback();
    }
}
validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
        form.validateFields(['cnewpass'], { force: true });
    }
    callback();
}
  handlePwdSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'user/updatePwd',
          payload: values,
        });
      }
    });
  }

  render() {
    const { user: { currentPwd,respStatus }, loading } = this.props;
    const { submitting } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const data = currentPwd;

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

    const msg= !respStatus.message?null:( 
      <div className={styles.tableError}>
        <Alert
          message={
            <Fragment>
              {respStatus.message}
            </Fragment>
          }
          type="error"
          showIcon
        />
      </div>)

    return (
          <Form
            onSubmit={this.handlePwdSubmit}
            hideRequiredMark
            style={{ marginTop: 2 }}
          >
          {msg}
            <FormItem
              {...formItemLayout}
              label="旧密码"
            >
              {getFieldDecorator('oldpass', {
                rules: [{
                  required: true, message: '请输入旧密码',
                }],
              })(
                <Input type="password" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="新密码"
            >
              {getFieldDecorator('newpass', {
                rules: [{
                  required: true, message: '请输入新密码',
                },{
                  validator:this.compareToNextPassword
                }],
              })(
                <Input  type="password"/>
              )}
            </FormItem>
 
            <FormItem
              {...formItemLayout}
              label="确认密码"
            >
              {getFieldDecorator('cnewpass', {
                rules: [{
                  required: true, message: '请输入确认密码',
                },{
                  validator: this.compareToFirstPassword
              }],
              })(
                <Input  type="password"
                onBlur = {this.handleConfirmBlur} />
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
