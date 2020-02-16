import React from 'react';
import { seatMap } from '@/config/seat';
import {getCrossDays} from '@/utils/ticket';
import '@/style/TicketItem.less';

interface IProp {
  ticket: Ticket.ITicket,
  brief?: boolean
}

const TicketItem = ({ ticket, brief = false }: IProp)=> {
  return brief ?
    (
      <div className="ticket-item__brief">
        <p className="ticket-item__brief-train">{ticket.train}</p>
        <p className="ticket-item__brief-station">{`${ticket.fromName}-${ticket.toName}`}</p>
        <p>{`${ticket.fromTime}-${ticket.toTime}`}</p>
      </div>
    ) :
    (
      <div className="ticket-item-wrapper">
        <div className="ticket-item">
          <div className="ticket-item-station ticket-item-station__left">
            <p className="ticket-item-station-time">{ticket.fromTime}</p>
            <p className="ticket-item-station-name">{ticket.fromName}</p>
          </div>
          <div className="ticket-item-duration">
            <p>{ticket.duration}</p>
            <p className="ticket-item-duration-line" />
            <p>{ticket.train}</p>
          </div>
          <div className="ticket-item-station ticket-item-station__right">
            <p className="ticket-item-station-time">{ticket.toTime}<span>{getCrossDays(ticket.fromTime,ticket.duration)}</span></p>
            <p className="ticket-item-station-name">{ticket.toName}</p>
          </div>
        </div>
        <div className="ticket-item-seat">
          {Object.keys(ticket.seats).filter(seatId => {
            return ticket.seats[seatId]
          }).map(seatId => (
            <p key={`seat-${seatId}`}>
              <span>
                {`${seatMap[seatId]}：`}
              </span>
              <span className={ticket.seats[seatId] === '无' ? '' : 'ticket-item-seat__available'}>{ticket.seats[seatId]}</span>
            </p>
          ))}
        </div>
        {
          ticket.saleTime?(<p className="ticket-item-sale-time">{ticket.saleTime}</p>):''
        }
      </div>
    );
}

export default React.memo(TicketItem);