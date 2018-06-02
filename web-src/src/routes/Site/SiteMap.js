import React, { PureComponent, Fragment } from 'react';
import { render } from 'react-dom';

import { connect } from 'dva';
import { Row, Col, Card, Tooltip, Menu, Dropdown, Icon, Button,Layout } from 'antd';

import Authorized from '../../utils/Authorized';
import styles from './SiteMap.less';

import L from 'leaflet';
import { Map, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import "leaflet/dist/leaflet.css";

const {Content} = Layout;

//把图标重新引入
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.imagePath = ''
L.Icon.Default.mergeOptions({
  	iconRetinaUrl: require('../../assets/markers/marker-icon-2x.png'),
 	  iconUrl: require('../../assets/markers/marker-icon.png'),
  	shadowUrl: require('../../assets/markers/marker-shadow.png')
})

@connect(({ site, loading }) => ({
  site,
  loading: loading.models.site,
}))
export default class SiteMap extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'site/fetch',
    });
  }
  render() {
    const { site:{data}, loading } = this.props;
    
    const position = [22.7047, 113.302];

    const dataList = { data }.data.list;
    let cellPoints = [];

    const sytlep = {
      width:'100%',
    }
    
    dataList.map(item => {
      let lng = Number.parseFloat(item.Lng);
      let lat = Number.parseFloat(item.Lat);
      let name = item.Name;     
      let city = item.City || '';
      let district = item.District || '';
      let Address = item.Address || '';
      let maintainer = item.Maintainer || '';
      let popupDiv = `<div style={stylep}>
      <span>城市：${city}</span>
      <br />
      <span>基站名称：${name}</span>
      <br />
      <span>经度：${lng}</span>
      <br />
      <span>纬度：${lat}</span>
      <br />
      <span>地区：${district}</span>
      <br />
      <span>地址：${Address}</span>
      <br />
      <span>维护人员：${maintainer}</span>
      <br />
      </div>`
      cellPoints.push({position:[lat, lng],popup:popupDiv});
    });
    
    const style= { 
      width: '100%',
      height: '600px',
    }
    const SubMenu = Menu.SubMenu;
    const menu = (
      <Menu>
        <Menu.Item>1st menu item</Menu.Item>
        <Menu.Item>2nd menu item</Menu.Item>
        <SubMenu title="sub menu">
          <Menu.Item>3rd menu item</Menu.Item>
          <Menu.Item>4th menu item</Menu.Item>
        </SubMenu>
        <SubMenu title="disabled sub menu" disabled>
          <Menu.Item>5d menu item</Menu.Item>
          <Menu.Item>6th menu item</Menu.Item>
        </SubMenu>
      </Menu>
    );
    const style1 = {
      margin: '10px 0 0 50px',
      position:"absolute",
      zIndex: 19999,
    };

    const createClusterCustomIcon = function (cluster) {
      return L.divIcon({
        html: `<span>${cluster.getChildCount()}</span>`,
        className: styles.markercustom,
        iconSize: L.point(40, 40, true)
      });
    };

    return (
            <Content>
            <div className="ant-card-bordered" style={style}>
            <div style={style1}>
            <Button.Group>

            <Tooltip title="测量">
            <Button size="small">
              <Icon type="share-alt" />
            </Button>
            </Tooltip>


            <Tooltip title="放大">
            <Button size="small">
              <Icon type="search" />
            </Button>
            </Tooltip>


            <Tooltip title="定位">
            <Button size="small">
              <Icon type="pushpin" />
            </Button>
            </Tooltip>

          <Dropdown overlay={menu}>
            <Tooltip title="切换底图">
            <Button size="small">
              <Icon type="switcher" />
            </Button>
            </Tooltip>
          </Dropdown>
        </Button.Group>
  </div>
  
  <Map className={styles.markercluster} center={position} zoom={13} style={{width: '100%', height: '100%'}}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <MarkerClusterGroup 
    spiderfyDistanceMultiplier={2}
    iconCreateFunction={createClusterCustomIcon}
    markers={cellPoints}   
    />
       
    </Map>
  </div>
            </Content>
    );
  }
}
