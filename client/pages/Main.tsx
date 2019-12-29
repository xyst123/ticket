import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { WingBlank, WhiteSpace, NoticeBar, Card, Icon, Button, Modal, NavBar, Tag, Toast } from 'antd-mobile';
import TicketItem from '@/components/TicketItem';
import PassengerItem from '@/components/PassengerItem';
import Station from './Station';
import TicketDate from './Date';
import Passenger from './Passenger';
import Seat from './Seat';
import Others from './Others';
import { getRestTickets } from '@/service/ticket';
import { getPassengers } from '@/service/passenger';
import { autoLogin } from '@/service/passport';
import { submitOrder, autoQueryStatus } from '@/service/order';
import { getStorage, setStorage, dateFormat, getRandom } from '@/utils';
import { getStation } from '@/utils/station';
import { getDate } from "@/utils/date";
import { getTime } from "@/utils/others";
import { seatMap } from '@/config/seat';
import '@/style/Main.less';

interface IProp {
  history: any
}

function Main({ history }: IProp) {
  const passengerRef: RefObject<any> = useRef();
  const seatRef: RefObject<any> = useRef();
  const othersRef: RefObject<any> = useRef();
  const shouldRequireRef: RefObject<boolean> = useRef(false);
  const timerRef: RefObject<any> = useRef(null);
  const requireCountRef: RefObject<number> = useRef(0);

  const [currentStationType, setCurrentStationType] = useState<Station.TStationType>('from');
  const [showStation, setShowStation] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Ticket.ITicket[]>([]);
  const [showPassenger, setShowPassenger] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const [showSeat, setShowSeat] = useState(false);
  const [passengers, setPassengers] = useState<Passenger.IPassenger[]>([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [hasSubmit, setHasSubmit] = useState(false);
  const [shouldRequire, setShouldRequire] = useState(false);
  const [timer, setTimer] = useState<any>(null);
  const [switchCount, setSwitchCount] = useState(0);
  interface IModal {
    visible: boolean,
    title: string,
    text: string,
    footer: {
      text: string,
      onPress: Function
    }[]
  }
  const [modal, setModal] = useState<IModal>({
    visible: false,
    title: '',
    text: '',
    footer: []
  });

  const currentFromStation = getStation('from');
  const currentToStation = getStation('to');
  const currentDate = getDate();
  const period = parseInt(getStorage('config', 'period', 3));
  const ipNumber = parseInt(getStorage('config', 'ipNumber',
    3));
  const time = getTime();
  const selectedSeats: string[] = getStorage('seats', '', []);
  const selectedPassengers = passengers.filter(passenger => getStorage('passengers', '', []).includes(passenger.allEncStr));

  const handleShowStation = (type: Station.TStationType) => {
    setCurrentStationType(type);
    setShowStation(true)
  }

  const switchStations = () => {
    setStorage('config', { fromStation: currentToStation.id, toStation: currentFromStation.id });
    setStorage('tickets', []);
    setSwitchCount(switchCount + 1)
  }

  const closeModal=()=>{
    setModal({
      ...modal,
      visible:false
    })
  }

  const getIps = (number: number): string[] => {
    const ips = [];
    const { availableIps } = (window as any);
    const availableIpsCopy = [...availableIps];
    for (let index = 0; index < number; index += 1) {
      const length = availableIpsCopy.length;
      ips.push(availableIpsCopy.splice(getRandom(0, length - 1), 1)[0])
    }
    return ips
  };

  const getTimeout=()=>{
    const now=new Date();
    const year=now.getFullYear();
    const month=now.getMonth();
    const date=now.getDate();
    const hours=now.getHours();
    const startTime= hours>=23 ? new Date(year, month, date+1, 7) : new Date(year, month, date, 7);
    return startTime.getTime()-now.getTime()
  }

  const handleSetMessage = (message: string) => {
    setMessage(shouldRequire ? message : '')
  }

  const autoGetRestTicketsRes = () => {
    const handleGetRestTicketsRes = async (): Promise<any[]> => {
      if (!shouldRequireRef.current) {
        return []
      } else {
        handleSetMessage(`正在进行第${requireCountRef.current += 1}次抢票`);
        const getRestTicketsRes = await getRestTickets({
          'leftTicketDTO.train_date': dateFormat(currentDate, 'yyyy-MM-dd'),
          'leftTicketDTO.from_station': currentFromStation.id,
          'leftTicketDTO.to_station': currentToStation.id,
          ips: getIps(ipNumber),
          selectedTickets: selectedTickets.map(selectedTicket => selectedTicket.id),
          selectedSeats
        });
        const { status, data } = getRestTicketsRes;
        if (status) {
          return data;
        } else {
          await new Promise(resolve => {
            setTimeout(() => { resolve() }, period * 1000)
          })
          return handleGetRestTicketsRes()
        }
      }
    };
    return handleGetRestTicketsRes()
  }

  const toggleExecute = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      setTimer(null)
    } else {
      setHasSubmit(true);
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
      setSelectedTickets(getStorage('tickets', '', []))
      const handleGetPassengers = async () => {
        const getPassengersRes = await getPassengers();
        if (getPassengersRes.status) {
          setPassengers(getPassengersRes.data)
        } else {
          const autoLoginRes = await autoLogin();
          if (autoLoginRes) {
            await handleGetPassengers()
          } else {
            history.push({
              pathname:'/login',
              query:{redirect:'/main'}
            })
          }
        }
      }
      Toast.loading('加载中', 0);
      await handleGetPassengers();
      Toast.hide();
    })()
  }, []);

  useEffect(() => {
    const stopCodes: { [key: number]: boolean } = {
      40000: true,
      60001: true,
    }
    shouldRequireRef.current = shouldRequire;
    const autoSubmit = async (): Promise<void> => {
      if (shouldRequire) {
        const hour=new Date().getHours()
        if(hour>7 && hour<23){
          const matchedTickets = await autoGetRestTicketsRes();
          if (matchedTickets.length) {
            handleSetMessage(`正在提交订单`);
            const submitOrderRes = await submitOrder({
              tickets: matchedTickets,
              date: currentDate,
              passengers: selectedPassengers,
              seats: selectedSeats
            });
            if (submitOrderRes.status) {
              handleSetMessage(`正在排队`);
              const autoQueryStatusRes = await autoQueryStatus(submitOrderRes.data);
              if (autoQueryStatusRes) {
                requireCountRef.current = 0
                handleSetMessage(`提交订单成功`);
                setShouldRequire(false)
              } else {
                handleSetMessage(`提交订单失败`);
                return autoSubmit();
              }
            } else if (stopCodes[submitOrderRes.code]) {
              setShouldRequire(false);
              setMessage(``);
              setModal({
                visible: true,
                title: '出错啦',
                text: submitOrderRes.message,
                footer: [{
                  text: '确定',
                  onPress: closeModal
                }]
              });
            } else {
              handleSetMessage(`提交订单失败`);
              autoSubmit();
            }
          }
        }
        else {
          setShouldRequire(false);
          setModal({
            visible: true,
            title: '系统维护中',
            text: '将在7:00自动抢票',
            footer: [{
              text: '确定',
              onPress: ()=>{
                closeModal();
                setTimer(setTimeout(() => {
                  setShouldRequire(true)
                  setTimer(null)
                }, getTimeout()))
              }
            },{
              text: '取消',
              onPress:()=>{
                closeModal()
              } 
            }]
          });
        }
      }
      else {
        requireCountRef.current = 0;
        setMessage(``);
      }
    }
    autoSubmit()
  }, [shouldRequire]);

  useEffect(() => {
    timerRef.current = timer
  }, [timer]);

  useEffect(() => {
    if (hasSubmit && !showPassenger && !showSeat) {
      setErrors({
        selectedTickets: !selectedTickets.length,
        selectedPassengers: !selectedPassengers.length,
        selectedSeats: !selectedSeats.length
      })
    }
  }, [hasSubmit, selectedTickets, showPassenger, showSeat]);

  return (
    <div>
      <div className="main-header">
        <NavBar
          mode="dark"
          icon={<Icon type="left" onClick={()=>{history.push('/login')}} />}
        >
          Ticket
        </NavBar>
        {
          message ? (
            <NoticeBar marqueeProps={{ loop: true, style: { padding: '0 2vw' } }}>{message}</NoticeBar>
          ) : ''
        }
      </div>

      {/* TODO  */}
      <WingBlank className="main-body" style={{ paddingTop: `${message ? 25.6 : 16}vw` }}>
        <Card>
          <Card.Header
            title="车次"
            thumb="/images/main/ticket.svg"
            extra={<Icon type="right" />}
            // @ts-ignore
            onClick={() => { history.push('/ticket') }}
          />
          <Card.Body className="main-body-ticket">
            <div className="main-body-ticket-station">
              <h3 onClick={handleShowStation.bind(null, 'from')}>{currentFromStation.chinese || '出发地'}</h3>
              <span className="iconfont icon-switch" style={{ transform: `rotate(${switchCount * 180}deg)` }} onClick={switchStations}></span>
              <h3 onClick={handleShowStation.bind(null, 'to')}>{currentToStation.chinese || '目的地'}</h3>
            </div>
            <p className="main-body-ticket-date" onClick={setShowDate.bind(null, true)}>{dateFormat(currentDate, 'yyyy-MM-dd')}</p>
            {selectedTickets.length > 0 ? selectedTickets.map(selectedTicket => (<TicketItem key={`ticket-${selectedTicket.id}`} ticket={selectedTicket} brief />)) : <p className={errors.selectedTickets ? "error-text" : "placeholder"}>请选择车次</p>}
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
            // @ts-ignore
            onClick={() => setShowPassenger(true)}
          />
          <Card.Body className="main-body-passenger">
            {selectedPassengers.length > 0 ? selectedPassengers.map(passenger => (<PassengerItem key={`passenger-${passenger.allEncStr}`} passenger={passenger} />)) : <p className={errors.selectedPassengers ? "error-text" : "placeholder"}>请选择乘车人</p>}
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
            // @ts-ignore
            onClick={() => setShowSeat(true)}
          />
          <Card.Body>
            {selectedSeats.length > 0 ? selectedSeats.map(seat => (<Tag key={`seat-${seat}`} className="main-body-seat-item">{seatMap[seat]}</Tag>)) : <p className={errors.selectedSeats ? "error-text" : "placeholder"}>请选择席别</p>}
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
            // @ts-ignore
            onClick={() => setShowOthers(true)}
          />
          <Card.Body>
            <ul className="main-body-others">
              <li>查询余票周期：{period}秒</li>
              <li>每次请求ip数：{ipNumber}</li>
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

      <Modal
        visible={modal.visible}
        transparent
        onClose={closeModal}
        title={modal.title}
        footer={modal.footer}
      >
        <p>{modal.text}</p>
      </Modal>
    </div>
  );
}

export default withRouter(Main)
