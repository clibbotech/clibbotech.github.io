const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const { name, description, price, category, imageUrl } = JSON.parse(event.body);

    const product = await stripe.products.create({
      name,
      description,
      images: imageUrl ? [imageUrl] : [],
      metadata: { category: category || 'General' }
    });

    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100),
      currency: 'gbp'
    });

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: priceObj.id, quantity: 1 }],
      after_completion: {
        type: 'redirect',
        redirect: { url: 'https://clibbotech.netlify.app/thank-you.html' }
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, paymentLink: paymentLink.url })
    };

  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};