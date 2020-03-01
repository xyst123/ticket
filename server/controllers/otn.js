const router = require('koa-router')();
const { serverRequest, getIP, resolveFirst } = require('../../utils');

const getTicketRes = async ({ ip, query, headers, cookie }) => {
	try {
		const ticketRes = await serverRequest({
			url: `https://${ip}/otn/leftTicket/query`,
			params: query,
			headers: { ...headers, host: 'kyfw.12306.cn', refer: 'https://kyfw.12306.cn/otn/leftTicket/init', cookie, 'X-Forwarded-For': getIP() }
		});
		return typeof ticketRes === 'string' ? JSON.parse(ticketRes) : ticketRes;
	} catch (error) {
		return {}
	}
}

const handleTicketRes = (ticketRes) => {
	if (ticketRes.data) {
		const { map, result } = ticketRes.data;
		return result.map(ticketString => {
			const ticketArray = ticketString.split('|');
			return {
				secretStr: decodeURIComponent(ticketArray[0]),
				saleTime: ticketArray[1],
				id: ticketArray[2],
				train: ticketArray[3],
				startId: ticketArray[4],
				endId: ticketArray[5],
				fromId: ticketArray[6],
				fromName: map[ticketArray[6]],
				toId: ticketArray[7],
				toName: map[ticketArray[7]],
				fromTime: ticketArray[8],
				toTime: ticketArray[9],
				duration: ticketArray[10],
				available: ticketArray[11],
				leftTicketStr: ticketArray[12],
				date: ticketArray[13],
				seats: {
					// 硬座
					'1': ticketArray[29],
					// 硬卧/二等卧
					'3': ticketArray[28],
					// 软卧/一等卧
					'4': ticketArray[23],
					//  高级软卧
					'6': ticketArray[21],
					// 商务座
					'9': ticketArray[32],
					// 动卧
					F: ticketArray[33],
					// 一等座
					M: ticketArray[31],
					// 二等座
					O: ticketArray[30],
				}
			}
		})
	}
	return []
}

const getMatchedTickets = (tickets, selectedTickets, selectedSeats) => {
	const matchedTickets = [];
	const alternateTickets = [];
	tickets.forEach(ticket => {
		const ticketFit = selectedTickets.some(selectedTicket => selectedTicket === ticket.id);
		const seatFit = selectedSeats.some(selectedSeat => {
			const rest = ticket.seats[selectedSeat];
			return rest && rest !== '无' && rest !== '*'
		});

		if (ticketFit && seatFit) {
			matchedTickets.push(ticket)
		}
		if (ticketFit && !seatFit) {
			alternateTickets.push(ticket)
		}
	})
	return {
		matchedTickets,
		alternateTickets
	}
}

router.get('/restTickets', async (ctx) => {
	let code = 0;
	const messageMap = {
		0: '',
		60000: '获取车次列表失败',
		60001: '未获取到匹配的车次',
	}

	const divide = '; ';
	const cookies = (ctx.headers.cookie || "").split(divide);
	for (let index in cookies) {
		const cookie = cookies[index];
		if (cookie.startsWith('JSESSIONID')) {
			cookies.splice(index, 1);
			break
		}
	}
	const realCookie = cookies.join(divide);
	const { query = {} } = ctx;
	let { ips, selectedTickets, selectedSeats } = query;
	ips = ips ? JSON.parse(ips) : [];
	if (!ips.length) {
		ips = ['kyfw.12306.cn']
	}
	selectedTickets = selectedTickets ? JSON.parse(selectedTickets) : [];
	selectedSeats = selectedSeats ? JSON.parse(selectedSeats) : [];

	delete query.ips;
	delete query.selectedTickets;
	delete query.selectedSeats;

	let data = [];
	if (selectedTickets.length && selectedSeats.length) {
		data = await resolveFirst(
			ips.map(ip => getTicketRes({
				ip,
				query,
				headers: ctx.headers,
				cookie: realCookie
			}).then(ticketRes => new Promise((resolve, reject) => {
				const tickets = handleTicketRes(ticketRes);
				if (!tickets.length) {
					code = 60000;
					resolve([])
				}
				const { matchedTickets, alternateTickets } = getMatchedTickets(tickets, selectedTickets, selectedSeats);

				if (matchedTickets.length) {
					resolve(matchedTickets)
				} else {
					code = 60001;
					reject(alternateTickets)
				}
			})))
		)
	} else {
		const ticketRes = await getTicketRes({
			ip: ips[0],
			query,
			headers: ctx.headers,
			cookie: realCookie
		});
		data = handleTicketRes(ticketRes);
		if (!data.length) {
			code = 60000
		}
	}

	ctx.set('Content-Type', 'application/json;charset=UTF-8');
	ctx.body = {
		status: code === 0,
		code,
		message: messageMap[code],
		data
	}
});

router.get('/checkIp', async (ctx) => {
	const { ip } = ctx.query;
	delete ctx.headers.cookie;
	ctx.set('Content-Type', 'application/json;charset=UTF-8');
	try {
		const data = await Promise.race([
			serverRequest({
				url: `https://${ip}/otn/`,
				headers: { ...ctx.headers, host: 'kyfw.12306.cn', 'X-Forwarded-For': getIP() }
			}),
			new Promise(resolve => {
				setTimeout(() => {
					resolve(false)
				}, 1000)
			})
		])
		ctx.body = data ? 1 : 0;
	} catch (error) {
		ctx.body = 0;
	}
});

module.exports = router;
