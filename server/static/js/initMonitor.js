var userId = '';
var users = window.localStorage.getItem('users');
if (users) {
	userId = JSON.parse(users)[0].username
}
window.__monitor__.init({
	projectName: 'ticket',
	userId,
	parts: {
		performance: {
			percent: 100
		},
		resource: {
			percent: 100,
			exclude: [
				'/otn/checkIp',
			]
		},
		error: {

		},
		xhr: {
			percent: 100,
		}
	}
})