import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Moment from 'moment';
import fetch from 'dva/fetch';
//import jsonp from 'jsonp';
import querystring from 'querystring';
import { Row, Col, Card, Form, Input, Select, Icon,
   Button, Dropdown, Menu, InputNumber, Switch,
    DatePicker, Modal, message, Badge, Divider,List, Spin } from 'antd';

import debounce from 'lodash/debounce';

import styles from './TagReaderList.less';

const { TextArea } = Input;

const FormItem = Form.Item;
const Option = Select.Option;


@connect(({ reader, loading }) => ({
  reader,
  loading: loading.models.reader,
}))
@Form.create()
export default class ReaderEdit extends PureComponent{

  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.fetchUser = debounce(this.fetchSite, 800);
  }

  state = {
    siteId: 0,
    siteName: '',
    data: [],
    fetching: false,

    recordId: 0,
    record: {}
  }

  componentWillReceiveProps(nextProps) {
      const id = nextProps.editRecordId;
      if(id != null &&id != this.state.recordId){
            this.setState({
              recordId: id
          });
      const { dispatch } = this.props;
      dispatch({
        type: 'reader/get',
        payload: {
          id:id 
        },
        callback: (resp) =>{
          if(resp){
            if(resp.status=="ok"){
              const rec = resp.record;
             this.setState({
                record: rec,
                siteId: rec.SiteId,
                siteName: rec.SiteName,
              });
            }else {
              message.error(resp.message);
            }
          }
        }
      });
      }
  }

  fetchSite= (value) => {
    //console.log('fetching user', value);
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ siteName: value, data: [], fetching: true });
    const { dispatch } = this.props;
      dispatch({
        type: 'site/search',
        payload: {
          query:value
        },
        callback: (resp) =>{
            if(resp && resp.status=="ok" && resp.results){
              const data = resp.results.map(it => ({
                text: `${it.Name}`,
                value: it.Id,
              }));
              this.setState({ data, fetching: false });
            }else {
              this.setState({ data:[], fetching: false });
            }
        }
      });
  }

  handleSelect=(val, opt) => {
    const name = opt.props.children;
    this.setState({
      siteName: name,
      siteId: val,
      data: [],
      fetching: false,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let me = this;
        this.props.dispatch({
          type: 'reader/update',
          payload: {
            Id: this.state.recordId,
            SiteId: parseInt(this.state.siteId),
            ...values
          },
          callback:  function(resp){
            if(resp){
              if(resp.status=="ok"){
                message.success('修改成功');
                me.setState({
                  uploading: false,
                });
                me.props.form.resetFields();
                me.props.handleEditModalVisible(false);
              }else {
                message.error(resp.message);
                me.setState({
                  uploading: false,
                });
              }
            }
          }
        });
      }
    });
  }

  render() {
    const { editModalVisible, form, handleEdit, handleEditModalVisible } = this.props;
    const { record, siteName ,fetching, data } = this.state;

    const { getFieldDecorator, getFieldValue } = form;

const formItemLayout = {
  labelCol: {
    xs: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 15 },
  },
};
const inputNumStyle = {
    width:'100%'
};
  return (
    <Modal
      title="编辑读卡器信息"
      visible={editModalVisible}
      onOk={this.handleSubmit}
      onCancel={() => this.props.handleEditModalVisible()}
    >
        <FormItem
          {...formItemLayout}
          label="读卡器编号"
        >
          <span className="ant-form-text">{record.ReaderId}</span>
        </FormItem>
    <FormItem {...formItemLayout} 
    label="所在基站"
    key='SiteName'
    >
    {/*
        <Select
        mode="combobox"
        //allowClear=true
        style={{ width: '100%' }}
        placeholder="请选择所在位置"
        value={this.state.SiteName}
        defaultValue={record.SiteName}
        onChange={this.handleChange}
    >
        {children}
    </Select>
    */}
    <Select
        mode="combobox"
        //labelInValue
        value={siteName}
       style={{ width: '100%' }}
        placeholder="请选择所在位置"
        notFoundContent={fetching ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={this.fetchSite}
        //onChange={this.handleChange}
        onSelect = {this.handleSelect}
      >
        {data.map(d => <Option key={d.value}>{d.text}</Option>)}
      </Select>
    </FormItem>   

    <FormItem {...formItemLayout }
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
    } 
    </FormItem> 

    </Modal>
  );
  }
}
