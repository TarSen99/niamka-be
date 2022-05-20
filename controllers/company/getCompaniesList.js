const { Company, User, Place } = require('./../../models');
const { USER_ROLES } = require('./../../constants');
const { getPagDetails } = require('../../helpers/pagination');
const { Sequelize } = require('sequelize');

const getCompanyDetails = async (req, res) => {
	const { offset, limit, meta } = getPagDetails(req.query);

	let companies = [];
	let count = 0;

	try {
		const data = await Company.findAndCountAll({
			include: [
				{
					model: Place,
					required: false,
					where: {
						disabled: false,
					},
					attributes: [],
				},
				User,
			],
			offset,
			limit,
			order: [['updatedAt', 'DESC']],
			distinct: true,
			group: ['Company.id'],
			attributes: [
				'createdAt',
				'updatedAt',
				'balance',
				'name',
				'logo',
				'type',
				'id',
				[Sequelize.fn('COUNT', 'Place.id'), 'totalEstablishments'],
			],
		});

		companies = data.rows;
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
		data: companies,
		meta: {
			...meta,
			count: count,
		},
	});
};

module.exports = getCompanyDetails;
