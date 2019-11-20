import React from 'react';
import '../style/TicketItem.less';

function PersonItem ({ticket}) {
  return (
    <div className="person-item">
      <p>{ticket.train}</p>
      <p>{ticket.fromName}{ticket.fromTime}</p>
      <p>{ticket.toName}{ticket.toTime}</p>
      {ticket.seats.map(seat=>(<p>{`${seat.name}：${seat.number}`}</p>))}
    </div>
  );
}

export default PersonItem