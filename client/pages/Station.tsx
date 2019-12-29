import React, { useState, useCallback } from 'react';
import { WingBlank, SearchBar, Button, List } from 'antd-mobile';
import useSearch from '@/hooks/search';
import { setStorage } from '@/utils';
import { stations, characterStations, getStation } from '@/utils/station';
import '@/style/Station.less';

const Item = List.Item;

const characters = characterStations.map(characterStation => characterStation.character.toUpperCase())

interface IProp {
  type: Station.TStationType,
  setShowStation: (showStation: boolean) => void
}

export default ({ type, setShowStation }: IProp) => {
  const currentStation = getStation(type);

  const [shrinks, setShrinks] = useState(characterStations.map(() => true));

  const [fitList, setText] = useSearch<Station.IStation>(stations, (text) => {
    return (station) => station.chinese.startsWith(text) || station.pinyin.startsWith(text) || station.contraction.startsWith(text)
  });

  const submit = useCallback((station: Station.IStation) => {
    setStorage('config', { [`${type}Station`]: station.id });
    setStorage('tickets', []);
    setShowStation(false)
  }, [])

  const setShrink = useCallback((index: number) => {
    const copyShrinks = [...shrinks];
    copyShrinks.splice(index, 1, !shrinks[index]);
    setShrinks(copyShrinks)
  }, [shrinks])

  return (
    <div className="station">
      <div className="station-search">
        <SearchBar placeholder="搜索车站名称、拼音或缩写" onChange={setText} maxLength={8}
        />
        <List className="station-search-result" style={{ display: fitList.length ? 'block' : 'none' }}>
          {
            fitList.map((fitItem: Station.IStation) => (
              <Item key={`fit-${fitItem.id}`} onClick={submit.bind(null, fitItem)}>{fitItem.chinese}</Item>
            ))
          }
        </List>
      </div>
      <WingBlank className="station-content">
        <div className="station-content-item">
          <h3 className="station-content-item-header">字母索引</h3>
          <div className="station-content-item-character">
            {characters.map(character => (
              <span key={`character-${character}`}>
                <Button
                  // @ts-ignore
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
                {characterStation.stations.map(station => (<Button className={`station-content-item-station-button ${station.id === currentStation.id && 'station-content-item-station-button__active'}`} key={`character-station-${characterStation.character}-${station.id}`} inline size="small" onClick={submit.bind(null, station)}>{station.chinese}</Button>))}
              </div>
              <p className={`station-content-item-shrink iconfont icon-arrow toggle ${shrinks[index]?'':'toggle-active'}`} onClick={setShrink.bind(null, index)}></p>
            </div>
          ))}
        </div>
      </WingBlank>
    </div>
  );
} 