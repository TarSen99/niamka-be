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

const markOrderAsPayed = async (req, res) => {
	const {
		// failure OR success
		response_status,
		order_status,
		order_id,
		sender_email,
		merchant_id,
		rectoken,
	} = req.params;

	console.log('----------------------------');
	console.log(sender_email);
	console.log(response_status);
	console.log(order_status);
	console.log(order_id);
	console.log(merchant_id);
	console.log(rectoken);

	return res.status(200).json({
		success: true,
	});
};

module.exports = markOrderAsPayed;
