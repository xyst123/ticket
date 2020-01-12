import React from 'react';
import { getFirstName } from '@/utils';
import '@/style/PassengerItem.less';

interface IProp {
  passenger: Passenger.IPassenger
}

export default ({ passenger }: IProp) => (
  <div className="passenger-item">
    <div className="passenger-item-avatar">{getFirstName(passenger.passenger_name)}</div>
    <p className="passenger-item-name">{passenger.passenger_name}</p>
    <p className="passenger-item-sex">{passenger.sex_name}</p>
    <p className="passenger-item-id">{passenger.passenger_id_no}</p>
  </div>
)