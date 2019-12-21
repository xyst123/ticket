const types = {
	IPS_CHANGE: 'IPS_CHANGE',
	IPS_ADD: 'IPS_ADD',
}

export const ip=(state =[], action: Store.IAction)=> {
  switch (action.type) {
    case types.IPS_CHANGE:
			return action.payload
		case types.IPS_ADD:
			return [
				...state,
				action.payload
			] 
    default:
      return state;
  }
}