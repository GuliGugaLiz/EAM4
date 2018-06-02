import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Select,
    Icon,
    Button,
    Dropdown,
    Menu,
    InputNumber,
    Switch,
    DatePicker,
    Modal,
    message,
    Badge,
    Divider
} from 'antd';

import styles from './SiteAdd.less';
const { TextArea } = Input;


const FormItem = Form.Item;
@Form.create()
export default class SiteAdd extends PureComponent {
    state = {
        confirmDirty: false
    };

    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }
    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('pass')) {
            callback('两次密码不一致，请重新输入!');
        } else {
            callback();
        }
    }
    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['cpass'], { force: true });
        }
        callback();
    }

    render() {
        const { record,modalVisible, form, handleAdd, handleModalVisible } = this.props;
        const { getFieldDecorator, getFieldValue } = form;
        const okHandle = () => {
            form.validateFields((err, fieldsValue) => {
                if (err) return;
                form.resetFields();
                this.props.handleAdd(fieldsValue);
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
        return ( <
           // Modal title = title
            Modal title = "新建用户" 
            visible = { modalVisible }
            onOk = { okHandle }
            onCancel = {
                () => this.props.handleAddModalVisible()
            } >
            <
            FormItem labelCol = {
                { span: 5 }
            }
            wrapperCol = {
                { span: 15 }
            }
            label = "用户名" > {
                form.getFieldDecorator('account', {
                    rules: [{ required: true, message: '必须输入用户名' }],
                })( <
                    Input placeholder = "请输入用户名" / >
                )
            } <
            /FormItem>           

            <
            FormItem {...formItemLayout }
            label = "用户角色" > {
                getFieldDecorator('role', {})(
                    <Select placeholder="请选择" style={{ width: '100%' }}>
                    <Option value="0">管理员</Option>
                    <Option value="1">维护人员</Option>
                  </Select>
                )
            } <
            /FormItem>

            <
            FormItem labelCol = {
                { span: 5 }
            }
            wrapperCol = {
                { span: 15 }
            }
            label = "名称" > {
                form.getFieldDecorator('name', {})( <
                    Input placeholder = "请输入名称" / >
                )
            } <
            /FormItem>

            <
            FormItem labelCol = {
                { span: 5 }
            }
            wrapperCol = {
                { span: 15 }
            }
            label = "邮箱" > {
                form.getFieldDecorator('email', {
                    rules: [{
                        type: 'email',
                        message: '请输入正确格式'
                    }, { required: true, message: '请输入邮箱' }],
                })( <
                    Input placeholder = "请输入邮箱" / >
                )
            } <
            /FormItem>

            <
            FormItem labelCol = {
                { span: 5 }
            }
            wrapperCol = {
                { span: 15 }
            }
            label = "手机"> {
                form.getFieldDecorator('phone',{
                    rules:[{}]
                })(<Input placeholder = "请输入手机" />
            )
            }<
            /FormItem>

            <
            FormItem labelCol = {
                { span: 5 }
            }
            wrapperCol = {
                { span: 15 }
            }
            label = "密码" > {
                form.getFieldDecorator('pass', {
                    rules: [{ required: true, message: '必须输入密码' }, {
                        validator: this.validateToNextPassword,
                    }],
                })( <
                    Input type = "password"
                    placeholder = "请输入密码" / >
                )
            } <
            /FormItem>

            <
            FormItem labelCol = {
                { span: 5 }
            }
            wrapperCol = {
                { span: 15 }
            }
            label = "确认密码" > {
                form.getFieldDecorator('cpass', {
                    rules: [{
                        required: true,
                        message: '必须输入确认密码'
                    }, {
                        validator: this.compareToFirstPassword
                    }],
                })( <
                    Input type = "password"
                    onBlur = { this.handleConfirmBlur }
                    placeholder = "请输入确认密码" / >
                )
            } <
            /FormItem> <
            FormItem {...formItemLayout }
            label = "备注" > {
                getFieldDecorator('memo', {
                    rules: [{}],
                })( <
                    TextArea style = {
                        { minHeight: 32 }
                    }
                    placeholder = "请输入备注"
                    rows = { 4 }
                    />
                )
            } <
            /FormItem> < /
            Modal >
        );
    }
}