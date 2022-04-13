const Product = require('./../../models/Product');
const Image = require('./../../models/Image');
const Place = require('./../../models/Place');
const Company = require('./../../models/Company');

const viewProductDetails = async (req, res) => {
	const { id } = req.params;

	const product = await Product.findByPk(id, {
		include: [Image, Company, Place],
	});

	return res.status(200).json({
		success: true,
		data: product.toJSON(),
	});
};

module.exports = viewProductDetails;
