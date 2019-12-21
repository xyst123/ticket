import { request } from "@/utils";
import { ips } from '@/config/ips'
interface IGetRestTicketsData {
  'leftTicketDTO.train_date': string,
  'leftTicketDTO.from_station': string,
  'leftTicketDTO.to_station': string,
  ips?: string[],
  selectedTickets?: string[],
  selectedSeats?: string[]
}

export const getRestTickets = (data: IGetRestTicketsData): Promise<Common.IRes> => {
  return request({
    url: '/otn/restTickets',
    data: {
      ...data,
      ips: JSON.stringify(data.ips || []),
      selectedTickets: JSON.stringify(data.selectedTickets || []),
      selectedSeats: JSON.stringify(data.selectedSeats || []),
      'purpose_codes': 'ADULT'
    }
  })
}

export const checkIps = async () => {
  let groupIndex = 0;
  const { length } = ips

  const checkIp = async (): Promise<void> => {
    const ip = ips[groupIndex];
    const res = await request({
      url: '/otn/checkIp',
      data: {
        ip
      }
    })

    if (res) {
      (window as any).availableIps.push(ip);
    }

    groupIndex += 1;
    if (groupIndex < length) {
      requestIdleCallback(checkIp);
    }
  }

  if (!(window as any).availableIps.length) {
    requestIdleCallback(checkIp);
  }
}