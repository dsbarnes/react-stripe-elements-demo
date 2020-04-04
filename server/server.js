const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const { resolve } = require("path");

const PORT = process.env.NODE_ENV ? process.env.PORT : 4242

app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  // Exprees will serve up production assets
  app.use(express.static('../../client/build'));

  // Serve index.html file if it doesn't recognize route
  // and it should not recognize the route
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}


app.get("/public-key", (req, res) => {
  res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
});


app.get('/my-products', (req, res) => {
  stripe.skus.list({ limit: 10 }, async (err, skus) => {
    const products = await stripe.products.list({ limit: 10 })
    skus.data.map(sku => sku.product = products.data.filter(p => p.id === sku.product)[0])
    res.send(skus.data)
  })
})


app.post("/create-payment-intent", async (req, res) => {
  const body = req.body;
  // WE MUST calculate the total charge on the back end
  // Otherwise you get pwned on deploy.
  const skus = await stripe.skus.list({ limit: 10 })
  body.amount.forEach(item => {
    skus.data.forEach(sku => {
      if (item === sku.id) { body.amount[body.amount.indexOf(item)] = sku.price }
    })
  })

  const amount = body.amount.reduce((a, b) => a + b)

  const options = {
    ...body,
    amount: amount,
    currency: body.currency,
    receipt_email: body.receipt_email
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create(options);
    res.json(paymentIntent);
  } catch (err) {
    res.json(err);
  }
});


app.listen(PORT, () => console.log(`Node server listening on port ${4242}!`));
