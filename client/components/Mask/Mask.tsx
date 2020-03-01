import React from 'react';
import ReactDOM from 'react-dom';
import useTransition from '@/hooks/transition'
import '@/style/Mask.less';

let div = document.querySelector('#mask-wrapper');

interface IProp {
	children: any
}

const Wrapper: React.FC<IProp> = ({ children }) => {
	const style = useTransition({
		props: [{
			name: 'opacity',
			from: 0,
			to: 1
		}]
	})

	return (
		<div className="mask" style={style}>
			{children}
		</div>
	)
}

const Mask = {
	open(children: JSX.Element) {
		div = document.querySelector('#mask-wrapper');
		if (!div) {
			div = document.createElement('div');
			div.id = 'mask-wrapper';
			document.body.appendChild(div);
		}
		ReactDOM.render((
			<Wrapper>{children}</Wrapper>
		), div);
	},
	close() {
		if (div) {
			ReactDOM.unmountComponentAtNode(div)
			document.body.removeChild(div)
		}
	}
}

export default Mask;