import React, { useState, useCallback, useImperativeHandle } from 'react';
import {Switch, Stepper, DatePickerView } from 'antd-mobile';
import { getStorage, setStorage } from "@/utils";
import { getTime } from "@/utils/others";
import '@/style/Others.less';

interface IProp {
  childRef: React.RefObject<any>
}

export default ({ childRef }: IProp) => {
  const now = new Date();
  const [alternate, setAlternate] = useState(getStorage('config', 'alternate', false));
  const [period, setPeriod] = useState(getStorage('config', 'period', 3));
  const [ipNumber, setIpNumber] = useState(getStorage('config', 'ipNumber', 3));
  const [time, setTime] = useState(getTime());

  const timeEdit = useCallback((date: string[]) => {
    setTime(new Date(`${date[0]}-${parseInt(date[1]) + 1}-${date[2]} ${date[3]}:${date[4]}`));
  }, [])

  useImperativeHandle(childRef, () => ({
    submit() {
      setStorage('config', {
        alternate,
        period,
        ipNumber,
        time: time.getTime()
      });
    }
  }));

  return (
    <ul className="others">
      <li>
        <h4>候补优先</h4>
        <Switch
          checked={alternate}
          onChange={(checked)=>{setAlternate(checked)}}
        />
      </li>
      <li>
        <h4>查询余票周期（秒）</h4>
        <Stepper
          showNumber
          max={10}
          min={1}
          value={period}
          onChange={setPeriod}
        />
      </li>
      <li>
        <h4>每次请求cdn数</h4>
        <Stepper
          showNumber
          max={5}
          min={0}
          value={ipNumber}
          onChange={setIpNumber}
        />
      </li>
      <li>
        <h4>抢票开始时间</h4>
        <DatePickerView
          minDate={now}
          maxDate={new Date(+now + 29 * 24 * 60 * 60 * 1000)}
          value={time}
          onValueChange={timeEdit}
        />
      </li>
    </ul>
  );
} 