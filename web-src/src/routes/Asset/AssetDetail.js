import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon,
   Button, Dropdown, Menu, InputNumber, Switch,
    DatePicker, Modal, message, Badge, Divider, List } from 'antd';

import styles from './AssetList.less';

const FormItem = Form.Item;
@Form.create()
export default class AssetEdit extends PureComponent{
    state = {

    }

    render(){
        const {data, record, modalVisible,form } = this.props;

        const formItemLayout = {
          labelCol: {
            xs: { span: 10 },
          },
          wrapperCol: {
            xs: { span: 14 },
          },
        };

        return(
            <Modal  width="70%"
        title="资产详情" 
        visible={modalVisible}
        onOk={() => this.props.handleDetialModalVisible()}
        onCancel={() => this.props.handleDetialModalVisible()}
      >
      <List
      size="small"
      grid={{ gutter: 16, column: 4 }}
      dataSource={data}
      renderItem={item => (
        <List.Item>
         <Input  addonBefore={item.title} defaultValue={item.value}/>  
        </List.Item>
      )}
    />      
        </Modal>
      
        )
    }
}