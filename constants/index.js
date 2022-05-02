const PRODUCT_STATUSES = {
	ACTIVE: 'active',
	UNPUBLISHED: 'unpublished',
	OUT_OF_STOCK: 'out of stock',
	EXPIRED: 'expired',
};

const USER_ROLES = {
	GUEST: 'guest',
	CUSTOMER: 'customer',
	EMPLOYEE: 'employee',
	OWNER: 'owner',
	ADMIN: 'admin',
	MANAGER: 'manager',
};

const USER_ROLES_ARRAY = Object.values(USER_ROLES);

const ORDER_STATUSES = {
	ACTIVE: 'pending',
	TO_TAKE: 'to_take',
	PAYED: 'payed',
	CANCELLED: 'cancelled',
	COMPLETED: 'completed',
	EXPIRED: 'expired',
};

const TRANSACTION_STATUSES = {
	PENDING: 'pending',
	REJECTED: 'rejected',
	COMPLETED: 'approved',
	CANCELLED: 'cancelled',
};

const REGISTER_TYPES = {
	phone: 'phone',
	EMAIL: 'email',
};

const PUSH_TYPES = {
	IOS: 'ios',
	ANDROID: 'android',
};

const PAYMENT_METHODS = {
	CARD: 'card',
	CASH: 'cash',
};

// Niamka commision
const COMMISION = 10;

// PAYMENTS
const SECRET = 'TQKfQnUpj5WDo4aCJCDwmLMffCEcsaIB';
const CURRENCY = 'UAH';
const MERCHANT_ID = 1445132;

// Async jobs
const PENDING_ORDER_TIMEOUT = 60 * 5 * 1000;
// const PENDING_ORDER_TIMEOUT = 5000;
const REDIS_URL = 'redis://redis_password@localhost:6379';

const FIREBASE_SERVER_KEY =
	'AAAA8I0YBSc:APA91bEbDoCmlVxBrLUHEQtEXn7UyVpuzZUL-91df8vAJiRwbiDDYyDvytrCpbZobmNl7R5knVlddCuHwjpHxtlB34YtRM-cGKkbhYOO91PSGKQRWpwIGVkt9X_a73O5gHvqeZT0-Kfg';

const oneKMInDegrees = 0.01;
const DEFAULT_RADIUS = 10;

const REALTIME_NEW_ORDER_PATH = 'places/_{placeId}/orders/new/_{orderId}';
const REALTIME_CANCELLED_ORDER_PATH =
	'places/_{placeId}/orders/cancelled/_{orderId}';

module.exports = {
	PRODUCT_STATUSES,
	USER_ROLES,
	ORDER_STATUSES,
	COMMISION,
	REGISTER_TYPES,
	USER_ROLES_ARRAY,
	SECRET,
	TRANSACTION_STATUSES,
	CURRENCY,
	PAYMENT_METHODS,
	MERCHANT_ID,
	PENDING_ORDER_TIMEOUT,
	REDIS_URL,
	PUSH_TYPES,
	FIREBASE_SERVER_KEY,
	oneKMInDegrees,
	DEFAULT_RADIUS,
	REALTIME_NEW_ORDER_PATH,
	REALTIME_CANCELLED_ORDER_PATH,
};
