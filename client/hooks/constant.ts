import { useState, useEffect, useRef } from 'react';

export default <T>(value: T): [T, () => T, React.Dispatch<React.SetStateAction<T>>] => {
	const valueRef: RefObject<T> = useRef(value);
	const [valueState, setValueState] = useState<T>(value);

	useEffect(() => {
		valueRef.current = valueState
	}, [valueState]);

	return [
		valueState,
		() => valueRef.current,
		setValueState
	]
}