const Order = require('../../models/Order');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Image = require('../../models/Image');
const OrderProduct = require('../../models/Order/OrderProduct');
const Place = require('../../models/Place');
const Company = require('../../models/Company');
const { getPagDetails } = require('../../helpers/pagination');

const getAllOrders = async (req, res) => {
	const { placeId, companyId, customerId } = req.params;
	const { offset, limit, meta } = getPagDetails(req.query);
	const { id } = req.headers;

	const filter = {
		CustomerId: id,
	};

	if (placeId) {
		filter.PlaceId = placeId;
	}

	if (companyId) {
		filter.CompanyId = companyId;
	}

	if (!placeId && !companyId) {
		if (customerId && +req.headers.userid === +customerId) {
			filter.CustomerId = customerId;
		}
	}

	let orders;
	let count;

	try {
		const data = await Order.findAndCountAll({
			where: filter,
			include: [OrderProduct, Place, { model: User, as: 'Customer' }, Company],
			offset,
			limit,
			order: [['createdAt', 'DESC']],
			distinct: true,
		});

		orders = data.rows;
		count = data.count;
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			errors: [],
		});
	}

	const productsData = {};

	try {
		for (const order of orders) {
			for await (const productData of order.OrderProducts) {
				if (productsData[productData.ProductId]) {
					continue;
				}

				const product = await Product.findByPk(productData.ProductId, {
					include: Image,
				});

				productsData[product.id] = product.toJSON();
			}
		}
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			errors: [
				{
					field: 'error',
					error: e,
				},
			],
		});
	}

	return res.status(200).json({
		success: true,
		data: [
			...orders.map((el) => {
				return {
					...el.toJSON(),
					OrderProducts: el.OrderProducts.map((op) => {
						return {
							...op.toJSON(),
							productData: productsData[op.ProductId],
						};
					}),
				};
			}),
		],
		meta: {
			...meta,
			count: count,
		},
	});
};

module.exports = getAllOrders;
