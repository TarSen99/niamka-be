const { PRODUCT_STATUSES } = require('../../constants/');

module.exports = async function ({ product, addCount, transaction }) {
	product.availableCount += addCount;

	if (product.status === PRODUCT_STATUSES.OUT_OF_STOCK) {
		product.status = PRODUCT_STATUSES.ACTIVE;
	}

	return await product.save({ transaction });
};
