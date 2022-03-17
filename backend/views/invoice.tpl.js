module.exports = () => {
  return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />

				<title>A simple, clean, and responsive HTML invoice template</title>

				<!-- Favicon -->
				<link rel="icon" href="./images/favicon.png" type="image/x-icon" />

				<!-- Invoice styling -->
				<style>
					body {
						font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
						text-align: center;
						color: #777;
					}

					body h1 {
						font-weight: 300;
						margin-bottom: 0px;
						padding-bottom: 0px;
						color: #000;
					}

					body h3 {
						font-weight: 300;
						margin-top: 10px;
						margin-bottom: 20px;
						font-style: italic;
						color: #555;
					}

					body a {
						color: #06f;
					}

					.invoice-box {
						max-width: 800px;
						margin: auto;
						padding: 30px;
						border: 1px solid #eee;
						box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
						font-size: 16px;
						line-height: 24px;
						font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
						color: #555;
					}

					.invoice-box table {
						width: 100%;
						line-height: inherit;
						text-align: left;
						border-collapse: collapse;
					}

					.invoice-box table td {
						padding: 5px;
						vertical-align: top;
					}

					.invoice-box table tr td:nth-child(2) {
						text-align: right;
					}

					.invoice-box table tr.top table td {
						padding-bottom: 20px;
					}

					.invoice-box table tr.top table td.title {
						font-size: 45px;
						line-height: 45px;
						color: #333;
					}

					.invoice-box table tr.information table td {
						padding-bottom: 40px;
					}

					.invoice-box table tr.heading td {
						background: #eee;
						border-bottom: 1px solid #ddd;
						font-weight: bold;
					}

					.invoice-box table tr.details td {
						padding-bottom: 20px;
					}

					.invoice-box table tr.item td {
						border-bottom: 1px solid #eee;
					}

					.invoice-box table tr.item.last td {
						border-bottom: none;
					}

					.invoice-box table tr.total td:nth-child(2) {
						border-top: 2px solid #eee;
						font-weight: bold;
					}

					@media only screen and (max-width: 600px) {
						.invoice-box table tr.top table td {
							width: 100%;
							display: block;
							text-align: center;
						}

						.invoice-box table tr.information table td {
							width: 100%;
							display: block;
							text-align: center;
						}
					}
				</style>
			</head>

			<body>
				<div class="invoice-box">
					<table>
						<tr class="top">
							<td colspan="2">
								<table>
									<tr>
										<td class="title">
											<img src='<%- include ("../svg/formpresslogo.svg") %>' alt="Company logo" style="width: 100%; max-width: 300px" />
										</td>

										<td>
											Invoice #: 123<br />
											Created: January 1, 2015<br />
											Due: February 1, 2015
										</td>
									</tr>
								</table>
							</td>
						</tr>

						<tr class="information">
							<td colspan="2">
								<table>
									<tr>
										<td>
											Sparksuite, Inc.<br />
											12345 Sunny Road<br />
											Sunnyville, TX 12345
										</td>

										<td>
											Acme Corp.<br />
											John Doe<br />
											john@example.com
										</td>
									</tr>
								</table>
							</td>
						</tr>

						<tr class="heading">
							<td>Payment Method</td>

							<td>Check #</td>
						</tr>

						<tr class="details">
							<td>Check</td>

							<td>1000</td>
						</tr>

						<tr class="heading">
							<td>Item</td>

							<td>Price</td>
						</tr>

						<tr class="item">
							<td>Website design</td>

							<td>$300.00</td>
						</tr>

						<tr class="item">
							<td>Hosting (3 months)</td>

							<td>$75.00</td>
						</tr>

						<tr class="item last">
							<td>Domain name (1 year)</td>

							<td>$10.00</td>
						</tr>

						<tr class="total">
							<td></td>

							<td>Total: $385.00</td>
						</tr>
					</table>
				</div>
			</body>
		</html>
	`
}
