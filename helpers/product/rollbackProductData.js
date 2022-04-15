const Product = require('../../models/Product');
const { PRODUCT_STATUSES } = require('../../constants/');

module.exports = async function ({ productId, addCount }) {
	const product = await Product.findByPk(productId);

	if (!product) {
		throw new Error('No such product');
	}

	product.availableCount += addCount;

	if (product.status === PRODUCT_STATUSES.OUT_OF_STOCK) {
		product.status = PRODUCT_STATUSES.ACTIVE;
	}

	await product.save();
	return;
};
