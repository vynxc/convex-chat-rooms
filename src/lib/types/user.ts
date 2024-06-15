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
		avatar: string;
		id: string;
		username: string;
	};
	userId: string;
}
