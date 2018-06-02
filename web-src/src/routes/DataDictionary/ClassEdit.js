import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider, DatePicker,Icon } from 'antd';
import moment from 'moment';
import styles from './style.less';

export default class ClassEdit extends PureComponent {
  // constructor(props) {
  //   super(props);

    state = {
      selectedRows:this.props.selectedRows,
      data: this.props.value,
      loading: false,
      filterDropdownVisible:false,
      filtered:false,

      searchName:"",
    };
  //}
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        data: nextProps.value,
      });
    }
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  
  cacheOriginData = {};

  toggleEditable = (e, key) => {
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: newData });
    }
  };

  remove(key) {
    const newData = this.state.data.filter(item => item.key !== key);
    this.setState({ data: newData });
    this.props.onChange(newData);

   this.props.handleDelete(key);
  }
  
  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }

  handleFieldChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData });
    }
  }

  saveRow(e, key) {
    e.persist();
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key) || {};
      if (!target.Name || !target.CreateTime || !target.CreateAccount || !target.Memo) {
        message.error('请填写完整信息。');
        e.target.focus();
        this.setState({
          loading: false,
        });
        return;
      }
      //delete target.isNew;
      this.toggleEditable(e, key);
      this.props.onChange(this.state.data);
      this.setState({
        loading: false,
      });
      this.props.handleEdit(key,target);

    }, 500);
  }

  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({ data: newData });
    this.clickedCancel = false;
  }

  //查询
  onInputChange = (e) => {
    this.setState({ searchName:e.target.value});
  }

  handleSearch = (e) => {
    e.preventDefault();
    const name = this.state.searchName;
    this.setState({
      filterDropdownVisible:false,
      filtered: !!name
    });
    const vals = {
      Name:name
    };

    this.props.handleSearch(vals);
  }

  handleRefresh =(e) =>{
    const val = {
      Name:this.state.searchName || ''
    };
    
    this.props.handleSearch(val);
  }

  showTotal = (total) =>{
    return `共${this.state.data.length}条`
  }
 
  render() {
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal:this.showTotal
    };

    const styleRef = {
      marginTop:'-40px',
      display: this.state.loading?"none":"block"
    };


    const columns = [
      {
        title: '编号',
        dataIndex: 'Id',
      },
      {
        title: '资产名称',
        dataIndex: 'Name',
        key: 'Name',
        filterDropdown:(
          <div className={styles.customFilterDropdown}>
           <Input ref={ele => this.searchInput = ele}
           placeholder=""
           value={this.state.searchName}
           autoFocus
           onChange={this.onInputChange}
           onPressEnter={this.handleSearch}
           />
           <Button type="primary" onClick={this.handleSearch}>查询</Button>
           </div>
        ),
        filterIcon:<Icon type="filter" style={{color: this.state.filtered ? '#108ee9' : '#aaa'}} />,
        filterDropdownVisible:this.state.filterDropdownVisible,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            filterDropdownVisible: visible,
          }, () => this.searchInput && this.searchInput.focus());
        },
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'Name', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="资产名称"
              />
            );
          }
          return text;
        },
      },
      {
        title:'创建时间',
        dataIndex:'CreateTime',
        key:'CreateTime',
        render:(val,record) => {           
            if(record.editable){
                return(
                    <DatePicker
                defaultValue={moment(val)}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'CreateTime', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="创建时间"
                />
                );
            }
            return <span>{moment(val).format('YYYY-MM-DD')}</span>;
        },
      },
      {
        title:'创建者',
        dataIndex:'CreateAccount',
        key:'CreateAccount',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'CreateAccount', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="创建者"
              />
            );
          }
          return text;
        },
      },
      {
        title:'备注',
        dataIndex:'Memo',
        key:'Memo',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'Memo', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="备注"
              />
            );
          }
          return text;
        },
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          if (!!record.editable && this.state.loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, record.key)}>添加</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, record.key)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, record.key)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, record.key)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];  

    return (
      <Fragment>
        <Table
        selectedRows={this.state.selectedRows}
          loading={this.state.loading}
          columns={columns}
          dataSource={this.state.data}
          pagination={paginationProps}
          onSelectRow={this.handleSelectRows}
          rowClassName={record => {
            return record.editable ? styles.editable : '';
          }}
        />
        <div style={styleRef}><Button shape="cicle" icon="sync" type="primary" ghost onClick={() => this.handleRefresh()}></Button> </div>
      </Fragment>
    );
  }
}
