// Vercel Edge Function to redirect merchants to Polar Customer Portal
// Allows merchants to manage their subscriptions, view invoices, update payment methods

import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

// Initialize Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

export default async function handler(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    const url = new URL(request.url);
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    const server = process.env.POLAR_ENVIRONMENT || 'sandbox';
    const returnUrl = process.env.POLAR_RETURN_URL || url.origin;

    // Get merchant ID from query params or auth header
    const merchantId = url.searchParams.get('merchantId');

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

    if (!merchantId) {
        return new Response(
            JSON.stringify({ error: 'Merchant ID is required' }),
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
        // Fetch merchant's Polar customer ID from database
        const { data: merchant, error: fetchError } = await supabase
            .from('merchants')
            .select('polar_customer_id, email, name')
            .eq('id', merchantId)
            .single();

        if (fetchError || !merchant) {
            console.error('Error fetching merchant:', fetchError);
            return new Response(
                JSON.stringify({ error: 'Merchant not found' }),
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        if (!merchant.polar_customer_id) {
            return new Response(
                JSON.stringify({
                    error: 'No subscription found. Please subscribe first.',
                    code: 'NO_SUBSCRIPTION'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        // Determine API base URL
        const apiBaseUrl = server === 'production'
            ? 'https://api.polar.sh'
            : 'https://sandbox-api.polar.sh';

        // Create customer portal session
        const response = await fetch(`${apiBaseUrl}/v1/customer-portal/sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: merchant.polar_customer_id,
                return_url: returnUrl,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Polar API error:', response.status, errorData);
            return new Response(
                JSON.stringify({
                    error: 'Failed to create customer portal session',
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

        const portalData = await response.json();

        // Redirect to customer portal
        return new Response(null, {
            status: 302,
            headers: {
                'Location': portalData.url,
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Error creating customer portal session:', error);
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
