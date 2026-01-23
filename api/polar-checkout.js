// Vercel Edge Function to handle Polar checkout for merchant subscriptions
// This redirects merchants to Polar's hosted checkout page

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    const url = new URL(request.url);
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    const server = process.env.POLAR_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'production'
    const successUrl = process.env.POLAR_SUCCESS_URL || `${url.origin}/billing/success`;
    const returnUrl = process.env.POLAR_RETURN_URL || url.origin;

    // Get query parameters
    const productId = url.searchParams.get('products');
    const customerId = url.searchParams.get('customerId');
    const customerExternalId = url.searchParams.get('customerExternalId');
    const customerEmail = url.searchParams.get('customerEmail');
    const customerName = url.searchParams.get('customerName');
    const metadata = url.searchParams.get('metadata');

    if (!accessToken) {
        return new Response(
            JSON.stringify({ error: 'Polar access token not configured' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }

    if (!productId) {
        return new Response(
            JSON.stringify({ error: 'Product ID is required. Pass ?products=<product_id>' }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }

    try {
        // Build checkout request body
        const checkoutBody = {
            product_price_id: productId,
            success_url: successUrl,
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
            return new Response(
                JSON.stringify({
                    error: 'Failed to create checkout session',
                    details: errorData
                }),
                {
                    status: response.status,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        const checkoutData = await response.json();

        // Redirect to Polar checkout
        return new Response(null, {
            status: 302,
            headers: {
                'Location': checkoutData.url,
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Error creating Polar checkout:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }
}
