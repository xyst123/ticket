import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar } from 'antd-mobile';
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN';
import { setStorage } from "@/utils";
import '@/style/Date.less';

interface IProp {
  setShowDate: (showDate: boolean) => void
}
export default function ({ setShowDate }: IProp) {
  const now = new Date();
  const currentDate = useSelector((state: any) => state.date);
  const dispatch = useDispatch();
  const submit = (date: Date) => {
    setStorage("config", {
      date: date.getTime()
    })
    dispatch({ type: 'DATE_CHANGE', payload: date });
    setShowDate(false)
  }

  return (
    <div className="date-content">
      <Calendar
        visible
        locale={zhCN}
        defaultValue={currentDate}
        minDate={now}
        maxDate={new Date(+now + 29 * 24 * 60 * 60 * 1000)}
        type="one"
        rowSize="normal"
        onSelect={(date) => { submit(date) }}
      />
    </div>
  );
} 