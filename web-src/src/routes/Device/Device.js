import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs, 
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from '../Setting/style.less';

import DeviceFile from './DeviceFile'
import DeviceList from './DeviceList'
import DeviceHeartbeat from './DeviceHeartbeat'

const FormItem = Form.Item;
const TabPane = Tabs.TabPane; 
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

@connect(({ loading }) => ({
  //submitting: loading.effects['form/submitRegularForm'],
}))
export default class DeviceForms extends PureComponent {
  render() {

    return (
   <PageHeaderLayout>
      <div className={styles.card}>
      <Tabs type="card">
        <TabPane tab="上报文件"  key="1">
         <DeviceFile></DeviceFile> 
        </TabPane>

        <TabPane tab="设备列表" key="2">
         <DeviceList></DeviceList> 
        </TabPane>

        <TabPane tab="设备心跳" key="3">
         <DeviceHeartbeat></DeviceHeartbeat> 
        </TabPane>
      </Tabs>
      </div>
    </PageHeaderLayout>
    );
  }
}
