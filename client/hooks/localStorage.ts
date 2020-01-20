import { useState} from 'react';
import { getStorage, setStorage} from '@/utils';

export default <T>(key: string, props?: string, defaultValue?: any):[T,Function] => {
	const [valueState, setValueState] = useState(getStorage(key,props,defaultValue));

	return [
		valueState,
		(key: string, value: T, assign: boolean = true)=>{
			setStorage(key,value,assign);
			setValueState(value)
		}
	]
}