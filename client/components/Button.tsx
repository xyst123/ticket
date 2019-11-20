import React from 'react';
import '../style/Button.less';

function PersonItem (props) {
  const {person}=props;
  return (
    <button className="button">
      <div className="person-item-avatar">{getAvatar(person.passenger_name)}</div>
      <p className="person-item-name">{person.passenger_name}</p>
      <p className="person-item-sex">{person.sex_name}</p>
      <p className="person-item-id">{person.passenger_id_no}</p>
    </button>
  );
}

export default PersonItem