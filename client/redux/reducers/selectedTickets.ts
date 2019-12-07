const types = {
  SELECTED_TICKETS_CHANGE: 'SELECTED_TICKETS_CHANGE',
}

export function selectedTickets(state = [], action: Store.IAction) {
  switch (action.type) {
    case types.SELECTED_TICKETS_CHANGE:
      return action.payload
    default:
      return state;
  }
}