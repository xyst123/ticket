import { request, handleRes } from "@/utils";

export const getUserInfo = async (): Promise<Common.IRes> => {
	const message = {
		'-1': '获取用户信息失败'
	}
	try {
		interface IRes {
			data: UserInfo.IUserInfo
		}
		const res = await request<IRes>({
			method: 'POST',
			url: '/otn/api/user/info',
		});
		const checkRes = handleRes(res, message);
		if (checkRes.status) {
			return {
				...checkRes,
				data: res.data
			}
		}
		return checkRes
	} catch (error) {
		return handleRes(error, message)
	}
}