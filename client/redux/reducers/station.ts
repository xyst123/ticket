import { getStationById } from '@/utils/station';
import { getStorage } from "@/utils";

const types = {
  FROM_STATION_CHANGE: 'FROM_STATION_CHANGE',
  TO_STATION_CHANGE: 'TO_STATION_CHANGE',
  STATION_TOGGLE: 'STATION_TOGGLE',
  STATION_INIT: 'STATION_INIT'
}

export function station(state = { from: getStationById(getStorage('config', 'fromStation', 'BJP')), to: getStationById(getStorage('config', 'toStation', 'SHH')) }, action: Store.IAction) {
  switch (action.type) {
    case types.FROM_STATION_CHANGE:
      return {
        ...state,
        from: action.payload
      }
    case types.TO_STATION_CHANGE:
      return {
        ...state,
        to: action.payload
      }
    case types.STATION_TOGGLE:
      return {
        from: state.to,
        to: state.from
      }
    default:
      return state;
  }
}