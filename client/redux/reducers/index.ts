import { combineReducers } from 'redux';
import { station } from './station';
import { date } from './date';
import { selectedTickets } from './selectedTickets';
import { selectedPassengers } from './selectedPassengers';

export default combineReducers({
  date,
  station,
  selectedTickets,
  selectedPassengers
});
