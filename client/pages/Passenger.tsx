import React, { useState,useCallback, useImperativeHandle } from 'react';
import { List, Checkbox } from 'antd-mobile';
import PassengerItem from '@/components/PassengerItem';
import { getStorage, setStorage } from "@/utils";
import '@/style/Passenger.less';

const { CheckboxItem } = Checkbox;

interface IProp {
  passengers: Passenger.IPassenger[],
  childRef: React.RefObject<any>
}

export default ({ passengers, childRef }: IProp) => {
  const selectedPassengers: Passenger.IPassenger[] = passengers.filter(passenger => getStorage('passengers', '', []).includes(passenger.allEncStr))

  const [currentSelectedPassengers, setCurrentSelectedPassengers] = useState([...selectedPassengers]);

  const shouldInitialSelect =useCallback((passenger: Passenger.IPassenger) => selectedPassengers.some(item => item.allEncStr === passenger.allEncStr),[]) ;

  const handleSelect =useCallback((passenger: Passenger.IPassenger) => {
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
  },[currentSelectedPassengers])

  useImperativeHandle(childRef, () => ({
    submit() {
      setStorage('passengers', currentSelectedPassengers.map(currentSelectedPassenger => currentSelectedPassenger.allEncStr));
    }
  }));

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