const { Place, Product } = require('./../../models');
const yup = require('yup');
const validate = require('./../../helpers/validate');

const validationSchema = yup.object().shape({
	id: yup.string().required('Field is required').nullable(),
});

const deletePlace = async (req, res) => {
	const { placeId } = req.params;

	const v = await validate(validationSchema, {
		id: placeId,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	let place;

	try {
		place = await Place.findByPk(placeId, {
			include: Product,
		});
	} catch (e) {
		return res.status(400).json({
			success: false,
		});
	}

	if (place && place.Products && place.Products.length) {
		try {
			place.disabled = true;
			await place.save();
		} catch (e) {
			return res.status(500).json({
				success: false,
			});
		}
	} else {
		try {
			await place.destroy();
		} catch (e) {
			return res.status(500).json({
				success: false,
			});
		}
	}

	return res.status(200).json({
		success: true,
	});
};

module.exports = deletePlace;
