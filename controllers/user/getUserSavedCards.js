const { SavedCreditCard } = require('../../models');

const getUserSavedCards = async (req, res) => {
	const { userid } = req.headers;

	const savedCards = await SavedCreditCard.findAll({
		where: {
			UserId: userid,
		},
	});

	const asJson = savedCards.map((el) => el.toJSON());

	return res.status(200).json({
		success: true,
		data: asJson,
	});
};

module.exports = getUserSavedCards;
