import React from 'react';
import '../style/PersonItem.less';

function PersonItem ({person}) {
  const getAvatar=(name)=>{
  if(name.length>2){
    return name.substring(name.length-2)
  }else {
    return name.substring(1)
  }
  }

  return (
    <div className="person-item">
      <div className="person-item-avatar">{getAvatar(person.passenger_name)}</div>
      <p className="person-item-name">{person.passenger_name}</p>
      <p className="person-item-sex">{person.sex_name}</p>
      <p className="person-item-id">{person.passenger_id_no}</p>
    </div>
  );
}

export default PersonItem