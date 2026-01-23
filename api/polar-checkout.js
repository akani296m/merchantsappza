// Express.js Polar Checkout Handler for Fly.io
// Redirects merchants to Polar's hosted checkout page

import express from 'express';

const router = express.Router();

// GET /api/polar-checkout
router.get('/polar-checkout', async (req, res) => {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    const server = process.env.POLAR_ENVIRONMENT || 'sandbox';
    const successUrl = process.env.POLAR_SUCCESS_URL;
    const returnUrl = process.env.POLAR_RETURN_URL;

    // Get query parameters
    const productId = req.query.products;
    const customerId = req.query.customerId;
    const customerExternalId = req.query.customerExternalId;
    const customerEmail = req.query.customerEmail;
    const customerName = req.query.customerName;
    const metadata = req.query.metadata;

    if (!accessToken) {
        return res.status(500).json({ error: 'Polar access token not configured' });
    }

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required. Pass ?products=<product_id>' });
    }

    try {
        // Build checkout request body
        const checkoutBody = {
            product_price_id: productId,
            success_url: successUrl || `${req.protocol}://${req.get('host')}/billing/success`,
        };

        // Add optional customer fields
        if (customerId) {
            checkoutBody.customer_id = customerId;
        }
        if (customerExternalId) {
            checkoutBody.customer_external_id = customerExternalId;
        }
        if (customerEmail) {
            checkoutBody.customer_email = customerEmail;
        }
        if (customerName) {
            checkoutBody.customer_name = customerName;
        }
        if (metadata) {
            try {
                checkoutBody.metadata = JSON.parse(decodeURIComponent(metadata));
            } catch (e) {
                console.error('Failed to parse metadata:', e);
            }
        }

        // Determine API base URL
        const apiBaseUrl = server === 'production'
            ? 'https://api.polar.sh'
            : 'https://sandbox-api.polar.sh';

        // Create checkout session via Polar API
        const response = await fetch(`${apiBaseUrl}/v1/checkouts/custom`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Polar API error:', response.status, errorData);
            return res.status(response.status).json({
                error: 'Failed to create checkout session',
                details: errorData
            });
        }

        const checkoutData = await response.json();

        // Redirect to Polar checkout
        res.redirect(302, checkoutData.url);

    } catch (error) {
        console.error('Error creating Polar checkout:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
