import React, { useState, useImperativeHandle } from 'react';
import { Stepper, DatePickerView } from 'antd-mobile';
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN';
import { getStorage, setStorage } from "@/utils";
import { getTime } from "@/utils/others";
import '@/style/Others.less';

interface IProp {
  childRef: React.RefObject<any>
}
export default function ({ childRef }: IProp) {
  const now = new Date();

  const [period, setPeriod] = useState(getStorage('config', 'period', 3));
  const [time, setTime] = useState(getTime());

  const periodEdit = (value: number) => {
    setPeriod(value)
  }

  const timeEdit = (date: string[]) => {
    setTime(new Date(`${date[0]}-${parseInt(date[1]) + 1}-${date[2]} ${date[3]}:${date[4]}`));
  }

  useImperativeHandle(childRef, () => ({
    submit() {
      setStorage('config', {
        period,
        time: time.getTime()
      });
    }
  }));

  return (
    <ul className="others">
      <li>
        <h4>查询余票周期（秒）</h4>
        <Stepper
          showNumber
          max={10}
          min={1}
          value={period}
          onChange={periodEdit}
        />
      </li>
      <li>
        <h4>抢票开始时间</h4>
        <DatePickerView
          locale={zhCN}
          minDate={now}
          maxDate={new Date(+now + 29 * 24 * 60 * 60 * 1000)}
          value={time}
          onValueChange={timeEdit}
        />
      </li>
    </ul>
  );
} 