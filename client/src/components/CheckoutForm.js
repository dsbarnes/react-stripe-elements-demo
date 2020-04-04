import React, { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ListGroup } from 'react-bootstrap'
import api from "../api";
import ProductCards from "./ProductCards";
import './CheckoutForm.css'

export default function CheckoutForm() {
  const [cart, setCart] = useState(null)
  const [amount, setAmount] = useState(0)
  const [clientSecret, setClientSecret] = useState(null)
  const [error, setError] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [succeeded, setSucceeded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [products, setProducts] = useState(null)

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    api.getProductDetails()
      .then(products => setProducts(products))
  }, [])

  const handleAddToCart = (sku, ev) => {
    //The amount cannot be set on the front end...
    //pretty easy to manipulate it in state.
    //We can do this - but it's for display purposes only
    if (ev.target.checked) {
      !cart ? setCart([sku]) : setCart([...cart, sku])
      setAmount(amount + (sku.price / 100))
    }
    else {
      setCart(cart.filter(item => item.id != sku.id))
      setAmount(amount - (sku.price / 100))
    }
  }

  const handleSubmit = async ev => {
    ev.preventDefault();
    setProcessing(true);
    // Step 1: Fetch product details such as amount and currency from
    // API to make sure it can't be tampered with in the client.

    // Step 2: Create PaymentIntent over Stripe API

    // Step 3: Use clientSecret from PaymentIntent and the CardElement
    // to confirm payment with stripe.confirmCardPayment()

    const options = {
      payment_method_types: ["card"],
      currency: 'usd',
      amount: cart.map(item => item.id),
      // receipt_email: 'derekb0147@gmail.com'
      // Here we can provide all the details
      // email, name, location, whatever you'd like.
      // Customize to your needs.
    }
    api.createPaymentIntent(options)
      .then(clientSecret => {
        console.log(clientSecret)
        setClientSecret(clientSecret)
        return clientSecret
      })
      .then(async cs => {
        const payload = await stripe.confirmCardPayment(cs, { payment_method: { card: elements.getElement(CardElement) } })
        setError(null)
        setSucceeded(true)
        setProcessing(false)
        setMetadata(payload.paymentIntent)
        console.log("[PaymentIntent]", payload.paymentIntent)
      })
      .catch(err => {
        setError(`Payment Failed: ${err.message}`);
        setProcessing(false);
        console.log("[error]", err.message);
      })
  };

  const renderForm = () => {
    return (
      <div className='container'>
        <form id='payment-form' onSubmit={handleSubmit}>
          <div id='payment' className=''>
            <div id="email">
              <input
                className='w-100'
                type="text"
                id="email"
                name="email"
                placeholder=" eMail reciept to"
                autoComplete="cardholder"
              />
            </div>
            <small>Use card number 4242 4242 4242 4242 - </small>
            <small>any date in the future - </small>
            <small>any three digits - </small>
            <small>any 5 digits</small>
            <CardElement />

            {error && <div className="message sr-field-error">{error}</div>}

            {!succeeded ? (
              <button
                className='mt-2 mb-4 pay-button'
                disabled={processing || !stripe}>
                {processing ?
                  "Processing…" :
                  "Pay $" + amount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) + " (USD)"
                }
              </button>
            ) : (
                <div>
                  <h1>Your test payment succeeded</h1>
                  <p>View PaymentIntent response:</p>
                  <code>{JSON.stringify(metadata, null, 2)}</code>
                </div>
              )}
          </div>
        </form>

        {products && <ProductCards
          products={products}
          handleAddToCart={handleAddToCart}
        />}
      </div>
    );
  };

  return (
    renderForm()
  )
}
