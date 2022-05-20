const { Payment } = require('./../../models');
const { getPagDetails } = require('../../helpers/pagination');

const getCompanyPayments = async (req, res) => {
	const { companyId } = req.headers;
	const { offset, limit, meta } = getPagDetails(req.query);

	let payments;
	let count;

	try {
		const data = await Payment.findAndCountAll({
			where: {
				CompanyId: companyId,
			},
			order: [['createdAt', 'DESC']],
			offset,
			limit,
		});

		payments = data.rows;
		count = data.count;
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			errors: [
				{
					field: 'error',
					message: e,
				},
			],
		});
	}

	return res.status(200).json({
		success: true,
		data: payments,
		meta: {
			...meta,
			count: count,
		},
	});
};

module.exports = getCompanyPayments;
