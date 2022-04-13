const Order = require('./../../models/Order');
const Place = require('./../../models/Place');
const Product = require('./../../models/Product');
const OrderProduct = require('./../../models/Order/OrderProduct');
const { COMMISION } = require('./../../constants/index.js');
const sequelize = require('./../../database');

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
	const v = `${+date}`.slice(0, 5);
	return v;
};

const createOrder = async (req, res) => {
	const { paymentMethod, products, placeId } = req.body;

	const customerId = req.headers.userid;

	let totalPrice = 0;
	const foundProducts = [];
	const transaction = await sequelize.transaction();

	const place = await Place.findByPk(placeId);

	if (!place) {
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
				return reject({
					field: 'product',
					message: 'Product does not exist',
				});
			}

			if (currProduct.PlaceId !== +placeId) {
				return reject({
					field: `products[${index}]`,
					message: 'Product is located in different place',
				});
			}

			const productTotalPrice = currProduct.priceWithDiscount * quantity;
			totalPrice += productTotalPrice;
			foundProducts.push(currProduct);
		}
	} catch (e) {
		console.log(e);
		transaction.rollback();

		return res.status(404).json({
			success: false,
			errors: [
				{
					field: null,
					error: e,
				},
			],
		});
	}

	let order;

	try {
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
			},
			{
				transaction,
			}
		);
	} catch (e) {
		transaction.rollback();
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

		transaction.rollback();

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

	transaction.commit();

	const customer = await order.getCustomer();

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
