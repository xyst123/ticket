import React from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { Calendar } from 'antd-mobile';
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN';
import '../style/Date.less';

export default function ({setShowDate}) {
  const now=new Date();
  const currentDate = useSelector(state => state.date);
  const dispatch = useDispatch();
  const submit=(date)=>{
    dispatch({type:'DATE_CHANGE', payload:date});
    setShowDate(false)
  }

  return (
    <div className="date-content">
      <Calendar 
        visible
        locale={zhCN}
        defaultValue={currentDate}
        minDate={now}
        maxDate={new Date(+now + 29*24*60*60*1000)}
        type="one"
        rowSize="normal"
        onSelect={(date)=>{submit(date)}}
      />
    </div>
  );
} 