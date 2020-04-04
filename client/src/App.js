import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import api from "./api";
import CheckoutForm from "./components/CheckoutForm";

const stripePromise = api.getPublicStripeKey().then(key => loadStripe(key));

export default function App() {
  return (
    <Elements stripe={stripePromise}>
      <h1 id='title-header'>My Very Best Books!</h1>
      <CheckoutForm />
    </Elements>
  );
}
