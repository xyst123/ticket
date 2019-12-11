import { request, handleRes } from "@/utils";

interface IGetTicketsData {
  'leftTicketDTO.train_date': string,
  'leftTicketDTO.from_station': string,
  'leftTicketDTO.to_station': string
}

export const getTickets = async (data: IGetTicketsData): Promise<Common.IRes> => {
  const message = {
    '-1': '获取车次列表失败'
  }
  try {
    const res = await request({
      url: '/otn/api/restTicket/query',
      data: {
        ...data,
        'purpose_codes': 'ADULT',
      }
    })
    const checkRes = handleRes(res, message);
    if (checkRes.status) {
      interface IRes {
        data: {
          map: { [key: string]: string },
          result: string[]
        }
      }
      const { map, result } = (<IRes>res).data;
      return Object.assign({
        data: result.map(ticketString => {
          const ticketArray = ticketString.split('|');
          return {
            secretStr: decodeURIComponent(ticketArray[0]),
            id: ticketArray[2],
            train: ticketArray[3],
            startId: ticketArray[4],
            endId: ticketArray[5],
            fromId: ticketArray[6],
            fromName: map[ticketArray[6]],
            toId: ticketArray[7],
            toName: map[ticketArray[7]],
            fromTime: ticketArray[8],
            toTime: ticketArray[9],
            duration: ticketArray[10],
            available: ticketArray[11],
            leftTicketStr: ticketArray[12],
            date: ticketArray[13],
            seats: {
              // 硬座
              '1': ticketArray[29],
              // 硬卧/二等卧
              '3': ticketArray[28],
              // 软卧/一等卧
              '4': ticketArray[23],
              //  高级软卧
              '6': ticketArray[21],
              // 商务座
              '9': ticketArray[32],
              // 动卧
              F: ticketArray[33],
              // 一等座
              M: ticketArray[31],
              // 二等座
              O: ticketArray[30],
            }
          }
        })
      }, checkRes)
    }
    return checkRes
  } catch (error) {
    return handleRes(error, message)
  }
}