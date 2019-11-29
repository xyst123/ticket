import React, { useState,useRef } from 'react';
import {  withRouter,Link } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { WingBlank,WhiteSpace,Card,Icon, Button,Modal,NavBar } from 'antd-mobile';
import TicketItem from '../components/TicketItem';
import PersonItem from '../components/PersonItem';
import Station from './Station';
import Date from './Date';
import Passenger from './Passenger';
import {submitOrder} from '../service/order'
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
  const selectedTickets = useSelector(state => state.selectedTickets)
  const selectedPassengers = useSelector(state => state.selectedPassengers);

  const handleShowStation=(type)=>{
    setCurrentStationType(type);
    setShowStation(true)
  }

  const submit=()=>{
    let timer;
    const autoGetAvailableTickets=()=>{
      timer=setInterval(async()=>{
        const getTicketsRes = await getTickets({
          'leftTicketDTO.train_date':dateFormat(currentDate,'yyyy-MM-dd'),
          'leftTicketDTO.from_station':currentStation.from.id,
          'leftTicketDTO.to_station':currentStation.to.id,
        });
        const res=await submitOrder({
          tickets:selectedTickets,
          date:currentDate,
          passengers:selectedPassengers,
          seats:['M','0','1','3']
        });
        if(res){
          clearInterval(timer);
          timer=null;
        }
      },5000)
    }
    autoGetAvailableTickets()
  }

  return (
    <WingBlank className="main">
      <Card>
        <Card.Header
          title="基本信息"
          thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
          extra={<Icon type="right" />}
        />
        <Card.Body>
          <div className="main-basic-station">
            <h3 onClick={handleShowStation.bind(null,'from')}>{currentStation.from.chinese || '出发地'}</h3>
            <h3 onClick={handleShowStation.bind(null,'to')}>{currentStation.to.chinese || '目的地'}</h3>
          </div>
          <p onClick={setShowDate.bind(null,true)}>{dateFormat(currentDate,'yyyy-MM-dd')}</p>
          {selectedTickets.map(selectedTicket=>(<TicketItem key={`ticket-${selectedTicket.id}`} ticket={selectedTicket} brief/>))}
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

      <Link to="/login">
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
      <Button type="primary" onClick={submit}>开始抢票</Button>
    </WingBlank>
  );
}

export default withRouter(Main)