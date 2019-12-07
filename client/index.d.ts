declare namespace Store {
	interface IAction {
		type: string,
		payload: any
	}
}

declare namespace Station {
	interface IStation {
		tag: string,
		chinese: string,
		id: string,
		pinyin: string,
		contraction: string,
		index: string
	}
}

declare namespace Passenger {
	interface IPassenger {
		passenger_name: string,
		sex_name: string,
		passenger_id_no: string,
		allEncStr: string,
		passengerTicketStr: string,
		oldPassengerStr: string
	}
}

declare namespace Ticket {
	interface ITicket {
		train: string,
		fromName: string,
		toName: string,
		fromTime: string,
		toTime: string,
		duration: string,
		seats: {
			name: string,
			number: string
		}[]
	}
}


