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
	type TStationType = 'from' | 'to'
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

declare namespace UserInfo {
	interface IUserInfo {
		user_name: string
	}
}

declare namespace Ticket {
	interface ITicket {
		id: string,
		saleTime: string,
		secretStr: string,
		train: string,
		fromName: string,
		toName: string,
		fromTime: string,
		toTime: string,
		duration: string,
		seats: { [key: string]: string },
		date:string,
	}
}

declare namespace Seat {
	interface ISeat { [key: string]: string }
}

declare namespace User {
	interface IUser {
		username: string,
		password: string
	}
}

declare namespace Common {
	interface IRes {
		status: boolean,
		code: number,
		message: string,
		data?: any
	}
}

interface RefObject<T> {
	current: T
}


