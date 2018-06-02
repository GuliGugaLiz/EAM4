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

import styles from './UserEdit.less';
const { TextArea } = Input;


const FormItem = Form.Item;
@Form.create()
export default class UserEdit extends PureComponent {
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
        const { record,modalVisible, form, handleEdit, handleModalVisible } = this.props;
        console.log(record)
        const { getFieldDecorator, getFieldValue } = form;
        const okHandle = () => {
            form.validateFields((err, fieldsValue) => {
                if (err) return;
                form.resetFields();
                this.props.handleEdit(record.key,fieldsValue);
            });
        };
        const formItemLayout = {
            labelCol: {
                xs: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 16 },
            },
        };
        const formItemLayout2 = {
            labelCol: {
                xs: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 20 },
            },
        };

        const style = {
            right:'4px'
        };
        return ( <
            Modal title = "编辑用户" 
            visible = { modalVisible }
            onOk = { okHandle }
            onCancel = {
                () => this.props.handleEditModalVisible()
            } >

            <Row gutter={24}>
            <Col span={12}>
            <FormItem {...formItemLayout}
            label = "用户名" >             
            <span className="ant-form-text" style={{color:'black'}}>{record.account}</span>
             </FormItem> 
            </Col>
            </Row>

            <Row gutter={24}>
            <Col span={12}>
            <FormItem {...formItemLayout}
            label = "昵称" > {
                form.getFieldDecorator('Name', {initialValue:record.name})( <
                    Input placeholder = "请输入昵称" / >
                )
            } 
            </FormItem>
            </Col>
            
            <Col span={12}>
            <FormItem {...formItemLayout}

            label = "用户角色" > {
                getFieldDecorator('Role', { initialValue:record.role })(
                    <Select placeholder="请选择" style={{ width: '100%' }}>
                    <Select.Option value="0">管理员</Select.Option>
                    <Select.Option value="1">普通用户</Select.Option>
                    <Select.Option value="2">维护人员</Select.Option>
                  </Select>
                )
            } </FormItem>
            
            </Col>
            </Row>

            <Row gutter={24}>
            <Col span={12}>
            <FormItem {...formItemLayout}
            label = "邮箱" > {
                form.getFieldDecorator('Email', {
                    rules: [{
                        type: 'email',
                        message: '请输入正确格式'
                    }, { required: true, message: '请输入邮箱' }],
                    initialValue:record.email
                })( <
                    Input placeholder = "请输入邮箱" / >
                )
            } 
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem {...formItemLayout}
            label = "手机"> {
                form.getFieldDecorator('Phone',{
                    rules:[{}],
                    initialValue:record.phone
                })(<Input placeholder = "请输入手机" />
            )
            } </FormItem>
            </Col>
            </Row>

            <Row gutter={24}>
            <Col span={24}>
            <FormItem {...formItemLayout2}
            style={style}
            label = "密码" > {
                form.getFieldDecorator('Pass', {
                    rules: [{ required: true, message: '必须输入密码' }, {
                        validator: this.validateToNextPassword,
                    }],
                    
                })( <
                    Input type = "password"
                    placeholder = "请输入密码" / >
                )
            } </FormItem>
            </Col>
            </Row>
            <Row gutter={24}>
            <Col span={24}>
            <FormItem {...formItemLayout2}
            style={style}
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
            } 
            </FormItem> 
            </Col>
            </Row>

            <Row gutter={24}>
            <Col span={24}>
            <FormItem {...formItemLayout2 }
            style={style}
            label = "备注" > {
                getFieldDecorator('Memo', {
                    rules: [{}],
                    initialValue:record.memo
                })( <
                    TextArea style = {
                        { minHeight: 32 }
                    }
                    placeholder = "请输入备注"
                    rows = { 4 }
                    />
                )
            } 
            </FormItem> 
            </Col>
            </Row>

            </ Modal >
        );
    }
}