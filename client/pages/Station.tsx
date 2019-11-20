import React, { useState } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import {WingBlank,SearchBar ,Button} from 'antd-mobile';
import {characterStationMap,characterStations} from '../utils/station'
import '../style/Station.less';

const characters="abcdefghijklmnopqrstuvwxyz".toUpperCase(). split("").filter(character=>characterStationMap[character]);

export default function ({type,setShowStation}) {
  const currentStation = useSelector(state => state.station);

  const dispatch = useDispatch();
  const submit=(station)=>{
    dispatch({type:`${type.toUpperCase()}_STATION_CHANGE`, payload:station});
    setShowStation(false)
  }

  return (
    <div className="station">
      <SearchBar placeholder="搜索车站名称、拼音或缩写" maxLength={8} />
      <WingBlank className="station-content">
        <div className="station-content-item">
          <h3 className="station-content-item-header">字母索引</h3>
          <div className="station-content-item-character">
            {characters.map(character=>(<Button className="station-content-item-character-button" key={`character-${character}`} href={`#character-${character}`} inline size="small">{character}</Button>))}
          </div>
        </div>
        <div>
          {characterStations.map(characterStation=>(<div className="station-content-item" key={`character-station-${characterStation.character}`}>
            <h3 id={`character-${characterStation.character}`} className="station-content-item-header">{characterStation.character}</h3>
            <div className={`station-content-item-station ${characterStation.stations.length>16 && characterStation.shrink && 'station-content-item-station__shrink'}`}>
              {characterStation.stations.map(station=>(<Button className={`station-content-item-station-button ${station.id===currentStation[type].id && 'station-content-item-station-button__active'}`} key={`character-station-${characterStation.character}-${station.id}`} inline size="small" onClick={submit.bind(null,station)}>{station.chinese}</Button>))}
              <p>{}</p>
            </div></div>))}
        </div>
      </WingBlank>
    </div>
  );
} 