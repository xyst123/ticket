import React, { useState, useEffect, useRef } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { WingBlank, WhiteSpace, NoticeBar, Card, Icon, Button, Modal, NavBar, Tag, Toast } from 'antd-mobile';
import TicketItem from '@/components/TicketItem';
import PassengerItem from '@/components/PassengerItem';
import Station from '@/pages/Station';
import TicketDate from '@/pages/Date';
import Passenger from './Passenger';
import Seat from './Seat';
import Others from './Others';
import { getRestTickets } from '@/service/ticket';
import { getPassengers } from '@/service/passenger';
import { autoLogin } from '@/service/passport';
import { submitOrder } from '@/service/order';
import { getStorage, setStorage, dateFormat } from '@/utils';
import { getDate } from "@/utils/date";
import { getTime } from "@/utils/others";
import { seatMap } from '@/config/seat';
import { getStation } from '@/utils/station';
import '@/style/Main.less';

interface IProp {
  history: any
}

function Main({ history }: IProp) {
  const passengerRef: React.RefObject<any> = useRef();
  const seatRef: React.RefObject<any> = useRef();
  const othersRef: React.RefObject<any> = useRef();
  const shouldRequireRef: React.RefObject<boolean> = useRef(false);
  const timerRef: React.RefObject<any> = useRef(null);

  const [currentStationType, setCurrentStationType] = useState('from');
  const [showStation, setShowStation] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showPassenger, setShowPassenger] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const [showSeat, setShowSeat] = useState(false);
  const [passengers, setPassengers] = useState([]);

  const [shouldRequire, setShouldRequire] = useState(false);
  const [timer, setTimer] = useState(null);
  const [switchCount, setSwitchCount] = useState(0);
  const currentFromStation = getStation('from');
  const currentToStation = getStation('to');
  const currentDate = getDate();
  const period = parseInt(getStorage('config', 'period', 3))
  const time = getTime();
  const selectedTickets: Ticket.ITicket[] = getStorage('tickets', '', []);
  const selectedSeats: Seat.ISeat[] = getStorage('seats', '', []);
  const selectedPassengers = passengers.filter(passenger => getStorage('passengers', '', []).includes(passenger.allEncStr);

  const handleShowStation = (type: string) => {
    setCurrentStationType(type);
    setShowStation(true)
  }

  const switchStations = () => {
    setStorage('config', { fromStation: currentToStation.id, toStation: currentFromStation.id });
    setStorage('tickets', []);
    setSwitchCount(switchCount + 1)
  }

  const getMatchedTickets = (allTickets: Ticket.ITicket[]) => allTickets.filter(allTicket => {
    const ticketFit = Boolean(selectedTickets.filter(selectedTicket => selectedTicket.id === allTicket.id).length)
    const seatFit = Boolean(selectedSeats.filter(selectedSeat => {
      const rest = allTicket.seats[selectedSeat];
      return rest && rest !== '无' && rest !== '*'
    }).length)
    return ticketFit && seatFit
  })

  const autoGetRestTicketsRes = () => {
    const handleGetRestTicketsRes = async (): Promise<any[]> => {
      const getRestTicketsRes = await Promise.all([getRestTickets({
        'leftTicketDTO.train_date': dateFormat(currentDate, 'yyyy-MM-dd'),
        'leftTicketDTO.from_station': currentFromStation.id,
        'leftTicketDTO.to_station': currentToStation.id,
      }), new Promise(resolve => {
        setTimeout(() => { resolve() }, period * 1000)
      })]);
      const [{ data }] = getRestTicketsRes;
      if (!shouldRequireRef.current) {
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

  const toggleExecute = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      setTimer(null)
    } else {
      if (shouldRequireRef.current) {
        setShouldRequire(false)
      } else {
        const gap = time.getTime() - Date.now();
        if (gap > 0) {
          setTimer(setTimeout(() => {
            setShouldRequire(true)
            setTimer(null)
          }, gap))
        } else {
          setShouldRequire(true)
        }
      }
    }
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
      Toast.loading('加载中', 0);
      await handleGetPassengers();
      Toast.hide()
    })()
  }, []);

  useEffect(() => {
    shouldRequireRef.current = shouldRequire;
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

  useEffect(() => {
    timerRef.current = timer
  }, [timer]);

  return (
    <div>
      <div className="main-header">
        <NavBar
          mode="dark"
          icon={<Icon type="cross" onClick={setShowStation.bind(null, false)} />}
        >
          Ticket
        </NavBar>
        {
          shouldRequire ? (
            <NoticeBar mode="link">
              正在抢票
            </NoticeBar>
          ) : ""
        }
      </div>

      {/* TODO  */}
      <WingBlank className="main-body" style={{ paddingTop: `${shouldRequire ? 96 : 60}px` }}>
        <Card>
          <Card.Header
            title="车次"
            thumb="/images/main/ticket.svg"
            extra={<Icon type="right" />}
            onClick={() => { history.push('/ticket') }}
          />
          <Card.Body className="main-body-ticket">
            <div className="main-body-ticket-station">
              <h3 onClick={handleShowStation.bind(null, 'from')}>{currentFromStation.chinese || '出发地'}</h3>
              <span className="iconfont icon-switch" style={{ transform: `rotate(${switchCount * 180}deg)` }} onClick={switchStations}></span>
              <h3 onClick={handleShowStation.bind(null, 'to')}>{currentToStation.chinese || '目的地'}</h3>
            </div>
            <p className="main-body-ticket-date" onClick={setShowDate.bind(null, true)}>{dateFormat(currentDate, 'yyyy-MM-dd')}</p>
            {selectedTickets.map(selectedTicket => (<TicketItem key={`ticket-${selectedTicket.id}`} ticket={selectedTicket} brief />))}
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
          <TicketDate setShowDate={setShowDate} />
        </Modal>

        <WhiteSpace size="lg" />

        <Card>
          <Card.Header
            title="乘车人"
            thumb="/images/main/passenger.svg"
            extra={<Icon type="right" />}
            onClick={() => setShowPassenger(true)}
          />
          <Card.Body className="main-body-passenger">
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

        <Card>
          <Card.Header
            title="席别"
            thumb="/images/main/seat.svg"
            extra={<Icon type="right" />}
            onClick={() => setShowSeat(true)}
          />
          <Card.Body>
            {selectedSeats.length > 0 ? selectedSeats.map(seat => (<Tag key={`seat-${seat}`} className="main-body-seat-item">{seatMap[seat]}</Tag>)) : <p className="placeholder">请选择席别</p>}
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

        <WhiteSpace size="lg" />

        <Card>
          <Card.Header
            title="配置"
            thumb="/images/main/others.svg"
            extra={<Icon type="right" />}
            onClick={() => setShowOthers(true)}
          />
          <Card.Body>
            <ul className="main-body-others">
              <li>查询余票周期：{period}秒</li>
              <li>抢票开始时间：{dateFormat(time, 'yyyy-MM-dd HH:mm')}</li>
            </ul>
          </Card.Body>
        </Card>

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
              <p key="finish" onClick={() => { othersRef.current.submit(); setShowOthers(false) }}>完成</p>,
            ]}
          >
            选择其他配置
          </NavBar>
          <Others childRef={othersRef} />
        </Modal>
      </WingBlank>
      <div className="main-footer">
        <Button type="primary" onClick={toggleExecute}>{timer ? '等待中' : (shouldRequire ? '停止抢票' : '开始抢票')}</Button>
      </div>
    </div>
  );
}

export default withRouter(Main)
