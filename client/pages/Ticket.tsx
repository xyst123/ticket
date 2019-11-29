import React, { useState,useEffect } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import {  withRouter } from 'react-router-dom';
import { NavBar,Icon,List,Checkbox, } from 'antd-mobile';
import TicketItem from '../components/TicketItem';
import { getTickets } from '../service/ticket'
import {dateFormat} from '../utils/index';
import '../style/Ticket.less';

const CheckboxItem = Checkbox.CheckboxItem;

function Ticket({history}) {
  const selectedTickets = useSelector(state => state.selectedTickets)
  const currentStation = useSelector(state => state.station);
  const currentDate = useSelector(state => state.date);

  const [tickets, setTickets] = useState([]);
  const [currentSelectedTickets, setCurrentSelectedTickets] = useState([...selectedTickets]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const getTicketsRes = await getTickets({
        'leftTicketDTO.train_date':dateFormat(currentDate,'yyyy-MM-dd'),
        'leftTicketDTO.from_station':currentStation.from.id,
        'leftTicketDTO.to_station':currentStation.to.id,
      });
      if(getTicketsRes){
        setTickets(getTicketsRes)
      }
      setLoading(false);
    };
    fetchData();
  },[]);

  const shouldInitialSelect=(ticket)=>selectedTickets.some(item=>item.id===ticket.id);

  const handleSelect=(ticket)=>{
    let existIndex=-1;
    currentSelectedTickets.forEach((currentSelectedTicket,index)=>{
      if(currentSelectedTicket.id===ticket.id){
        existIndex=index
      }
    });
    if(existIndex===-1){
      setCurrentSelectedTickets([...currentSelectedTickets,ticket]) 
    }else {
      const copyCurrentSelectedTickets=[...currentSelectedTickets];
      copyCurrentSelectedTickets.splice(existIndex,1);
      setCurrentSelectedTickets(copyCurrentSelectedTickets) 
    }
  }
  
  return (
    <div className="ticket">
      <NavBar
        className="ticket-header"
        mode="dark"
        icon={<Icon onClick={()=>{history.goBack()}} type="left"/>}
        rightContent={[
          <p key="finish" onClick={()=>{dispatch({type:"SELECTED_TICKETS_CHANGE",payload:currentSelectedTickets});history.goBack()}}>完成</p>
        ]}>选择车次
      </NavBar>
      <List className="ticket-list">
        {tickets.map(ticket=>(<CheckboxItem key={`ticket-${ticket.id}`} defaultChecked={shouldInitialSelect(ticket)} onChange={() => handleSelect(ticket)}>
          <TicketItem ticket={ticket}/>
        </CheckboxItem>))}
      </List>
    </div>
  );
}

export default withRouter(Ticket)