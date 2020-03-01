import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { withRouter } from 'react-router-dom';
import { WingBlank, WhiteSpace, NoticeBar, Card, Icon, Button, Modal, NavBar, Tag, Toast } from 'antd-mobile';
import useConstant from '@/hooks/constant';
import useLocalStorage from '@/hooks/localStorage';
import TicketItem from '@/components/TicketItem';
import PassengerItem from '@/components/PassengerItem';
import Station from './Station';
import TicketDate from './Date';
import Passenger from './Passenger';
import Seat from './Seat';
import Others from './Others';
import { getRestTickets } from '@/service/ticket';
import { getPassengers } from '@/service/passenger';
import { getUserInfo } from '@/service/user';
import { autoLogin } from '@/service/passport';
import { submitAlternate, submitOrder, autoQueryStatus } from '@/service/order';
import { getStorage, setStorage, dateFormat, getRandom, getFirstName, delay } from '@/utils';
import { getStation } from '@/utils/station';
import { getDate } from "@/utils/date";
import { getTime } from "@/utils/others";
import { seatMap } from '@/configs/seat';
import '@/style/Main.less';

const usePassengersAndUserInfo = (history: any): [Passenger.IPassenger[], UserInfo.IUserInfo] => {
  const [passengers, setPassengers] = useState<Passenger.IPassenger[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo.IUserInfo>({ user_name: "" });

  useEffect(() => {
    (async () => {
      const handleGetPassengers = async () => {
        const [getPassengersRes, getUserInfoRes] = await Promise.all([getPassengers(), getUserInfo()]);
        if (getPassengersRes.status && getUserInfoRes.status) {
          setPassengers(getPassengersRes.data);
          setUserInfo(getUserInfoRes.data)
        } else {
          const autoLoginRes = await autoLogin();
          if (autoLoginRes) {
            await handleGetPassengers()
          } else {
            history.push({
              pathname: '/login',
              query: { redirect: '/main' }
            })
          }
        }
      }
      Toast.loading('加载中', 0);
      await handleGetPassengers();
      Toast.hide();
    })()
  }, []);

  return [passengers, userInfo]
}

const Main: React.FC<any> = ({ title, history }) => {
  const passengerRef: RefObject<any> = useRef();
  const seatRef: RefObject<any> = useRef();
  const othersRef: RefObject<any> = useRef();
  const requireCountRef: RefObject<number> = useRef(0);
  const [timer, getTimerConstant, setTimer] = useConstant<any>(null);
  const [shouldRequire, getShouldRequireConstant, setShouldRequire] = useConstant(false);
  const [passengers, userInfo] = usePassengersAndUserInfo(history);
  const [selectedTickets, setSelectedTickets] = useLocalStorage<Ticket.ITicket[]>('tickets', '', []);
  const [selectedPassengerIds, setSelectedPassengerIds] = useLocalStorage<string[]>('passengers', '', []);
  const [selectedSeats, setSelectedSeats] = useLocalStorage<string[]>('seats', '', []);
  const [showPopup, setShowPopup] = useState('');

  const [currentStationType, setCurrentStationType] = useState<Station.TStationType>('from');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [hasSubmit, setHasSubmit] = useState(false);
  const [switchCount, setSwitchCount] = useState(0);
  interface IModal {
    visible: boolean,
    title: string,
    text: string,
    footer: {
      text: string,
      onPress: (...args: any[]) => void | Promise<any>
    }[]
  }
  const defaultModal = {
    visible: false,
    title: '',
    text: '',
    footer: []
  };
  const [modal, setModal] = useState<IModal>(defaultModal);

  const currentFromStation = getStation('from');
  const currentToStation = getStation('to');
  const time = getTime();
  const currentDate = getDate();
  const alternate = getStorage('config', 'alternate', false);
  const period = parseInt(getStorage('config', 'period', 3));
  const ipNumber = parseInt(getStorage('config', 'ipNumber',
    3));

  // 衍生值
  const selectedPassengers = useMemo(() => passengers.filter(passenger => selectedPassengerIds.includes(passenger.allEncStr)), [passengers, selectedPassengerIds]);

  const handleShowStation = useCallback((type: Station.TStationType) => {
    setCurrentStationType(type);
    setShowPopup('station')
  }, []);

  const switchStations = useCallback(() => {
    setStorage('config', { fromStation: currentToStation.id, toStation: currentFromStation.id });
    setSelectedTickets('tickets', [])
    setSwitchCount(switchCount + 1)
  }, [switchCount])

  const getIps = useCallback((number: number): string[] => {
    const ips = [];
    const { availableIps } = (window as any);
    const availableIpsCopy = [...availableIps];
    for (let index = 0; index < number; index += 1) {
      const length = availableIpsCopy.length;
      ips.push(availableIpsCopy.splice(getRandom(0, length - 1), 1)[0])
    }
    return ips
  }, []);

  const getTimeout = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const hours = now.getHours();
    const startTime = hours >= 23 ? new Date(year, month, date + 1, 7) : new Date(year, month, date, 7);
    return startTime.getTime() - now.getTime()
  }, [])

  const handleSetMessage = useCallback((message: string) => {
    setMessage(getShouldRequireConstant() ? message : '')
  }, [shouldRequire]);

  const showError = useCallback((type: string) => {
    return hasSubmit && errors[type]
  }, [hasSubmit, errors])

  const toggleExecute = useCallback(() => {
    if (timer) {
      clearTimeout(getTimerConstant());
      setTimer(null)
    } else {
      setHasSubmit(true);
      if (shouldRequire) {
        setShouldRequire(false)
      } else if (Object.values(errors).every(item => !item)) {
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
  }, [timer, shouldRequire, errors]);

  const autoGetRestTicketsRes = useCallback(() => {
    const handleSubmitAlternateRes = async (selectedTickets: Ticket.ITicket[]): Promise<any> => {
      handleSetMessage(`正在添加候补订单`);
      const submitAlternateRes = await submitAlternate({
        selectedTickets,
        selectedPassengers,
        selectedSeats
      });
      const { status } = submitAlternateRes;
      if (status) {
        handleSetMessage(`添加候补订单成功，请到订单列表查看`);
      } else {
        handleSetMessage(`添加候补订单失败`);
      }
      return delay(handleGetRestTicketsRes, period * 1000)
    }

    const handleGetRestTicketsRes = async (): Promise<any[]> => {
      if (!getShouldRequireConstant()) {
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
          return delay(requireCountRef.current === 1 && alternate ? handleSubmitAlternateRes.bind(null, data) : handleGetRestTicketsRes, period * 1000)
        }
      }
    };

    return handleGetRestTicketsRes()
  }, [selectedPassengers])

  useEffect(() => {
    const stopCodes: { [key: number]: boolean } = {
      40000: true,
      60001: true,
    }
    const autoSubmit = async (): Promise<void> => {
      if (shouldRequire) {
        const hour = new Date().getHours()
        if (hour > 7 && hour < 23) {
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
                  onPress: () => { setModal(defaultModal) }
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
              onPress: () => {
                setModal(defaultModal);
                setTimer(setTimeout(() => {
                  setShouldRequire(true)
                  setTimer(null)
                }, getTimeout()))
              }
            }, {
              text: '取消',
              onPress: () => {
                setModal(defaultModal)
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
    setErrors({
      selectedTickets: !selectedTickets.length,
      selectedPassengers: !selectedPassengers.length,
      selectedSeats: !selectedSeats.length
    })
  }, [selectedTickets, passengers, selectedPassengerIds, selectedSeats]);

  return (
    <div>
      <div className="main-header">
        <NavBar
          mode="dark"
          icon={<Icon type="left" onClick={() => { history.push('/login') }} />}
          rightContent={[
            <div key="username" className="main-header-username" onClick={() => { history.push('/login') }}>{getFirstName(userInfo.user_name)}</div>,
          ]}
        >
          {title}
        </NavBar>
        {
          message ? (
            <NoticeBar marqueeProps={{ loop: true, style: { padding: '0 2vw' } }}>{message}</NoticeBar>
          ) : ''
        }
      </div>

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
            <p className="main-body-ticket-date" onClick={setShowPopup.bind(null, 'date')}>{dateFormat(currentDate, 'yyyy-MM-dd')}</p>
            {selectedTickets.length > 0 ? selectedTickets.map(selectedTicket => (<TicketItem key={`ticket-${selectedTicket.id}`} ticket={selectedTicket} brief />)) : <p className={showError('selectedTickets') ? "error-text" : "placeholder"}>请选择车次</p>}
          </Card.Body>
        </Card>
        <Modal
          popup
          visible={showPopup === 'station'}
          onClose={setShowPopup.bind(null, '')}
          animationType="slide-up"
        >
          <NavBar
            className="modal-header"
            mode="dark"
            icon={<Icon type="cross" onClick={setShowPopup.bind(null, '')} />}
          >
            {`选择${currentStationType === 'to' ? '目的' : '出发'}地`}
          </NavBar>
          <Station type={currentStationType} setShowPopup={setShowPopup} />
        </Modal>
        <Modal
          popup
          visible={showPopup === 'date'}
          onClose={setShowPopup.bind(null, '')}
          animationType="slide-up"
        >
          <NavBar
            className="modal-header"
            mode="dark"
            icon={<Icon type="cross" onClick={setShowPopup.bind(null, '')} />}
          >
            选择日期
          </NavBar>
          <TicketDate setShowPopup={setShowPopup} />
        </Modal>

        <WhiteSpace size="lg" />

        <Card>
          <Card.Header
            title="乘车人"
            thumb="/images/main/passenger.svg"
            extra={<Icon type="right" />}
            // @ts-ignore
            onClick={() => setShowPopup('passenger')}
          />
          <Card.Body className="main-body-passenger">
            {selectedPassengers.length > 0 ? selectedPassengers.map(passenger => (<PassengerItem key={`passenger-${passenger.allEncStr}`} passenger={passenger} />)) : <p className={showError('selectedPassengers') ? "error-text" : "placeholder"}>请选择乘车人</p>}
          </Card.Body>
        </Card>
        <Modal
          popup
          visible={showPopup === 'passenger'}
          onClose={setShowPopup.bind(null, '')}
          animationType="slide-up"
        >
          <NavBar
            className="modal-header"
            mode="dark"
            icon={<Icon type="cross" onClick={setShowPopup.bind(null, '')} />}
            rightContent={[
              <p key="finish" onClick={() => {
                setSelectedPassengerIds('passengers', passengerRef.current); setShowPopup('')
              }}>完成</p>,
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
            onClick={() => setShowPopup('seat')}
          />
          <Card.Body>
            {selectedSeats.length > 0 ? selectedSeats.map(seat => (<Tag key={`seat-${seat}`} className="main-body-seat-item">{seatMap[seat]}</Tag>)) : <p className={showError('selectedSeats') ? "error-text" : "placeholder"}>请选择席别</p>}
          </Card.Body>
        </Card>
        <Modal
          popup
          visible={showPopup === 'seat'}
          onClose={setShowPopup.bind(null, '')}
          animationType="slide-up"
        >
          <NavBar
            className="modal-header"
            mode="dark"
            icon={<Icon type="cross" onClick={setShowPopup.bind(null, '')} />}
            rightContent={[
              <p key="finish" onClick={() => { setSelectedSeats('seats', seatRef.current); setShowPopup('') }}>完成</p>,
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
            onClick={() => setShowPopup('others')}
          />
          <Card.Body>
            <ul className="main-body-others">
              <li>候补优先：{alternate ? '是' : '否'}</li>
              <li>查询余票周期：{period}秒</li>
              <li>每次请求ip数：{ipNumber}</li>
              <li>抢票开始时间：{dateFormat(time, 'yyyy-MM-dd HH:mm')}</li>
            </ul>
          </Card.Body>
        </Card>

        <Modal
          popup
          visible={showPopup === 'others'}
          onClose={setShowPopup.bind(null, '')}
          animationType="slide-up"
        >
          <NavBar
            className="modal-header"
            mode="dark"
            icon={<Icon type="cross" onClick={setShowPopup.bind(null, '')} />}
            rightContent={[
              <p key="finish" onClick={() => { othersRef.current.submit(); setShowPopup('') }}>完成</p>,
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
        onClose={() => { setModal(defaultModal) }}
        title={modal.title}
        footer={modal.footer}
      >
        <p>{modal.text}</p>
      </Modal>
    </div>
  );
}

export default withRouter(Main)