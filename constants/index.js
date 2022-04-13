const PRODUCT_STATUSES = {
	ACTIVE: 'active',
	UNPUBLISHED: 'unpublished',
	OUT_OF_STOCK: 'out of stock',
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
	ACTIVE: 'active',
	PAYED: 'payed',
	CANCELLED: 'cancelled',
	COMPLETED: 'completed',
};

const REGISTER_TYPES = {
	phone: 'phone',
	EMAIL: 'email',
};

const COMMISION = 10;

module.exports = {
	PRODUCT_STATUSES,
	USER_ROLES,
	ORDER_STATUSES,
	COMMISION,
	REGISTER_TYPES,
	USER_ROLES_ARRAY,
};
