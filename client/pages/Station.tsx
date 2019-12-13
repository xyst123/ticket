import React, { useState } from 'react';
import { useState, useSelector, useDispatch } from 'react-redux';
import { WingBlank, SearchBar, Button } from 'antd-mobile';
import { characterStationMap, characterStations } from '@/utils/station';
import { setStorage } from '@/utils'
import '@/style/Station.less';

const characters = characterStations.map(characterStation => characterStation.character.toUpperCase())

interface IProp {
  type: string,
  setShowStation: (showStation: boolean) => void
}

export default function ({ type, setShowStation }: IProp) {
  const [shrinks, setShrinks] = useState(characterStations.map(() => true));

  const currentStation = useSelector((state: any) => state.station);

  const dispatch = useDispatch();
  const submit = (station: Station.IStation) => {
    setStorage('config', { [`${type}Station`]: station.id });
    setStorage('tickets', []);
    dispatch({ type: `${type.toUpperCase()}_STATION_CHANGE`, payload: station });
    dispatch({ type: `SELECTED_TICKETS_CHANGE`, payload: [] });
    setShowStation(false)
  }

  const setShrink = (index: number) => {
    const copyShrinks = [...shrinks];
    copyShrinks.splice(index, 1, !shrinks[index]);
    setShrinks(copyShrinks)
  }

  return (
    <div className="station">
      <SearchBar placeholder="搜索车站名称、拼音或缩写" maxLength={8} />
      <WingBlank className="station-content">
        <div className="station-content-item">
          <h3 className="station-content-item-header">字母索引</h3>
          <div className="station-content-item-character">
            {characters.map(character => (
              <span key={`character-${character}`}>
                <Button
                  href={`#character-${character}`} className="station-content-item-character-button" inline size="small">
                  {character}
                </Button>
              </span>
            ))}
          </div>
        </div>
        <div>
          {characterStations.map((characterStation, index) => (
            <div className="station-content-item" key={`character-station-${characterStation.character}`}>
              <h3 id={`character-${characterStation.character}`} className="station-content-item-header">{characterStation.character}</h3>

              <div className={`station-content-item-station ${characterStation.stations.length > 16 && shrinks[index] && 'station-content-item-station__shrink'}`}>
                {characterStation.stations.map(station => (<Button className={`station-content-item-station-button ${station.id === currentStation[type].id && 'station-content-item-station-button__active'}`} key={`character-station-${characterStation.character}-${station.id}`} inline size="small" onClick={submit.bind(null, station)}>{station.chinese}</Button>))}
              </div>
              <p className="station-content-item-shrink" onClick={setShrink.bind(null, index)}>{shrinks[index] ? '展开' : '收起'}</p>
            </div>
          ))}
        </div>
      </WingBlank>
    </div>
  );
} 