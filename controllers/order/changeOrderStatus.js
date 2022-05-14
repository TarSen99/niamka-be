const {
	Order,
	Transaction,
	OrderProduct,
	Product,
	PushToken,
	Company,
} = require('../../models');
const {
	ORDER_STATUSES,
	USER_ROLES,
	REALTIME_CANCELLED_ORDER_PATH,
} = require('../../constants/');
const rollbackProductData = require('../../helpers/product/rollbackProductData.js');
const refundOrder = require('../../controllers/order/refundOrder.js');
const sequelize = require('./../../database');
const writeToDb = require('./../../services/firebase/realTimeDb.js');
const sendMessage = require('./../../services/firebase/sendMessage.js');

const changeOrderStatus = async (req, res) => {
	const { role } = req.headers;
	const { orderId } = req.params;
	const status = req.orderStatus;
	const order = await Order.findByPk(orderId, {
		include: [
			Company,
			Transaction,
			{
				model: OrderProduct,
				include: Product,
			},
		],
	});

	const transaction = await sequelize.transaction();

	if (status === ORDER_STATUSES.CANCELLED) {
		try {
			for await (const orderProduct of order.OrderProducts) {
				await rollbackProductData({
					product: orderProduct.Product,
					addCount: orderProduct.quantity,
					transaction,
				});
			}

			await refundOrder({ order, transaction });
		} catch (e) {
			console.log(e);
			await transaction.rollback();
			return res.status(500).json({
				success: false,
				errors: [
					{
						field: null,
						error: e,
					},
				],
			});
		}

		if (role === USER_ROLES.CUSTOMER || !role) {
			writeToDb(
				REALTIME_CANCELLED_ORDER_PATH.replace(
					'{placeId}',
					order.PlaceId
				).replace('{orderId}', order.id),
				{
					data: {
						...order.toJSON(),
					},
					createdAt: new Date(),
				}
			);
		} else {
			try {
				const tokens = await PushToken.findAll({
					where: {
						UserId: order.CustomerId,
					},
				});

				for (const token of tokens) {
					sendMessage({
						token: token.token,
						title: `Нам шкода, але ${order.Company.name} скасували твоє замовлення`,
						body: `Заходь в додаток і перевір, що зараз є доступно для замовлення.`,
						image: order.Company.logo,
						data: {
							type: 'order_cancelled',
							id: '' + order.id,
						},
					});
				}
			} catch (e) {
				console.log('Error');
				console.log(e);
			}
		}
	}

	order.status = status;

	try {
		await order.save({ transaction });
	} catch (e) {
		await transaction.rollback();
		return res.status(500).json({
			success: false,
			errors: [
				{
					field: null,
					error: 'Something went wrong',
				},
			],
		});
	}

	await transaction.commit();

	return res.status(200).json({
		success: true,
		data: order.toJSON(),
	});
};

module.exports = changeOrderStatus;
