//order_status
// created — заказ был создан, но клиент еще не ввел платежные реквизиты; необходимо продолжать опрашивать статус заказа
// processing — заказ все еще находится в процессе обработки платежным шлюзом; необходимо продолжать опрашивать статус заказа
// declined — заказ отклонен платежным шлюзом FONDY, внешней платежной системой или банком-эквайером
// approved — заказ успешно совершен, средства заблокированы на счету плательщика и вскоре будут зачислены мерчанту; мерчант может оказывать услугу или “отгружать” товар
// expired — время жизни заказа, указанное в параметре lifetime, истекло.
// reversed — ранее успешная транзакция была полностью отменена. В таком случае параметр reversal_amount будет эквивалентно actual_amount

//signature
//test|125|USD|1396424|test order|test123456

// {
//     "request":{
//       "order_id":"test123456",
//       "order_desc":"test order",
//       "currency":"USD",
//       "amount":"125",
//       "signature":"f0ee6288b9295d3b808bcd8d720211c7201245e1",
//       "merchant_id":"1396424"
//     }
//   }

const {
	SECRET,
	ORDER_STATUSES,
	TRANSACTION_STATUSES,
} = require('../../constants');
const { genSignature } = require('cloudipsp-node-js-sdk/lib/util.js');
const { Order, Transaction, SavedCreditCard, User } = require('../../models');
const reverseOrder = require('../../controllers/order/reverseOrder.js');

const saveUserEmail = async ({ userId, email }) => {
	let user;
	try {
		user = await User.findByPk(userId);
	} catch (e) {
		return;
	}

	if (!user) {
		return;
	}

	if (user.email) {
		return;
	}

	user.email = email;

	await user.save();
};

const markOrderAsPayed = async (req, res) => {
	const {
		// failure OR success
		response_status,
		order_status,
		order_id,
		sender_email,
		rectoken,
		rectoken_lifetime,
		signature,
		masked_card,
		card_type,
		amount,
		currency,
	} = req.body;

	if (order_status === 'created' || order_status === 'processing') {
		return res.status(200).json({
			success: true,
		});
	}

	// console.log(sender_email);

	if (response_status !== 'success') {
		return res.status(200).json({
			success: true,
		});
	}

	const orderIdValue = order_id.split('/')[1];

	const order = await Order.findByPk(orderIdValue, {
		include: Transaction,
	});

	if (!order) {
		await reverseOrder({ orderId: order_id, amount, currency, order_status });
		return res.status(200).json({
			success: true,
		});
	}

	if (!order.Transaction) {
		await reverseOrder({ orderId: order_id, amount, currency, order_status });

		return res.status(200).json({
			success: true,
		});
	}

	const generatedSignature = genSignature(req.body, SECRET);

	if (signature !== generatedSignature) {
		order.Transaction.status = TRANSACTION_STATUSES.REJECTED;
		order.status = ORDER_STATUSES.ACTIVE;
		await order.save();
		await order.Transaction.save();

		await reverseOrder({
			orderId: order_id,
			amount,
			currency,
			order_status,
		});

		return res.status(200).json({
			success: true,
		});
	}

	if (order_status === 'approved') {
		order.status = ORDER_STATUSES.PAYED;
		order.Transaction.status = TRANSACTION_STATUSES.COMPLETED;

		try {
			await order.save();
			await order.Transaction.save();
			await saveUserEmail({ email: sender_email, userId: order.CustomerId });

			await SavedCreditCard.findOrCreate({
				where: {
					rectoken,
					UserId: order.CustomerId,
				},
				defaults: {
					UserId: order.CustomerId,
					expiration: rectoken_lifetime,
					mackedCard: masked_card,
					cardType: card_type,
					rectoken,
				},
			});
		} catch (e) {
			return res.status(200).json({
				success: true,
			});
		}
	} else if (
		order_status === 'declined' ||
		order_status === 'expired' ||
		order_status === 'reversed'
	) {
		try {
			await order.Transaction.destroy();
		} catch (e) {
			return res.status(200).json({
				success: true,
			});
		}
	}

	return res.status(200).json({
		success: true,
	});
};

module.exports = markOrderAsPayed;
