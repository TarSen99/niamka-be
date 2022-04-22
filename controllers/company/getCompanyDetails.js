const { Company, User, Place } = require('./../../models');

const getCompanyDetails = async (req, res) => {
	const { companyId } = req.params;

	if (!companyId || companyId === 'undefined' || companyId === 'null') {
		return res.status(200).json({
			success: true,
			data: {},
		});
	}

	let company;

	try {
		company = await Company.findByPk(companyId, {
			include: [
				{
					model: Place,
					required: false,
					where: {
						disabled: false,
					},
				},
				User,
			],
			order: [[Place, 'id', 'DESC']],
		});
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

	if (!company) {
		return res.status(404).json({
			errors: [
				{
					field: 'id',
					message: 'Not found',
				},
			],
		});
	}

	return res.status(200).json({
		success: true,
		data: company.toJSON(),
	});
};

module.exports = getCompanyDetails;
