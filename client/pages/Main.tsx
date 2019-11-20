import React, { useState,useRef } from 'react';
import {  withRouter,Link } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { WingBlank,WhiteSpace,Card,Icon, Button,Modal,NavBar } from 'antd-mobile';
import PersonItem from '../components/PersonItem';
import Station from './Station';
import Date from './Date';
import Passenger from './Passenger';
import {dateFormat} from '../utils/index';
import '../style/Main.less';

function Main ({history}) {
  const passengerRef = useRef();

  const [currentStationType, setCurrentStationType] = useState('from');
  const [showStation, setShowStation] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showPassenger, setShowPassenger] = useState(false);

  const currentStation = useSelector(state => state.station);
  const currentDate = useSelector(state => state.date);
  const selectedPassengers = useSelector(state => state.selectedPassengers);

  const handleShowStation=(type)=>{
    setCurrentStationType(type);
    setShowStation(true)
  }

  return (
    <WingBlank className="otn">
      <Card>
        <Card.Header
          title="基本信息"
          thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
          extra={<Icon type="right" />}
        />
        <Card.Body>
          <h3 onClick={handleShowStation.bind(null,'from')}>{currentStation.from.chinese || '出发地'}</h3>
          <h3 onClick={handleShowStation.bind(null,'to')}>{currentStation.to.chinese || '目的地'}</h3>
          <p onClick={setShowDate.bind(null,true)}>{dateFormat(currentDate,'yyyy-MM-dd')}</p>
          <Button type="primary" onClick={()=>{history.push('/ticket')}}>选择车次</Button>
        </Card.Body>
      </Card>
      <Modal
        popup
        visible={showStation}
        onClose={setShowStation.bind(null,false)}
        animationType="slide-up"
      >
        <NavBar
          className="modal-header"
          mode="dark"
          icon={<Icon type="cross" onClick={setShowStation.bind(null,false)}/>}>{`选择${currentStationType==='to'?'目的':'出发'}地`}</NavBar>
        <Station type={currentStationType} setShowStation={setShowStation}/>
      </Modal>
      <Modal
        popup
        visible={showDate}
        onClose={setShowDate.bind(null,false)}
        animationType="slide-up"
      >
        <NavBar
          className="modal-header"
          mode="dark"
          icon={<Icon type="cross" onClick={setShowStation.bind(null,false)}/>}>选择日期</NavBar>
        <Date setShowDate={setShowDate}/>
      </Modal>
      
      <WhiteSpace size="lg"/>

      <Card onClick={()=>setShowPassenger(true)}>
        <Card.Header
          title="乘车人"
          thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
          extra={<Icon type="right" />}
        />
        <Card.Body>
          {selectedPassengers.length>0?selectedPassengers.map(passenger=>(<PersonItem key={`passenger-${passenger.allEncStr}`} person={passenger}/>)):<p className="placeholder">请选择乘车人</p>}
        </Card.Body>
      </Card>
      <Modal
        popup
        visible={showPassenger}
        onClose={()=>setShowPassenger(false)}
        animationType="slide-up"
      >
        <NavBar
          className="modal-header"
          mode="dark"
          icon={<Icon type="cross" onClick={()=>setShowPassenger(false)}/>}
          rightContent={[
            <p key="finish" onClick={()=>{passengerRef.current.submit();setShowPassenger(false)}}>完成</p>,
          ]}
        >选择乘车人</NavBar>
        <Passenger childRef={passengerRef}/>
      </Modal>

      <WhiteSpace size="lg"/>

      <Link to="/otn/login">
        <Card>
          <Card.Header
            title="配置"
            thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
            extra={<Icon type="right" />}
          />
          <Card.Body>
            <p>请选择乘车人</p>
          </Card.Body>
        </Card>
      </Link>
    </WingBlank>
  );
}

export default withRouter(Main)