import { iterateObject } from '@/utils';

interface ICharacterStation {
  character: string,
  stations: Station.IStation[],
}

const handleStationString = (stationString: string) => {
  const stationStrings = stationString.split('@');
  const stations: Station.IStation[] = [];
  const stationMap: { [key: string]: Station.IStation } = {};
  const characterStationMap: { [key: string]: Station.IStation[] } = {};
  let characterStations: ICharacterStation[] = [];
  stationStrings.forEach(stationPropString => {
    if (stationPropString) {
      const stationProps = stationPropString.split('|');
      const station: Station.IStation = {
        tag: stationProps[0],
        chinese: stationProps[1],
        id: stationProps[2],
        pinyin: stationProps[3],
        contraction: stationProps[4],
        index: stationProps[5],
      }
      stations.push(station);
      stationMap[station.id] = station;
      const firstCharacter = station.pinyin.substring(0, 1).toUpperCase();
      const currentCharacterStations = characterStationMap[firstCharacter];
      if (currentCharacterStations) {
        currentCharacterStations.push(station)
      } else {
        characterStationMap[firstCharacter] = [station]
      }
    }
  })
  iterateObject(characterStationMap, (characterStationItem: Station.IStation[], character: string) => {
    characterStations.push({
      character,
      stations: characterStationItem,
    })
  })
  characterStations = characterStations.sort((a, b) => a.character < b.character ? -1 : 1);
  return { stations, stationMap, characterStationMap, characterStations }
}

export const { stations, stationMap, characterStationMap, characterStations } = handleStationString((window as any).station_names);

export const getStationById = (id: string) => stationMap[id] || {}

