import { getStorage } from "@/utils";

const types = {
  DATE_CHANGE: 'DATE_CHANGE'
}

const currentDate = Date.now();
const storageDate = parseInt(getStorage('config', 'date', 0), 10);

export function date(state = new Date(storageDate > currentDate ? storageDate : currentDate), action: Store.IAction) {
  switch (action.type) {
    case types.DATE_CHANGE:
      return action.payload
    default:
      return state;
  }
}