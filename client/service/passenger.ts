import { request, handleRes } from "@/utils";

export const getPassengers = async (): Promise<Common.IRes> => {
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
        pageSize: 15
      }
    })
    const checkRes = handleRes(res, message);
    if (checkRes.status) {
      interface IRes {
        data: {
          datas: { [key: string]: any }[]
        }
      }
      const { datas } = (<IRes>res).data;
      return {
        ...checkRes,
        data: datas.map(data => ({
          ...data,
          passengerTicketStr: [
            0,
            data.passenger_type,
            data.passenger_name,
            data.passenger_id_type_code,
            data.passenger_id_no,
            data.mobile_no,
            'N',
            data.allEncStr
          ].join(','),
          oldPassengerStr: [
            data.passenger_name,
            data.passenger_id_type_code,
            data.passenger_id_no,
            '1_'
          ].join(',')
        }))
      }
    }
    return checkRes
  } catch (error) {
    return handleRes(error, message)
  }
}