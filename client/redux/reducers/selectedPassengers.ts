const types = {
  SELECTED_PASSENGERS_CHANGE: 'SELECTED_PASSENGERS_CHANGE',
}

export function selectedPassengers(state = [], action: Store.IAction) {
  switch (action.type) {
    case types.SELECTED_PASSENGERS_CHANGE:
      return action.payload
    default:
      return state;
  }
}