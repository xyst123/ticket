import { request, handleRes } from "@/utils";

interface IGetTicketsData {
  'leftTicketDTO.train_date': string,
  'leftTicketDTO.from_station': string,
  'leftTicketDTO.to_station': string
}
export async function getTickets(data: IGetTicketsData) {
  const message = {
    '-1': '获取车次列表失败'
  }
  try {
    const res = await request({
      url: '/otn/restTicket/query',
      data: {
        ...data,
        'purpose_codes': 'ADULT',
      }
    })
    if (handleRes(res, message)) {
      interface IRes {
        data: {
          map: { [key: string]: string },
          result: string[]
        }
      }
      const { map, result } = (<IRes>res).data;
      return result.map(ticketString => {
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
          seats: [
            {
              name: '动卧',
              number: ticketArray[33]
            },
            {
              name: '商务座',
              number: ticketArray[32]
            },
            {
              name: '一等座',
              number: ticketArray[31]
            },
            {
              name: '二等座',
              number: ticketArray[30]
            },
            {
              name: '高级软卧',
              number: ticketArray[21]
            },
            {
              name: '软卧',
              number: ticketArray[23]
            },
            {
              name: '软座',
              number: ticketArray[24]
            },
            {
              name: '硬卧',
              number: ticketArray[28]
            },
            {
              name: '硬座',
              number: ticketArray[29]
            },
            {
              name: '无座',
              number: ticketArray[26]
            },
            {
              name: '其他',
              number: ticketArray[22]
            },
          ].filter(seat => seat.number)
        }
      })
    }
    window.location.href = "/login";
    return false
  } catch (error) {
    return handleRes(error, message)
  }
}