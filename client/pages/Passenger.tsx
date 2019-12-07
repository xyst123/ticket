import React, { useState, useEffect, useImperativeHandle } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { List, Checkbox } from 'antd-mobile';
import PassengerItem from '@/components/PassengerItem';
import { getPassengers } from '@/service/passenger';
import '@/style/Passenger.less';

const { CheckboxItem } = Checkbox;

interface IProp {
  childRef: React.RefObject<any>
}

export default function ({ childRef }: IProp) {
  const selectedPassengers: Passenger.IPassenger[] = useSelector((state: any) => state.selectedPassengers)

  const [passengers, setPassengers] = useState([]);
  const [currentSelectedPassengers, setCurrentSelectedPassengers] = useState([...selectedPassengers]);

  const dispatch = useDispatch();
  useImperativeHandle(childRef, () => ({
    submit() {
      dispatch({ type: "SELECTED_PASSENGERS_CHANGE", payload: currentSelectedPassengers });
    }
  }));

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPassengers();
      if (data) {
        setPassengers(data);
      }
    };
    fetchData();
  }, []);

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