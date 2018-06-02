import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon,
   Button, Dropdown, Menu, InputNumber, Switch,
    DatePicker, Modal, message, Badge, Divider,List,Layout } from 'antd';

import styles from './AssetEdit.less';
const { TextArea } = Input;

const FormItem = Form.Item;
const {Content} = Layout;
@Form.create()
export default class AssetEdit extends PureComponent{
  state = {
    disabled:false
  }
  
  render() {
    const {data, record, modalVisible, form, handleEdit, handleModalVisible } = this.props;
    //console.log(record)
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
        xs: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 14 },
      },
    };
    const inputNumStyle = {
      width:'100%'
  };

  const formItemLayout2 = {
    labelCol: {
        xs: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 20 },
    },
};

  return (
    <Modal width="75%"
      title="编辑资产"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => this.props.handleEditModalVisible()}
    >

    <Content>
    <Row gutter={16}>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
            label = "资产名称"> {
                form.getFieldDecorator('Name',{
                    rules:[{required: true, message: '必须输入资产名称'}],
                    initialValue:record.Name
                })(<Input />
            )
            }
      </FormItem>
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
            label = "资产分类"> {
                form.getFieldDecorator('ClassName',{
                    rules:[{required: true, message: '必须输入资产分类'}],
                    initialValue:record.className
                })(<Input />
            )
            }
      </FormItem>
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
            label = "机身码"> {
                form.getFieldDecorator('BodyNumber',{
                    rules:[{required: true, message: '必须输入机身码'}],
                    initialValue:record.BodyNumber
                })(<Input />
            )
            }
      </FormItem>
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
        label = "品牌"> {
                form.getFieldDecorator('Brand',{
                    rules:[{required: true, message: '必须输入资产名称'}],
                    initialValue:record.Brand
                })(<Input />
            )
            }
      </FormItem>
      </Col>
    </Row>

    <Row gutter={16}>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
        label = "型号"> {
                form.getFieldDecorator('Model',{
                    rules:[{required: true, message: '必须输入型号'}],
                    initialValue:record.Model
                })(<Input />
            )
            }
      </FormItem> 
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
        label = "配置"> {
                form.getFieldDecorator('Configure',{
                    rules:[{required: true, message: '必须输入配置'}],
                    initialValue:record.Configure
                })(<Input />
            )
            }
      </FormItem> 
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
            label = "购置日期"> {
                form.getFieldDecorator('PurchaseDate',{   
                  rules:[{required: true, message: '必须选择购置日期'}],               
                    initialValue:Moment(record.PurchaseDate) || ''
                })(<DatePicker showTime format="YYYY-MM-DD" />
            )
            }
        </FormItem>
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
            label = "购置价格"> {
                form.getFieldDecorator('PurchaseValue',{
                  rules:[{required: true, message: '必须输入购置价格'}],
                    initialValue:record.PurchaseValue
                })(<InputNumber style={inputNumStyle}/>
            )
            }
      </FormItem>
      </Col>
    </Row>

    <Row gutter={16}>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
            label = "目前价值"> {
                form.getFieldDecorator('CurrentValue',{
                  rules:[{required: true, message: '必须输入目前价值员'}],
                    initialValue:record.CurrentValue
                })(<InputNumber style={inputNumStyle}/>
            )
            }
      </FormItem>
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
            label = "保修期（月）"> {
                form.getFieldDecorator('Warranty',{
                  rules:[{required: true, message: '必须输入保修期'}],
                    initialValue:record.Warranty
                })(<InputNumber style={inputNumStyle}/>
            )
            }
      </FormItem>        
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
        label = "供应商"> {
                form.getFieldDecorator('Supplier',{
                    rules:[{required: true, message: '必须输入供应商'}],
                    initialValue:record.Supplier
                })(<Input />
            )
            }
      </FormItem> 
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout }
            label = "资产来源" > {
                getFieldDecorator('Source', {
                  rules:[{required: true, message: '必须选择资产来源'}],
                    initialValue: record.source,
                })(
                    <Select style={{ width: '100%' }}>
                    <Select.Option value="1">来源1</Select.Option>
                    <Select.Option value="0">来源2</Select.Option>
                    <Select.Option value="2">来源3</Select.Option>
                  </Select>
                )
            } 
            </FormItem> 
      </Col>
    </Row>

    <Row gutter={16}>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
            label = "入网时间"> {
                form.getFieldDecorator('InNetTime',{  
                  rules:[{required: true, message: '必须选择入网时间'}],                
                    initialValue:Moment(record.InNetTime) || ''
                })(<DatePicker showTime format="YYYY-MM-DD" />
            )
            }
        </FormItem> 
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
        label = "EPC编码"> {
                form.getFieldDecorator('EPC',{
                  rules:[{required: true, message: '必须输入EPC'}],
                    initialValue:record.EPC
                })(<Input disabled="true"/>
            )
            }
      </FormItem> 
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
            label = "更新标签时间"> {
                form.getFieldDecorator('UpdateTime',{                  
                    initialValue:Moment(record.UpdateTime) || ''
                })(<DatePicker showTime format="YYYY-MM-DD" />
            )
            }
        </FormItem> 
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
        label = "存放地点"> {
                form.getFieldDecorator('StorageLocation',{
                  rules:[{required: true, message: '必须输入存放地点'}],
                    initialValue:record.StorageLocation
                })(<Input/>
            )
            }
      </FormItem> 
      </Col>
    </Row>

    <Row gutter={16}>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout }
            label = "使用状态" > {
                getFieldDecorator('UseState', {
                    initialValue: record.UseState,
                })(
                    <Select style={{ width: '100%' }}>
                    <Select.Option value="1">使用中</Select.Option>
                    <Select.Option value="0">闲置</Select.Option>
                    <Select.Option value="2">维修中</Select.Option>
                  </Select>
                )
            } 
            </FormItem> 
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
        label = "维护人员"> {
                form.getFieldDecorator('Maintainer',{
                  rules:[{required: true, message: '必须输入维护人员'}],
                    initialValue:record.Maintainer
                })(<Input />
            )
            }
      </FormItem>  
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
        label = "使用人"> {
                form.getFieldDecorator('User',{
                  rules:[{required: true, message: '必须输入使用人'}],
                    initialValue:record.User
                })(<Input/>
            )
            }
      </FormItem> 
      </Col>
      <Col className="gutter-row" span={6}>
      <FormItem {...formItemLayout}
        label = "使用部门"> {
                form.getFieldDecorator('Department',{               
                    initialValue:record.Department
                })(<Input/>
            )
            }
      </FormItem> 
      </Col>
    </Row>

    <Row gutter={16}>
      <Col className="gutter-row" span={12}>
      <FormItem {...formItemLayout2 }
            label = "备注" > {
                getFieldDecorator('Memo', {
                    rules: [{}],
                    initialValue:record.Memo
                })( <
                    TextArea style = {
                        { minHeight: 32 }
                    }
                    placeholder = "请输入备注"
                    rows = { 4 }
                    />
                )
         } </FormItem> 
      </Col>
    </Row>
   
    </Content>        
           
    </Modal>
  );
  }
}
