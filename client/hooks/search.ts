import { useState } from 'react';

export default <T>(list: T[] = [], match: (text: string) => (value: any, index: number, array: any[]) => any): [T[], (value: string) => void] => {
	const [text, setText] = useState<string>('');
	const fitList = text ? list.filter(match(text)) : [];
	return [
		fitList,
		setText
	]
}