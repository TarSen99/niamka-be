const { Order } = require('../../models');
const validate = require('./../../helpers/validate');
const yup = require('yup');
const { PAYMENT_METHODS, ORDER_STATUSES } = require('../../constants');

const validationSchema = yup.object().shape({
	orderId: yup.number().required('Field is required').nullable(),
});

const updateOrderPaymentType = async (req, res) => {
	const { orderId } = req.params;

	const v = await validate(validationSchema, {
		orderId,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	const order = await Order.findByPk(orderId);

	if (!order) {
		return res.status(404).json({
			success: false,
			errors: [
				{
					error: 'Not found',
					field: 'orderId',
				},
			],
		});
	}

	if (order.paymentMethod !== PAYMENT_METHODS.CARD) {
		return res.status(200).json({
			success: true,
		});
	}

	if (order.status !== ORDER_STATUSES.ACTIVE) {
		return res.status(400).json({
			success: false,
			status: 'Changing of payment method is not available',
		});
	}

	order.paymentMethod = PAYMENT_METHODS.CASH;
	order.status = ORDER_STATUSES.TO_TAKE;

	try {
		await order.save();
	} catch (e) {
		return res.status(500).json({
			success: false,
		});
	}

	return res.status(200).json({
		success: true,
		data: {
			...order.toJSON(),
		},
	});
};

module.exports = updateOrderPaymentType;
