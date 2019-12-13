import React, { useState, useImperativeHandle } from 'react';
import { withRouter } from 'react-router-dom';
import { List, Checkbox } from 'antd-mobile';
import PassengerItem from '@/components/PassengerItem';
import { getStorage, setStorage } from "@/utils";
import '@/style/Passenger.less';

const { CheckboxItem } = Checkbox;

interface IProp {
  history: any,
  passengers: Passenger.IPassenger[],
  childRef: React.RefObject<any>
}

export default ({ passengers, childRef }: IProp) => {
  const selectedPassengers: Passenger.IPassenger[] = passengers.filter(passenger => getStorage('passengers', '', []).includes(passenger.allEncStr))

  const [currentSelectedPassengers, setCurrentSelectedPassengers] = useState([...selectedPassengers]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(childRef, () => ({
    submit() {
      setStorage('passengers', currentSelectedPassengers.map(currentSelectedPassenger => currentSelectedPassenger.allEncStr));
    }
  }));

  const shouldInitialSelect = (passenger: Passenger.IPassenger) => selectedPassengers.some(item => item.allEncStr === passenger.allEncStr);

  const handleSelect = (passenger: Passenger.IPassenger) => {
    let existIndex = -1;
    currentSelectedPassengers.forEach((currentSelectedPassenger, index) => {
      if (currentSelectedPassenger.allEncStr === passenger.allEncStr) {
        existIndex = index
      }
    });
    if (existIndex === -1) {
      setCurrentSelectedPassengers([...currentSelectedPassengers, passenger])
    } else {
      const copyCurrentSelectedPassengers = [...currentSelectedPassengers];
      copyCurrentSelectedPassengers.splice(existIndex, 1);
      setCurrentSelectedPassengers(copyCurrentSelectedPassengers)
    }
  }

  return (
    <List className="passenger">
      {passengers.map((passenger: Passenger.IPassenger) => (
        <CheckboxItem key={`passenger-${passenger.allEncStr}`} defaultChecked={shouldInitialSelect(passenger)} onChange={() => handleSelect(passenger)}>
          <PassengerItem passenger={passenger} />
        </CheckboxItem>
      ))}
    </List>
  );
}