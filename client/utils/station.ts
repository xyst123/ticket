import {iterateObject} from './index';

const handleStationString=(stationString:string)=>{
  const stationStrings=stationString.split('@');
  const stations=[];
  const stationMap={};
  const characterStationMap={};
  let characterStations=[];
  stationStrings.forEach(stationPropString=>{
    if(stationPropString){
      const stationProps= stationPropString.split('|');
      const station= {
        tag:stationProps[0],
        chinese:stationProps[1],
        id:stationProps[2],
        pinyin:stationProps[3],
        contraction:stationProps[4],
        index:stationProps[5],
      }
      stations.push(station);
      stationMap[stationProps[2]]=station;
      const firstCharacter=station.pinyin.substring(0,1).toUpperCase();
      const currentCharacterStations=characterStationMap[firstCharacter];
      if(currentCharacterStations){
        currentCharacterStations.push(station)
      }else {
        characterStationMap[firstCharacter]=[station]
      }
    }
  })
  iterateObject(characterStationMap,(stations,character)=>{
    characterStations.push({
        character,
        stations,
        shrink:true
    })
  })
  characterStations=characterStations.sort((a,b)=>a.character<b.character?-1:1);
  return {stations,stationMap,characterStationMap,characterStations}
}

export const {stations,stationMap,characterStationMap,characterStations}=handleStationString(window.station_names);

export const getStationById=(id)=>stationMap[id]||{}

