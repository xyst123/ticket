import React, { useState, useCallback, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { NavBar, Icon, List, Checkbox, Toast } from 'antd-mobile';
import TicketItem from '@/components/TicketItem';
import { getRestTickets } from '@/service/ticket'
import { dateFormat, getStorage, setStorage } from '@/utils';
import { getDate } from "@/utils/date";
import { getStation } from '@/utils/station';
import '@/style/Ticket.less';

const { CheckboxItem } = Checkbox;

function Ticket({ title,history }: any) {
  const selectedTickets: Ticket.ITicket[] = getStorage('tickets', '', []);
  const currentFromStation = getStation('from');
  const currentToStation = getStation('to');
  const currentDate = getDate()

  const [tickets, setTickets] = useState<Ticket.ITicket[]>([]);
  const [currentSelectedTickets, setCurrentSelectedTickets] = useState([...selectedTickets]);

  const shouldInitialSelect = useCallback((ticket: Ticket.ITicket) => selectedTickets.some(item => item.train === ticket.train), []);

  const handleSelect = useCallback((ticket: Ticket.ITicket) => {
    let existIndex = -1;
    currentSelectedTickets.forEach((currentSelectedTicket, index) => {
      if (currentSelectedTicket.train === ticket.train) {
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
  }, [currentSelectedTickets])

  const submit = useCallback(() => {
    setStorage('tickets', currentSelectedTickets);
    history.replace('/main')
  }, [currentSelectedTickets])

  useEffect(() => {
    (async () => {
      const handleGetTickets = async () => {
        const getRestTicketsRes = await getRestTickets({
          'leftTicketDTO.train_date': dateFormat(currentDate, 'yyyy-MM-dd'),
          'leftTicketDTO.from_station': currentFromStation.id,
          'leftTicketDTO.to_station': currentToStation.id,
        });
        if (getRestTicketsRes.status) {
          setTickets(getRestTicketsRes.data);
        }
      }
      Toast.loading('加载中', 0);
      await handleGetTickets();
      Toast.hide();
    })();
  }, []);

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
        {title}
      </NavBar>
      <List className="ticket-list">
        {tickets.map(ticket => (
          <CheckboxItem key={`ticket-${ticket.train}`} defaultChecked={shouldInitialSelect(ticket)} onChange={() => handleSelect(ticket)}>
            <TicketItem ticket={ticket} />
          </CheckboxItem>
        ))}
      </List>
    </div>
  );
}

export default withRouter(Ticket)