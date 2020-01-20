import React, { useState, useImperativeHandle, useCallback } from 'react';
import { List, Checkbox } from 'antd-mobile';
import { getStorage, setStorage } from "@/utils";
import { seatMap } from '@/config/seat';
import '@/style/Seat.less';

const { CheckboxItem } = Checkbox;

interface IProp {
	childRef: React.RefObject<any>
}

export default ({ childRef }: IProp) => {
	const selectedSeats: string[] = getStorage('seats', '', []);

	const [currentSelectedSeats, setCurrentSelectedSeats] = useState([...selectedSeats]);

	const shouldInitialSelect =useCallback((seat: string) => selectedSeats.some(item => item === seat),[]) ;

	const handleSelect =useCallback((seat: string) => {
		let existIndex = -1;
		currentSelectedSeats.forEach((currentSelectedSeat, index) => {
			if (currentSelectedSeat === seat) {
				existIndex = index
			}
		});
		if (existIndex === -1) {
			setCurrentSelectedSeats([...currentSelectedSeats, seat])
		} else {
			const copyCurrentSelectedSeats = [...currentSelectedSeats];
			copyCurrentSelectedSeats.splice(existIndex, 1);
			setCurrentSelectedSeats(copyCurrentSelectedSeats)
		}
	},[currentSelectedSeats]) 

	useImperativeHandle(childRef, () => currentSelectedSeats);

	return (
		<List className="seat">
			{Object.keys(seatMap).map((seat) => (
				<CheckboxItem key={`seat-${seat}`} defaultChecked={shouldInitialSelect(seat)} onChange={() => handleSelect(seat)}>
					{seatMap[seat]}
				</CheckboxItem>
			))}
		</List>
	);
}