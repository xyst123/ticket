import { useState,useEffect} from 'react';

interface IProp {
	children?:JSX.Element,
  props?: {
		name:string,
		from:any,
		to:any
	}[],
	duration?:number
}

export default ({props=[], duration=0.3}:IProp):[{[key:string]:any}] => {
	const fromStyle:{[key:string]:any}={};
	const toStyle:{[key:string]:any}={};
	const transitionArray:string[]=[];

	props.forEach(prop=>{
		fromStyle[prop.name]=prop.from;
		toStyle[prop.name]=prop.to;
		transitionArray.push(`${prop.name} ${duration}s`)
	});
	toStyle.transition=fromStyle.transition=transitionArray.join(',');

	const [style, setStyle] = useState(fromStyle);

	useEffect(()=>{
		setTimeout(()=>{
			setStyle(toStyle)
		},300)
	},[])

	return [
		style
	]
}