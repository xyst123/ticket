import { seatMap } from '@/config/seat'

const types = {
	SELECTED_SEATS_CHANGE: 'SELECTED_TICKETS_CHANGE',
}

export function selectedSeats(state = Object.keys(seatMap), action: Store.IAction) {
	switch (action.type) {
		case types.SELECTED_SEATS_CHANGE:
			return action.payload
		default:
			return state;
	}
}