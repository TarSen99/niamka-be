const { Order, Place, Product, OrderProduct } = require('./../../models');
const { COMMISION } = require('./../../constants/index.js');
const sequelize = require('./../../database');
const {
	PRODUCT_STATUSES,
	PAYMENT_METHODS,
	ORDER_STATUSES,
	REALTIME_NEW_ORDER_PATH,
} = require('./../../constants');
const writeToDb = require('./../../services/firebase/realTimeDb.js');

/*
  products<[]>: {id: INTEGER, quantity: INTEGER}
*/

const getOrderNumber = () => {
	const date = new Date();
	const secs =
		date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
	const minutes =
		date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
	const dayOfMonth =
		date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();

	return `${dayOfMonth}${minutes}${secs}`;
};

const getCustomerNumber = () => {
	const date = new Date();
	const v = `${+date}`.slice(7, 12);
	return v;
};

const createOrder = async (req, res) => {
	const { paymentMethod, products, placeId } = req.body;

	const customerId = req.headers.userid;

	let totalPrice = 0;
	const foundProducts = [];
	const transaction = await sequelize.transaction();

	console.log('Transaction created');

	let place;
	try {
		place = await Place.findByPk(placeId);
	} catch (e) {
		console.log(e);
		await transaction.rollback();

		return res.status(404).json({
			errors: [
				{
					field: 'placeId',
					error: 'Place not found',
				},
			],
		});
	}

	if (!place) {
		await transaction.rollback();

		return res.status(404).json({
			errors: [
				{
					field: 'placeId',
					error: 'Place not found',
				},
			],
		});
	}

	try {
		for await (const product of products) {
			const { id, quantity } = product;
			const currProduct = await Product.findByPk(id);

			if (!currProduct) {
				throw new Error('Product does not exist');
			}

			if (currProduct.PlaceId !== +placeId) {
				throw new Error(
					`products.${currProduct.id} || Product is located in different place`
				);
			}

			if (currProduct.status !== PRODUCT_STATUSES.ACTIVE) {
				throw new Error(`products.${currProduct.id} || out_of_stock`);
			}

			if (currProduct.availableCount < quantity) {
				throw new Error(`products.${currProduct.id} || out_of_stock`);
			}

			if (currProduct.availableCountPerPerson < quantity) {
				throw new Error(`products.${currProduct.id} || to_many_per_person`);
			}

			const productTotalPrice = currProduct.priceWithDiscount * quantity;

			currProduct.availableCount -= quantity;

			if (currProduct.availableCount === 0) {
				currProduct.status = PRODUCT_STATUSES.OUT_OF_STOCK;
			}

			await currProduct.save({ transaction });

			totalPrice += productTotalPrice;
			foundProducts.push(currProduct);
		}
	} catch (e) {
		console.log(e);
		await transaction.rollback();

		return res.status(400).json({
			success: false,
			errors: [
				{
					field: null,
					error: e && e.message,
				},
			],
		});
	}

	let order;

	try {
		let status;

		if (paymentMethod === PAYMENT_METHODS.CARD) {
			status = ORDER_STATUSES.ACTIVE;
		} else {
			status = ORDER_STATUSES.TO_TAKE;
		}

		order = await Order.create(
			{
				paymentMethod,
				totalPrice,
				CustomerId: +customerId,
				PlaceId: placeId,
				CompanyId: place.CompanyId,
				comission: COMMISION,
				orderNumber: getOrderNumber(),
				customerNumber: getCustomerNumber(),
				status,
			},
			{
				transaction,
			}
		);
	} catch (e) {
		await transaction.rollback();
		console.log(e);
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: null,
					error: e,
				},
			],
		});
	}

	const orderProducts = [];

	try {
		for await (const product of products) {
			const { quantity, id } = product;
			const currOrderProduct = await OrderProduct.create(
				{
					quantity,
					OrderId: order.id,
					ProductId: id,
				},
				{
					transaction,
				}
			);

			const productDetails = foundProducts.find((el) => +el.id === +id);

			orderProducts.push({
				orderProduct: currOrderProduct.toJSON(),
				productDetails: productDetails.toJSON(),
			});
		}
	} catch (e) {
		console.log(e);

		await transaction.rollback();

		return res.status(400).json({
			success: false,
			errors: [
				{
					field: null,
					error: e,
				},
			],
		});
	}

	let customer;
	try {
		customer = await order.getCustomer();
	} catch (e) {
		await transaction.rollback();
	}

	await transaction.commit();

	if (order.paymentMethod === PAYMENT_METHODS.CASH) {
		try {
			writeToDb(
				REALTIME_NEW_ORDER_PATH.replace('{placeId}', placeId).replace(
					'{orderId}',
					order.id
				),
				{
					data: {
						...order.toJSON(),
					},
					createdAt: new Date(),
				}
			);
		} catch (e) {}
	}

	return res.status(201).json({
		success: true,
		data: {
			order: {
				...order.toJSON(),
				customer: customer,
			},
			orderProducts: orderProducts,
		},
	});
};

module.exports = createOrder;
