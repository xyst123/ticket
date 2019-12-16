import { request, handleRes, dateFormat, get } from "@/utils";

interface IData {
  tickets: Ticket.ITicket[],
  date: Date,
  passengers: Passenger.IPassenger[],
}

export const submitOrder = async (data: IData): Promise<Common.IRes> => {
  const message = {
    'success': '提交订单成功',
    '-1': '提交订单失败'
  }
  const { tickets, date, passengers } = data;
  try {
    const ticket = tickets[0];
    const submitRes = await request({
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

    const initRes = await request({
      url: '/otn/api/order/init',
    })
    let token = '';
    let info = null;
    (<string>initRes).replace(/globalRepeatSubmitToken = '(\S+)'/, (...args: any[]) => {
      [, token] = args;
      return (<string>initRes)
    });
    (<string>initRes).replace(/var ticketInfoForPassengerForm=(.+);/, (...args: any[]) => {
      info = JSON.parse(args[1].replace(/'/g, '"'));
      return (<string>initRes)
    });
    const availableSeats = get(info, 'limitBuySeatTicketDTO.seat_type_codes', []);
    if (!availableSeats.length) {
      return handleRes(false, message)
    }

    const checkRes = await request({
      method: 'POST',
      url: '/otn/api/order/check',
      type: 'form',
      data: {
        passengerTicketStr: passengers.map(passenger => `${availableSeats[0].id},${passenger.passengerTicketStr}`).join('_'),
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
        seatType: availableSeats[0].id,
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
        passengerTicketStr: passengers.map(passenger => `${availableSeats[0].id},${passenger.passengerTicketStr}`).join('_'),
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
    return handleRes(confirmRes, message)
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
