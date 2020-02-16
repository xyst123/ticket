import React ,{useState,useRef} from 'react';
import { Button } from 'antd-mobile';
import {getVw} from '@/utils';
import pointsRaw from '@/config/points';
import '@/style/AuthCode.less';

const imageWidth=78;	// vw
const padding=2;	// vw
const checkWidth=5;	// vw
const imageRealWidth=293;	// px
const imageItemRealWidth=64;	// px

const pointsConfig=Object.keys(pointsRaw).map(key=>{
	const ratio=imageWidth/imageRealWidth;
	const positionString=pointsRaw[key];
	const positionArray=positionString.split(',').map(item=>parseInt(item));
	const [x,y]=positionArray;
	return {
		id:key,
		x,
		y,
		rangeX:{
			from:(x-imageItemRealWidth/2)*ratio,
			to:(x+imageItemRealWidth/2)*ratio,
		},
		rangeY:{
			from:(y-imageItemRealWidth/2)*ratio,
			to:(y+imageItemRealWidth/2)*ratio,
		},
		style:{
			display:'none',
			top:`${padding+y*ratio-checkWidth/2}vw`,
			left:`${padding+x*ratio-checkWidth/2}vw`,
			width:`${checkWidth}vw`,
			height:`${checkWidth}vw`,
			lineHeight:`${checkWidth}vw`,
			borderRadius:`${checkWidth/2}vw`
		}
	}
})

interface IProp {
	authCode: string,
	confirmHandler:(result:string) => Promise<void>,
	closeHandler:() => void
}

const AuthCode = ({authCode,confirmHandler,closeHandler}:IProp) =>{
	const [points,setPoints]=useState(pointsConfig);
	const imageRef: RefObject<any>=useRef(null);

	const handleImageClick=(event: any)=>{
		event.persist();
		const imageElement=imageRef.current;
		const imagePosition=imageElement.getBoundingClientRect();
		const relativePoint={
			x:getVw(event.clientX-imagePosition.left),
			y:getVw(event.clientY-imagePosition.top)
		};
		let currentIndex=-1;
		points.forEach((point,index)=>{
			const {rangeX,rangeY}=point
			if(relativePoint.x>rangeX.from && relativePoint.x<rangeX.to && relativePoint.y>rangeY.from && relativePoint.y<rangeY.to ){
				currentIndex=index
			}
		});
		if(currentIndex>-1){
			const pointsCopy=[...points];
			const currentPoint=points[currentIndex];
			pointsCopy[currentIndex]={
				...currentPoint,
				style:{
					...currentPoint.style,
					display:currentPoint.style.display==='none'?'block':'none'
				}
			}
			setPoints(pointsCopy)
		}
	}

	const handleConfirm=()=>{
		const selectedPoints=points.filter(point=>point.style.display==='block');
		const result=selectedPoints.map(point=>`${point.x},${point.y}`).join(',');
		confirmHandler(result);
		closeHandler()
	}
	 
	return (
		<div className="mask-auth-code" style={{width:`${imageWidth+padding}vw`,padding:`${padding}vw`}}>
			<img className="mask-auth-code-image" src={`data:image/jpg;base64,${authCode}`} alt="" ref={imageRef} onClick={handleImageClick}/>

			{points.map((point)=>{
				return (
					<i className="mask-auth-code-check iconfont icon-check" style={point.style} key={`point-${point.id}`} onClick={handleImageClick}></i>
				)
			})}
			
			<div className="mask-auth-code-buttons">
				<Button type="primary" onClick={handleConfirm} size="small">确定</Button>
				<Button size="small" onClick={closeHandler}>取消</Button>
			</div>
		</div>
	)
}

export default React.memo(AuthCode);