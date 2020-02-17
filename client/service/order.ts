import { request, handleRes, dateFormat, get, iterateObject } from "@/utils";
import validate from "@/utils/validate";

interface IAlternateData {
  selectedTickets: Ticket.ITicket[],
  selectedPassengers: Passenger.IPassenger[],
  selectedSeats: string[]
}
export const submitAlternate=async (data: IAlternateData):Promise<Common.IRes>=>{
  const message = {
    '-1': '提交候补订单失败',
    '60001':'未匹配到符合筛选条件的车次'
  }
  try{
    const { selectedTickets, selectedPassengers, selectedSeats } = data;
    const alternateConfig:{ticket:string,seat:string,time:Date}[]= [];
    selectedTickets.forEach(selectedTicket=>{
      let seat='';
      if(selectedSeats.length){
        for(let selectedSeat of selectedSeats){
          const rest = selectedTicket.seats[selectedSeat];
          if(rest==='无'){
            seat=selectedSeat;
            break
          }
        }
      }else {
        for(let ticketSeat in selectedTicket.seats){
          const rest=selectedTicket.seats[ticketSeat];
          if(rest==='无'){
            seat=ticketSeat;
            break
          }
        }
      }
      if(seat && alternateConfig.length<3){
        const afterDate=new Date(Date.now()+24*60*60*1000*10);
        const realAfterDate=new Date(
          afterDate.getFullYear(),
          afterDate.getMonth(),
          afterDate.getDate(),
          23,
          30
        );
        const {date,fromTime}=selectedTicket;
        const fromDate=new Date(
          parseInt(date.substring(0,4)),
          parseInt(date.substring(4,6))-1,
          parseInt(date.substring(6)),
          parseInt(fromTime.substring(0,2)),
          parseInt(fromTime.substring(3))
        );
        const realFromDate= new Date(fromDate.getTime()-6*60*60*1000);
        console.log(realAfterDate,realFromDate)
        alternateConfig.push({
          ticket:selectedTicket.id,
          seat,
          time:realAfterDate.getTime()>realFromDate.getTime()?realFromDate:realAfterDate
        })
      }
    })

    if(!alternateConfig.length){
      return handleRes({
        result_code: '60001'
      }, message)
    }

    const submitRes = await request<{ status: boolean }>({
      method: 'POST',
      url: '/otn/api/alternate/confirm',
      type: 'form',
      data: {
        passengerInfo:selectedPassengers.map(selectedPassenger=>`1#${selectedPassenger.passenger_name}#1#${selectedPassenger.passenger_id_no}#${selectedPassenger.allEncStr}#0;`).join(''),
        jzParam:dateFormat(alternateConfig[0].time,'yyyy-MM-dd#HH#mm'),
        hbTrain:alternateConfig.map(ticketAndSeat=>`${ticketAndSeat.ticket},${ticketAndSeat.seat}#`).join(''),
        lkParam:'',
        sessionId:'',
        sig:'',
        scene:'nc_login'	
      }
    });
    const checkSubmitRes = handleRes(submitRes, message)
    if (!checkSubmitRes.status || !submitRes.status) {
      checkSubmitRes.status=false
      return checkSubmitRes;
    }
    const statusRes=await request<{ messages: string[] }>({
      method: 'POST',
      url: '/otn/api/alternate/status',
    });
    return handleRes(statusRes, message)
  }catch(error){
    return handleRes(error, message)
  }
}

interface IOrderData {
  tickets: Ticket.ITicket[],
  date: Date,
  passengers: Passenger.IPassenger[],
  seats: string[]
}
export const submitOrder = async (data: IOrderData): Promise<Common.IRes> => {
  const message = {
    '-1': '提交订单失败',
    '40000': '请填写必要的信息',
    '60001': '您还有未处理的订单',
    '60002': '当前时间不可以订票'
  }
  try {
    const { tickets, date, passengers, seats } = data;
    const passRes = validate.check([
      {
        value: tickets,
        rules: [{
          rule: "isNotEmpty",
          backData: {
            message: "请选择车次"
          }
        }],
      },
      {
        value: passengers,
        rules: [{
          rule: "isNotEmpty",
          backData: {
            message: "请选择乘车人"
          }
        }],
      },
      {
        value: seats,
        rules: [{
          rule: "isNotEmpty",
          backData: {
            message: "请选择席别"
          }
        }],
      },
    ])
    if (!passRes.pass) {
      message['40000'] = get(passRes, "firstError.backData.message", message['40000'])
      return handleRes({
        result_code: '40000'
      }, message)
    }

    // TODO
    const ticket = tickets[0];
    const submitRes = await request<{ messages: string[] }>({
      method: 'POST',
      url: '/otn/api/order/submit',
      type: 'form',
      data: {
        secretStr: ticket.secretStr,
        train_date: dateFormat(date, 'yyyy-MM-dd'),
        back_train_date: dateFormat(new Date(), 'yyyy-MM-dd'),
        query_from_station_name: ticket.fromName,
        query_to_station_name: ticket.toName,
        tour_flag: 'dc',
        purpose_codes: 'ADULT',
        undefined: ''
      }
    })
    const checkSubmitRes = handleRes(submitRes, message)
    if (!checkSubmitRes.status) {
      return checkSubmitRes
    }
    if (submitRes.messages[0]) {
      let code = -1;
      iterateObject(message, (value, key) => {
        if (submitRes.messages[0] === value) {
          code = parseInt(key, 10)
        }
      })
      return {
        status: false,
        code,
        message: submitRes.messages[0]
      }
    }

    const initRes = await request<string>({
      url: '/otn/api/order/init',
    })
    let token = '';
    let info = null;
    initRes.replace(/globalRepeatSubmitToken = '(\S+)'/, (...args) => {
      [, token] = args;
      return initRes
    });
    initRes.replace(/var ticketInfoForPassengerForm=(.+);/, (...args) => {
      info = JSON.parse(args[1].replace(/'/g, '"'));
      return initRes
    });
    const availableSeats: { id: any }[] = get(info, 'limitBuySeatTicketDTO.seat_type_codes', []);
    if (!availableSeats.length) {
      return handleRes(false, message)
    }
    const targetSeat = seats.filter(seat => {
      availableSeats.map(availableSeat => String(availableSeat.id)).includes(seat)
    })[0];
    if (targetSeat === undefined) {
      return handleRes(false, message)
    }

    const checkRes = await request({
      method: 'POST',
      url: '/otn/api/order/check',
      type: 'form',
      data: {
        passengerTicketStr: passengers.map(passenger => `${targetSeat},${passenger.passengerTicketStr}`).join('_'),
        oldPassengerStr: passengers.map(passenger => passenger.oldPassengerStr).join(','),
        REPEAT_SUBMIT_TOKEN: token,
        cancel_flag: 2,
        bed_level_order_num: '000000000000000000000000000000',
        tour_flag: 'dc',
        randCode: '',
        whatsSelect: 1,
        _join_att: ''
      }
    })
    if (!get(checkRes, 'data.submitStatus', false)) {
      return handleRes(false, message)
    }

    const orderInfo = get(info, 'limitBuySeatTicketDTO', {});
    const leftTicketString = get(info, 'leftTicketStr', '');
    const leftTicketInfo = get(info, 'queryLeftTicketRequestDTO', {});
    const trainLocation = get(info, 'train_location', '');
    const keyCheck = get(info, 'key_check_isChange', '');
    const countRes = await request({
      method: 'POST',
      url: '/otn/api/order/count',
      type: 'form',
      data: {
        train_date: date.toString(),
        train_no: leftTicketInfo.train_no,
        stationTrainCode: leftTicketInfo.station_train_code,
        seatType: targetSeat,
        fromStationTelecode: orderInfo.from_station_telecode,
        toStationTelecode: orderInfo.to_station_telecode,
        leftTicket: leftTicketString,
        purpose_codes: leftTicketInfo.purpose_codes,
        train_location: trainLocation,
        REPEAT_SUBMIT_TOKEN: token,
        _json_att: '',
      }
    })
    if (!get(countRes, 'status', false)) {
      return handleRes(false, message)
    }

    const confirmRes = await request({
      method: 'POST',
      url: '/otn/api/order/confirm',
      type: 'form',
      data: {
        passengerTicketStr: passengers.map(passenger => `${targetSeat},${passenger.passengerTicketStr}`).join('_'),
        oldPassengerStr: passengers.map(passenger => passenger.oldPassengerStr).join(','),
        REPEAT_SUBMIT_TOKEN: token,
        purpose_codes: leftTicketInfo.purpose_codes,
        key_check_isChange: keyCheck,
        leftTicketStr: leftTicketString,
        train_location: trainLocation,
        seatDetailType: '000',
        choose_seats: '',
        roomType: '00',
        dwAll: 'N',
        randCode: '',
        whatsSelect: 1,
        _join_att: ''
      }
    })
    if (!get(confirmRes, 'data.submitStatus', false)) {
      return handleRes(false, message)
    }
    return {
      ...handleRes(confirmRes, message),
      data: {
        token
      }
    }
  } catch (error) {
    return handleRes(error, message)
  }
}

export const autoQueryStatus = (token: string) => {
  const handleQueryStatus = async (): Promise<boolean> => {
    const [waitTimeRes] = await Promise.all([request({
      method: 'POST',
      url: '/otn/api/order/waitTime',
      type: 'form',
      data: {
        random: Date.now(),
        tourFlag: 'dc',
        _json_att: '',
        REPEAT_SUBMIT_TOKEN: token
      }
    }), new Promise(resolve => {
      setTimeout(() => { resolve() }, 3000)
    })])
    if (parseInt(get(waitTimeRes, 'data.waitTime', 1)) >= 0) {
      return handleQueryStatus()
    } else {
      return Boolean(get(waitTimeRes, 'data.orderId', null))
    }
  }
  return handleQueryStatus()
}
