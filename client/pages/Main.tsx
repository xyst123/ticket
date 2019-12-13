import React, { useState, useEffect, useRef } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { WingBlank, WhiteSpace, Card, Icon, Button, Modal, NavBar } from 'antd-mobile';
import TicketItem from '@/components/TicketItem';
import PassengerItem from '@/components/PassengerItem';
import Station from '@/pages/Station';
import Date from '@/pages/Date';
import Passenger from './Passenger';
import Seat from './Seat';
import { getRestTickets } from '@/service/ticket';
import { getPassengers } from '@/service/passenger';
import { autoLogin } from '@/service/passport';
import { submitOrder } from '@/service/order';
import { getStorage, dateFormat } from '@/utils';
import { getDate } from "@/utils/date";
import { seatMap } from '@/config/seat';
import '@/style/Main.less';
import { resolve } from 'dns';

let shouldRequireTag = false;

interface IProp {
  history: any
}

function Main({ history }: IProp) {
  const passengerRef: React.RefObject<any> = useRef();
  const seatRef: React.RefObject<any> = useRef();

  const [currentStationType, setCurrentStationType] = useState('from');
  const [showStation, setShowStation] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showPassenger, setShowPassenger] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const [showSeat, setShowSeat] = useState(false);
  const [passengers, setPassengers] = useState([]);
  const [shouldRequire, setShouldRequire] = useState(false);

  const currentStation = useSelector((state: any) => state.station);
  const currentDate = getDate();
  const selectedTickets: Ticket.ITicket[] = getStorage('tickets', '', []);
  const selectedSeats: Seat.ISeat[] = getStorage('seats', '', []);
  const selectedPassengers = passengers.filter(passenger => getStorage('passengers', '', []).includes(passenger.allEncStr);

  const handleShowStation = (type: string) => {
    setCurrentStationType(type);
    setShowStation(true)
  }

  const getMatchedTickets = (allTickets: Ticket.ITicket[]) => allTickets.filter(allTicket => {
    const ticketFit = Boolean(selectedTickets.filter(selectedTicket => selectedTicket.id === allTicket.id).length)
    const seatFit = Boolean(selectedSeats.filter(selectedSeat => {
      const rest = allTicket.seats[selectedSeat];
      return rest && rest !== '无' && rest !== '*'
    }).length)
    return ticketFit && seatFit
  })

  const autoGetRestTicketsRes = async () => {
    const handleGetRestTicketsRes = async (): Promise<any[]> => {
      const getRestTicketsRes = await Promise.all([getRestTickets({
        'leftTicketDTO.train_date': dateFormat(currentDate, 'yyyy-MM-dd'),
        'leftTicketDTO.from_station': currentStation.from.id,
        'leftTicketDTO.to_station': currentStation.to.id,
      }), new Promise(resolve => {
        setTimeout(() => { resolve() }, 3000)
      })]);
      const { data } = getRestTicketsRes[0];
      if (!shouldRequireTag) {
        return []
      } else if (Array.isArray(data) && getMatchedTickets(data).length) {
        setShouldRequire(false);
        return getMatchedTickets(data);
      } else {
        return handleGetRestTicketsRes()
      }
    };
    return handleGetRestTicketsRes()
  }

  useEffect(() => {
    (async () => {
      const handleGetPassengers = async () => {
        const getPassengersRes = await getPassengers();
        if (getPassengersRes.status) {
          setPassengers(getPassengersRes.data)
        } else {
          const autoLoginRes = await autoLogin();
          if (autoLoginRes) {
            await handleGetPassengers()
          } else {
            history.push('/login')
          }
        }
      }
      await handleGetPassengers();
    })()
  }, []);

  useEffect(() => {
    shouldRequestTag = shouldRequire;
    (async () => {
      if (shouldRequire) {
        const matchedTickets = await autoGetRestTicketsRes();
        if (matchedTickets.length) {
          const submitOrderRes = await submitOrder({
            tickets: matchedTickets,
            date: currentDate,
            passengers: selectedPassengers
          });
          if (submitOrderRes.status) {
            console.log(1111)
          } else {
            console.log(2222)
          }
        }
      }
    })()
  }, [shouldRequire]);

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
            <h3 onClick={handleShowStation.bind(null, 'from')}>{currentStation.from.chinese || '出发地'}</h3>
            <h3 onClick={handleShowStation.bind(null, 'to')}>{currentStation.to.chinese || '目的地'}</h3>
          </div>
          <p onClick={setShowDate.bind(null, true)}>{dateFormat(currentDate, 'yyyy-MM-dd')}</p>
          {selectedTickets.map(selectedTicket => (<TicketItem key={`ticket-${selectedTicket.id}`} ticket={selectedTicket} brief />))}
          <Button type="primary" onClick={() => { history.push('/ticket') }}>选择车次</Button>
        </Card.Body>
      </Card>
      <Modal
        popup
        visible={showStation}
        onClose={setShowStation.bind(null, false)}
        animationType="slide-up"
      >
        <NavBar
          className="modal-header"
          mode="dark"
          icon={<Icon type="cross" onClick={setShowStation.bind(null, false)} />}
        >
          {`选择${currentStationType === 'to' ? '目的' : '出发'}地`}
        </NavBar>
        <Station type={currentStationType} setShowStation={setShowStation} />
      </Modal>
      <Modal
        popup
        visible={showDate}
        onClose={setShowDate.bind(null, false)}
        animationType="slide-up"
      >
        <NavBar
          className="modal-header"
          mode="dark"
          icon={<Icon type="cross" onClick={setShowDate.bind(null, false)} />}
        >
          选择日期
        </NavBar>
        <Date setShowDate={setShowDate} />
      </Modal>

      <WhiteSpace size="lg" />

      <Card onClick={() => setShowPassenger(true)}>
        <Card.Header
          title="乘车人"
          thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
          extra={<Icon type="right" />}
        />
        <Card.Body>
          {selectedPassengers.length > 0 ? selectedPassengers.map(passenger => (<PassengerItem key={`passenger-${passenger.allEncStr}`} passenger={passenger} />)) : <p className="placeholder">请选择乘车人</p>}
        </Card.Body>
      </Card>
      <Modal
        popup
        visible={showPassenger}
        onClose={setShowPassenger.bind(null, false)}
        animationType="slide-up"
      >
        <NavBar
          className="modal-header"
          mode="dark"
          icon={<Icon type="cross" onClick={() => setShowPassenger(false)} />}
          rightContent={[
            <p key="finish" onClick={() => { passengerRef.current.submit(); setShowPassenger(false) }}>完成</p>,
          ]}
        >
          选择乘车人
        </NavBar>
        <Passenger passengers={passengers} childRef={passengerRef} />
      </Modal>

      <WhiteSpace size="lg" />

      <Card onClick={() => setShowSeat(true)}>
        <Card.Header
          title="席别"
          thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
          extra={<Icon type="right" />}
        />
        <Card.Body>
          {selectedSeats.length > 0 ? selectedSeats.map(seat => (<p key={`seat-${seat}`}>{seatMap[seat]}</p>)) : <p className="placeholder">请选择席别</p>}
        </Card.Body>
      </Card>
      <Modal
        popup
        visible={showSeat}
        onClose={setShowSeat.bind(null, false)}
        animationType="slide-up"
      >
        <NavBar
          className="modal-header"
          mode="dark"
          icon={<Icon type="cross" onClick={() => setShowSeat(false)} />}
          rightContent={[
            <p key="finish" onClick={() => { seatRef.current.submit(); setShowSeat(false) }}>完成</p>,
          ]}
        >
          选择席别
        </NavBar>
        <Seat childRef={seatRef} />
      </Modal>



      <Link to="/login">
        <Card>
          <Card.Header
            title="配置"
            thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
            extra={<Icon type="right" />}
          />
          <Card.Body>
            <p>请选择其他配置</p>
          </Card.Body>
        </Card>
      </Link>
      <Modal
        popup
        visible={showOthers}
        onClose={setShowOthers.bind(null, false)}
        animationType="slide-up"
      >
        <NavBar
          className="modal-header"
          mode="dark"
          icon={<Icon type="cross" onClick={setShowOthers.bind(null, false)} />}
          rightContent={[
            <p key="finish" onClick={() => { passengerRef.current.submit(); setShowOthers(false) }}>完成</p>,
          ]}
        >
          选择其他配置
        </NavBar>
        <Passenger childRef={passengerRef} />
      </Modal>

      <Button type="primary" onClick={setShouldRequire.bind(null, !shouldRequire)}>{`${shouldRequire ? '停止' : '开始'}抢票`}</Button>
    </WingBlank>
  );
}

export default withRouter(Main)
