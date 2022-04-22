const { Product, Company, Image } = require('../../models');

const { getPagDetails } = require('../../helpers/pagination');

const getProductsList = async (req, res) => {
	const { offset, limit, meta } = getPagDetails(req.query);
	const { companyId } = req.params;

	const data = await Product.findAndCountAll({
		order: [['createdAt', 'DESC']],
		where: {
			CompanyId: companyId,
		},
		include: [Image, Company],
		offset,
		limit,
		distinct: true,
	});

	const asData = data.rows.map((item) => {
		return item.toJSON();
	});

	return res.status(200).json({
		success: true,
		data: asData,
		meta: {
			...meta,
			count: data.count,
		},
	});
};

module.exports = getProductsList;
