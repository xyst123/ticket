import React from 'react';
import '@/style/PassengerItem.less';

const getAvatar = (name: string) => {
  if (name.length > 2) {
    return name.substring(name.length - 2)
  }
  return name.substring(1)
}
interface IProp {
  passenger: Passenger.IPassenger
}

export default ({ passenger }: IProp)=>(
  <div className="passenger-item">
    <div className="passenger-item-avatar">{getAvatar(passenger.passenger_name)}</div>
    <p className="passenger-item-name">{passenger.passenger_name}</p>
    <p className="passenger-item-sex">{passenger.sex_name}</p>
    <p className="passenger-item-id">{passenger.passenger_id_no}</p>
  </div>
)