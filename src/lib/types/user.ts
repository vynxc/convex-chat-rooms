export interface User {
	username: string;
	avatar: string;
	id: string;
}

export interface Message {
	_creationTime: number;
	_id: string;
	content: string;
	roomId: string;
	user: {
		_creationTime: number;
		_id: string;
		avatar: string;
		email: string;
		id: string;
		password: string;
		username: string;
	};
	userId: string;
}
