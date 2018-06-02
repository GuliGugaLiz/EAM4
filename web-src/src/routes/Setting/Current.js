import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs, 
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './style.less';

import BaseEdit from './BaseEdit'
import PwdEdit from './PwdEdit'

const FormItem = Form.Item;
const TabPane = Tabs.TabPane; 
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

@connect(({ loading }) => ({
  //submitting: loading.effects['form/submitRegularForm'],
}))
export default class BasicForms extends PureComponent {
  render() {

    return (
   <PageHeaderLayout>
      <div className={styles.card}>
      <Tabs type="card">
        <TabPane tab="基本信息"  key="1">
         <BaseEdit></BaseEdit> 
        </TabPane>

        <TabPane tab="修改密码" key="2">
         <PwdEdit></PwdEdit> 
        </TabPane>
      </Tabs>
      </div>
    </PageHeaderLayout>
    );
  }
}
