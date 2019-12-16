import React, { useState, useImperativeHandle } from 'react';
import { withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { List, Checkbox } from 'antd-mobile';
import { getStorage, setStorage } from "@/utils";
import { seatMap } from '@/config/seat';
import '@/style/Seat.less';

const { CheckboxItem } = Checkbox;

interface IProp {
	childRef: React.RefObject<any>
}

const Seat = ({ childRef }: IProp) => {
	const selectedSeats: string[] = getStorage('seats', '', []);

	const [currentSelectedSeats, setCurrentSelectedSeats] = useState([...selectedSeats]);

	useImperativeHandle(childRef, () => ({
		submit() {
			setStorage('seats', currentSelectedSeats);
		}
	}));

	const shouldInitialSelect = (seat: string) => selectedSeats.some(item => item === seat);

	const handleSelect = (seat: string) => {
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
	}

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

export default withRouter(Seat)