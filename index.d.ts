declare namespace Action {
	export interface IAction {
		type: string,
		payload: any
	}
}

declare namespace Station {
	export interface IStation {
		tag: string,
		chinese: string,
		id: string,
		pinyin: string,
		contraction: string,
		index: string
	}
}
