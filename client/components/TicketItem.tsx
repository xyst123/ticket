import React from 'react';
import '../style/TicketItem.less';

function PersonItem ({ticket,brief=false}) {
  return brief?(
    <div className="ticket-item__brief">
      <p>{ticket.train}</p>
      <p>{`${ticket.fromName}-${ticket.toName}`}</p>
      <p>{`${ticket.fromTime}-${ticket.toTime}`}</p>
    </div>
  ):(
    <div className="ticket-item-wrapper">
      <div className="ticket-item">
        <div className="ticket-item-station ticket-item-station__left">
          <p className="ticket-item-station-time">{ticket.fromTime}</p>
          <p className="ticket-item-station-name">{ticket.fromName}</p>
        </div>
        <div className="ticket-item-duration">
          <p>{ticket.duration}</p>
          <p className="ticket-item-duration-line"></p>
          <p>{ticket.train}</p>
        </div>
        <div className="ticket-item-station ticket-item-station__right">
          <p className="ticket-item-station-time">{ticket.toTime}</p>
          <p className="ticket-item-station-name">{ticket.toName}</p>
        </div>
      </div>
      <div className="ticket-item-seat">
        {ticket.seats.map(seat=>(<p><span>{seat.name} </span><span className={seat.number==='无'?'':'ticket-item-seat__available'}>{seat.number}</span></p>))}
      </div>
    </div>
  );
}

export default PersonItem