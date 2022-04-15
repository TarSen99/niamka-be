const Product = require('./../../models/Product');
const Image = require('./../../models/Image');
const Place = require('./../../models/Place');
const Company = require('./../../models/Company');
const sequelize = require('../../database');
const { getLocationData } = require('../../helpers/location');

const viewProductDetails = async (req, res) => {
	const { id } = req.params;
	const { location } = req.headers;
	const { distanceAttr } = getLocationData(location);

	const product = await Product.findByPk(id, {
		include: [
			Image,
			Company,
			{ model: Place, required: true, duplicating: false },
		],
		attributes: {
			...distanceAttr,
		},
	});

	return res.status(200).json({
		success: true,
		data: product.toJSON(),
	});
};

module.exports = viewProductDetails;
