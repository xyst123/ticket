import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { WingBlank, SearchBar, Button } from 'antd-mobile';
import { characterStationMap, characterStations } from '@/utils/station';
import { setStorage } from '@/utils'
import '@/style/Station.less';

const characters = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("").filter(character => characterStationMap[character]);

interface IProp {
  type: string,
  setShowStation: (showStation: boolean) => void
}

export default function ({ type, setShowStation }: IProp) {
  const currentStation = useSelector((state: any) => state.station);

  const dispatch = useDispatch();
  const submit = (station: Station.IStation) => {
    setStorage('config', { [`${type}Station`]: station.id })
    dispatch({ type: `${type.toUpperCase()}_STATION_CHANGE`, payload: station });
    setShowStation(false)
  }

  return (
    <div className="station">
      <SearchBar placeholder="搜索车站名称、拼音或缩写" maxLength={8} />
      <WingBlank className="station-content">
        <div className="station-content-item">
          <h3 className="station-content-item-header">字母索引</h3>
          <div className="station-content-item-character">
            {characters.map(character => (
              <a href={`#character-${character}`} key={`character-${character}`}>
                <Button className="station-content-item-character-button" inline size="small">{character}</Button>
              </a>
            ))}
          </div>
        </div>
        <div>
          {characterStations.map(characterStation => (
            <div className="station-content-item" key={`character-station-${characterStation.character}`}>
              <h3 id={`character-${characterStation.character}`} className="station-content-item-header">{characterStation.character}</h3>

              <div className={`station-content-item-station ${characterStation.stations.length > 16 && characterStation.shrink && 'station-content-item-station__shrink'}`}>
                {characterStation.stations.map(station => (<Button className={`station-content-item-station-button ${station.id === currentStation[type].id && 'station-content-item-station-button__active'}`} key={`character-station-${characterStation.character}-${station.id}`} inline size="small" onClick={submit.bind(null, station)}>{station.chinese}</Button>))}
                <p>{}</p>
              </div>
            </div>
          ))}
        </div>
      </WingBlank>
    </div>
  );
} 