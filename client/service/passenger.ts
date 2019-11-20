import { request, handleRes } from "../utils";

export async function getPassengers() {
  const message = {
    '-1': '获取乘车人列表失败'
  }
  try {
    const res = await request({
      method: 'POST',
      url: '/otn/api/passenger/query',
      type: 'form',
      data: {
        pageIndex: 1,
        pageSize:15
      }
    })
    if(handleRes(res,message)){
      return res.data.datas.map(data=>{
        return Object.assign({
          passengerTicketStr:[
            null,
            data.passenger_flag,
            data.passenger_type,
            data.passenger_name,
            null,
            data.passenger_id_no,
            data.mobile_no,
            null,
            data.allEncStr
          ].join(','),
          oldPassengerStr:[
            data.passenger_name,
            null,
            data.passenger_id_no,
            null]
        },data)
      })
    }
    window.location.href="/login";
    return false
  } catch (error) {
    return handleRes(error, message)
  }
}