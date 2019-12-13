import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { NavBar, Icon, List, Checkbox } from 'antd-mobile';
import TicketItem from '@/components/TicketItem';
import { getRestTickets } from '@/service/ticket'
import { autoLogin } from '@/service/passport';
import { dateFormat, getStorage, setStorage } from '@/utils';
import { getDate } from "@/utils/date";
import '@/style/Ticket.less';

const { CheckboxItem } = Checkbox;

interface IProp {
  history: any
}

function Ticket({ history }: IProp) {
  const selectedTickets: Ticket.ITicket[] = getStorage('tickets', '', []);
  const currentStation = useSelector((state: any) => state.station);
  const currentDate = getDate()

  const [tickets, setTickets] = useState([]);
  const [currentSelectedTickets, setCurrentSelectedTickets] = useState([...selectedTickets]);
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setStorage('tickets', currentSelectedTickets);
    history.goBack()
  }

  useEffect(() => {
    (async () => {
      const handleGetTickets = async () => {
        const getRestTicketsRes = await getRestTickets({
          'leftTicketDTO.train_date': dateFormat(currentDate, 'yyyy-MM-dd'),
          'leftTicketDTO.from_station': currentStation.from.id,
          'leftTicketDTO.to_station': currentStation.to.id,
        });
        if (getRestTicketsRes.status) {
          setTickets(getRestTicketsRes.data);
        }
        else {
          const autoLoginRes = await autoLogin();
          if (autoLoginRes) {
            await handleGetTickets()
          } else {
            history.push('/login')
          }
        }
      }
      setLoading(true);
      await handleGetTickets();
      setLoading(false);
    })();
  }, []);

  const shouldInitialSelect = (ticket: Ticket.ITicket) => selectedTickets.some(item => item.id === ticket.id);

  const handleSelect = (ticket: Ticket.ITicket) => {
    let existIndex = -1;
    currentSelectedTickets.forEach((currentSelectedTicket, index) => {
      if (currentSelectedTicket.id === ticket.id) {
        existIndex = index
      }
    });
    if (existIndex === -1) {
      setCurrentSelectedTickets([...currentSelectedTickets, ticket])
    } else {
      const copyCurrentSelectedTickets = [...currentSelectedTickets];
      copyCurrentSelectedTickets.splice(existIndex, 1);
      setCurrentSelectedTickets(copyCurrentSelectedTickets)
    }
  }

  return (
    <div className="ticket">
      <NavBar
        className="ticket-header"
        mode="dark"
        icon={<Icon onClick={() => { history.goBack() }} type="left" />}
        rightContent={[
          <p key="finish" onClick={submit}>完成</p>
        ]}
      >
        选择车次
      </NavBar>
      <List className="ticket-list">
        {tickets.map(ticket => (
          <CheckboxItem key={`ticket-${ticket.id}`} defaultChecked={shouldInitialSelect(ticket)} onChange={() => handleSelect(ticket)}>
            <TicketItem ticket={ticket} />
          </CheckboxItem>
        ))}
      </List>
    </div>
  );
}

export default withRouter(Ticket)