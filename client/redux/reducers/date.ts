const types = {
  DATE_CHANGE: 'DATE_CHANGE'
}

export function date(state = new Date(), action) {
  switch (action.type) {
    case types.DATE_CHANGE:
      return action.payload
    default:
      return state;
  }
}