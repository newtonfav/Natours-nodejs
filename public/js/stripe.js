/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51LBy0TKGMhE0key35d3w1zAN1wXNgMLLkBxOiEAINKiNBW2t2gCre02n3ZbCIJZhaQnXlyEL2zr5GZegrWt7hrnS00MagD0m3t'
  );

  try {
    //1. Get checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`
    );

    //2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
