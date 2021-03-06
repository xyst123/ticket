import React, { useState, useCallback } from 'react';
import { Calendar } from 'antd-mobile';
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN';
import { setStorage } from "@/utils";
import { getDate } from "@/utils/date";
import '@/style/Date.less';

interface IProp {
  setShowPopup: (showDate: string) => void
}
export default ({ setShowPopup }: IProp) => {
  const now = new Date();
  const [currentDate] = useState(getDate());

  const submit = useCallback((date: Date) => {
    setStorage("config", {
      date: date.getTime()
    })
    setShowPopup('')
  }, [])

  return (
    <div className="date-content">
      <Calendar
        visible
        locale={zhCN}
        defaultValue={[currentDate]}
        minDate={now}
        maxDate={new Date(+now + 29 * 24 * 60 * 60 * 1000)}
        type="one"
        rowSize="normal"
        onSelect={(date) => { submit(date) }}
      />
    </div>
  );
} 