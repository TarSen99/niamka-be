const { Product } = require('./../../models');
const { PRODUCT_STATUSES } = require('./../../constants');

const toggleAvailability = async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'id',
					message: 'id is required',
				},
			],
		});
	}

	const product = await Product.findByPk(id);

	if (!product) {
		return res.status(404).json({
			success: false,
			errors: [
				{
					field: 'id',
					message: 'Product is not found',
				},
			],
		});
	}

	if (product.status === PRODUCT_STATUSES.OUT_OF_STOCK) {
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'status',
					message: 'Product is out of stock',
				},
			],
		});
	}

	try {
		if (product.availableForSale) {
			product.availableForSale = false;
			product.status = PRODUCT_STATUSES.UNPUBLISHED;
		} else {
			product.availableForSale = true;
			product.status = PRODUCT_STATUSES.ACTIVE;
		}

		await product.save();
	} catch (e) {
		return res.status(500).json({
			success: false,
			errors: [
				{
					field: null,
					message: 'Something went wrong',
					error: e,
				},
			],
		});
	}

	return res.status(200).json({
		success: true,
		data: product.toJSON(),
	});
};

module.exports = toggleAvailability;
