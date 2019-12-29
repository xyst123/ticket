export const getCrossDays=(fromTime:string,duration:string):string=>{
	const fromArray=fromTime.split(':');
	const fromMinutes=parseInt(fromArray[0])*60+parseInt(fromArray[1]);
	const durationArray=duration.split(':');
	const durationMinutes=parseInt(durationArray[0])*60+parseInt(durationArray[1]);
	const totalMinutes=fromMinutes+durationMinutes;
	const crossDays=Math.floor(totalMinutes/(24*60))
	return crossDays?`（+${crossDays}）`:''; 
}