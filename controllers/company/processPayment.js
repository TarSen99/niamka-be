const { Company, User, Payment, Order } = require('./../../models');
const {
	USER_ROLES,
	ORDER_STATUSES,
	PAYMENT_METHODS,
} = require('./../../constants');
const emailService = require('./../../services/email-service');
const { readEmail } = require('./../../helpers');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('./../../database');

const getOrdersComission = (orders, type) => {
	return orders
		.map((o) => o.toJSON())
		.filter((o) => o.paymentMethod === type)
		.reduce((prev, curr) => {
			return prev + curr.withComission;
		}, 0);
};

const processPayment = async (req, res) => {
	const { companyId } = req.params;
	const { role } = req.headers;

	let company;

	try {
		company = await Company.findByPk(companyId, {
			include: [
				{
					model: User,
				},
			],
		});
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			errors: [
				{
					field: 'error',
					message: e,
				},
			],
		});
	}

	if (!company) {
		return res.status(404).json({
			errors: [
				{
					field: 'id',
					message: 'Not found',
				},
			],
		});
	}

	const owner = company.Users.find(
		(u) => u.UsersAndCompanies.role === USER_ROLES.OWNER
	);

	try {
		const emailData = await readEmail('public/emails/Niamka_payment.html', {
			user_name: owner.name,
			company_name: company.name,
			balance: (company.balance || 0).toFixed(2),
		});

		await emailService.send({
			html: emailData,
			email: owner.email,
			subject: 'Виплата від Niamka',
		});
	} catch (e) {}

	company.balance = 0;

	const transaction = await sequelize.transaction();

	try {
		await company.save({ transaction });
	} catch (e) {
		await transaction.rollback();
		return res.status(500).json({
			errors: [
				{
					field: 'error',
					message: e,
				},
			],
		});
	}

	let lastPayment;

	try {
		lastPayment = await Payment.findOne({
			where: {
				CompanyId: company.id,
			},
			order: [['createdAt', 'DESC']],
			transaction,
		});
	} catch (e) {
		await transaction.rollback();
		return res.status(500).json({
			errors: [
				{
					field: 'error',
					message: e,
				},
			],
		});
	}

	const filter = {
		CompanyId: company.id,
		status: ORDER_STATUSES.COMPLETED,
	};

	if (lastPayment && lastPayment.createdAt) {
		ordersFromDate = lastPayment.createdAt;
		filter.createdAt = {
			[Op.gt]: ordersFromDate,
		};
	}

	let orders = [];
	let ordersComission = [];

	try {
		orders = await Order.findAll({
			where: filter,
			attributes: [
				'paymentMethod',
				// [
				// 	Sequelize.literal(
				// 		'"totalPrice" - ("totalPrice" / 100 * "comission")'
				// 	),
				// 	'comissionValue',
				// ],
				[Sequelize.fn('SUM', Sequelize.col('totalPrice')), 'totalSum'],
			],
			group: ['paymentMethod'],
			transaction,
		});

		ordersComission = await Order.findAll({
			where: filter,
			attributes: [
				'id',
				'paymentMethod',
				[
					Sequelize.literal(
						'("Order"."totalPrice" / 100 * "Order"."comission")'
					),
					'withComission',
				],
			],
			transaction,
		});
	} catch (e) {
		console.log(e);
		await transaction.rollback();
		return res.status(500).json({
			errors: [
				{
					field: 'error',
					message: e,
				},
			],
		});
	}

	let orderCash = orders.find(
		(el) => el.paymentMethod === PAYMENT_METHODS.CASH
	);

	if (orderCash) {
		orderCash = orderCash.toJSON();
	} else {
		orderCash = {};
	}

	const totalCash = orderCash.totalSum || 0;

	let orderCard = orders.find(
		(el) => el.paymentMethod === PAYMENT_METHODS.CARD
	);

	if (orderCard) {
		orderCard = orderCard.toJSON();
	} else {
		orderCard = {};
	}

	const totalCard = orderCard.totalSum || 0;

	const cashComission = getOrdersComission(
		ordersComission,
		PAYMENT_METHODS.CASH
	);

	const cardComission = getOrdersComission(
		ordersComission,
		PAYMENT_METHODS.CARD
	);

	const payment = {
		cashIncome: totalCash,
		cashCommission: cashComission,
		cashRevenue: totalCash - cashComission,

		cardIncome: totalCard,
		cardCommission: cardComission,
		cardRevenue: totalCard - cardComission,
		status: 'payed',
		CompanyId: company.id,
	};

	let createdPayment;

	try {
		createdPayment = await Payment.create(payment, { transaction });
	} catch (e) {
		await transaction.rollback();
		return res.status(500).json({
			errors: [
				{
					field: 'error',
					message: e,
				},
			],
		});
	}

	await transaction.commit();

	return res.status(200).json({
		success: true,
		data: createdPayment.toJSON(),
	});
};

module.exports = processPayment;
