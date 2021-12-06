const Iyzipay = require('iyzipay');

module.exports = function(app) {
  app.get(
    '/api/payment/paymentDetails',
    async (req, res) => {
    	const status = {result: "success"}
     	res.json(status)
    }
  )

  app.post(
    '/api/payment/paymentRequest',
    async (req, res) => {
    	const request = {
	      locale: Iyzipay.LOCALE.TR,
	      conversationId: '123456789',
	      price: '39',
	      paidPrice: '39',
	      currency: Iyzipay.CURRENCY.TRY,
	      installment: '1',
	      basketId: 'B67832',
	      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
	      paymentGroup: Iyzipay.PAYMENT_GROUP.LISTING,
	      paymentCard: {
	        cardHolderName: 'John Doe',
	        cardNumber: '5528790000000008',
	        expireMonth: '12',
	        expireYear: '2030',
	        cvc: '123',
	        registerCard: '0'
	      },
	      buyer: {
	        id: 'BY789',
	        name: 'John',
	        surname: 'Doe',
	        gsmNumber: '+905350000000',
	        email: 'email@email.com',
	        identityNumber: '74300864791',
	        lastLoginDate: '2015-10-05 12:43:35',
	        registrationDate: '2013-04-21 15:12:09',
	        registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
	        ip: '85.34.78.112',
	        city: 'Istanbul',
	        country: 'Turkey',
	        zipCode: '34732'
	      },
	      shippingAddress: {
	        contactName: 'Jane Doe',
	        city: 'Istanbul',
	        country: 'Turkey',
	        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
	        zipCode: '34742'
	      },
	      billingAddress: {
	        contactName: 'Jane Doe',
	        city: 'Istanbul',
	        country: 'Turkey',
	        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
	        zipCode: '34742'
	      },
	      basketItems: [
	        {
	          id: 'BI102',
	          name: 'Formpress Premium Plan',
	          category1: 'service plan',
	          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
	          price: '39'
	        }
	      ]
	    };

			const iyzipay = new Iyzipay({
		    apiKey: "sandbox-uBaIVKZ6n7vmaJ7JRZlbcB74b67l9RBG",
		    secretKey: "sandbox-qNJtxGxW0cnH7eRplvhiMA5MSn8WZEWc",
		    uri: 'https://sandbox-api.iyzipay.com'
			});

			iyzipay.payment.create(request, function (err, result) {
			  res.status(200).json({ api_result: result })
			});
    }
  )
};