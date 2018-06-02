import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs, 
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from '../Setting/style.less';

import SiteList from './SiteList'
import SiteMap from './SiteMap'

const FormItem = Form.Item;
const TabPane = Tabs.TabPane; 

@connect(({ loading }) => ({
}))
export default class SiteForms extends PureComponent {
  render() {

    return (
   <PageHeaderLayout>
      <div className={styles.card}>
      <Tabs type="card">
        <TabPane tab="基站列表"  key="1">
         <SiteList></SiteList> 
        </TabPane>

        <TabPane tab="基站地图" key="2">
         <SiteMap></SiteMap> 
        </TabPane>
      </Tabs>
      </div>
    </PageHeaderLayout>
    );
  }
}
