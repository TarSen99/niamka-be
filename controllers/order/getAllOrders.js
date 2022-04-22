const {
	Order,
	User,
	Product,
	Image,
	OrderProduct,
	Place,
	Company,
} = require('../../models');
const { getPagDetails } = require('../../helpers/pagination');

const isNull = (v) => {
	if (!v) {
		return true;
	}

	return v === 'null' || v === 'undefined' || v === 'NaN';
};

const getAllOrders = async (req, res) => {
	const { placeId, companyId } = req.params;
	const { offset, limit, meta } = getPagDetails(req.query);
	const { userid } = req.headers;

	let customerId = +userid;

	if (isNull(companyId) && isNull(placeId) && isNull(customerId)) {
		return res.status(200).json({
			success: true,
			data: {},
			meta: {},
		});
	}

	const filter = {};

	if (placeId) {
		filter.PlaceId = placeId;
	}

	if (companyId) {
		filter.CompanyId = companyId;
	}

	if (isNull(companyId) && isNull(placeId)) {
		if (customerId) {
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
