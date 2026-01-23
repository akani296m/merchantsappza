// Vercel Serverless Function to handle Polar webhook events
// This processes subscription lifecycle events and updates the database

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Update merchant subscription status
async function updateMerchantSubscription(merchantId, subscriptionData) {
    const { error } = await supabase
        .from('merchants')
        .update({
            polar_subscription_id: subscriptionData.id,
            polar_customer_id: subscriptionData.customer_id,
            subscription_plan: subscriptionData.product?.name?.toLowerCase() || 'unknown',
            subscription_status: subscriptionData.status,
            subscription_started_at: subscriptionData.started_at,
            subscription_expires_at: subscriptionData.current_period_end,
            updated_at: new Date().toISOString(),
        })
        .eq('id', merchantId);

    if (error) {
        console.error('Error updating merchant subscription:', error);
        throw error;
    }
}

// Find merchant by polar customer ID or external ID
async function findMerchant(customerId, externalId) {
    // First try by polar_customer_id
    if (customerId) {
        const { data, error } = await supabase
            .from('merchants')
            .select('id')
            .eq('polar_customer_id', customerId)
            .single();

        if (data && !error) {
            return data.id;
        }
    }

    // Then try by external ID (which we set to merchant ID)
    if (externalId) {
        const { data, error } = await supabase
            .from('merchants')
            .select('id')
            .eq('id', externalId)
            .single();

        if (data && !error) {
            return data.id;
        }
    }

    return null;
}

export default async function handler(request) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            {
                status: 405,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    try {
        const payload = await request.text();
        const event = JSON.parse(payload);
        const eventType = event.type;
        const eventData = event.data;

        console.log(`Received Polar webhook: ${eventType}`);

        // Handle different event types
        switch (eventType) {
            case 'checkout.created':
                console.log('Checkout created:', eventData.id);
                break;

            case 'checkout.updated':
                console.log('Checkout updated:', eventData.id, eventData.status);
                break;

            case 'order.created':
            case 'order.paid':
                console.log('Order event:', eventType, eventData.id);
                // For one-time payments, you might want to handle this
                break;

            case 'subscription.created':
            case 'subscription.active': {
                console.log('Subscription activated:', eventData.id);
                const merchantId = await findMerchant(
                    eventData.customer_id,
                    eventData.metadata?.merchantId
                );
                if (merchantId) {
                    await updateMerchantSubscription(merchantId, {
                        ...eventData,
                        status: 'active',
                    });
                    console.log(`Updated merchant ${merchantId} subscription to active`);
                } else {
                    console.warn('Could not find merchant for subscription:', eventData.id);
                }
                break;
            }

            case 'subscription.updated': {
                console.log('Subscription updated:', eventData.id);
                const merchantId = await findMerchant(
                    eventData.customer_id,
                    eventData.metadata?.merchantId
                );
                if (merchantId) {
                    await updateMerchantSubscription(merchantId, eventData);
                    console.log(`Updated merchant ${merchantId} subscription`);
                }
                break;
            }

            case 'subscription.canceled': {
                console.log('Subscription canceled:', eventData.id);
                const merchantId = await findMerchant(
                    eventData.customer_id,
                    eventData.metadata?.merchantId
                );
                if (merchantId) {
                    await updateMerchantSubscription(merchantId, {
                        ...eventData,
                        status: 'canceled',
                    });
                    console.log(`Updated merchant ${merchantId} subscription to canceled`);
                }
                break;
            }

            case 'subscription.revoked': {
                console.log('Subscription revoked:', eventData.id);
                const merchantId = await findMerchant(
                    eventData.customer_id,
                    eventData.metadata?.merchantId
                );
                if (merchantId) {
                    await updateMerchantSubscription(merchantId, {
                        ...eventData,
                        status: 'revoked',
                    });
                    console.log(`Updated merchant ${merchantId} subscription to revoked`);
                }
                break;
            }

            case 'subscription.uncanceled': {
                console.log('Subscription uncanceled:', eventData.id);
                const merchantId = await findMerchant(
                    eventData.customer_id,
                    eventData.metadata?.merchantId
                );
                if (merchantId) {
                    await updateMerchantSubscription(merchantId, {
                        ...eventData,
                        status: 'active',
                    });
                    console.log(`Updated merchant ${merchantId} subscription reactivated`);
                }
                break;
            }

            case 'customer.created':
            case 'customer.updated':
                console.log('Customer event:', eventType, eventData.id);
                // You could store additional customer data here
                break;

            case 'customer.deleted':
                console.log('Customer deleted:', eventData.id);
                // Handle customer deletion if needed
                break;

            default:
                console.log('Unhandled event type:', eventType);
        }

        return new Response(
            JSON.stringify({ received: true }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );

    } catch (error) {
        console.error('Webhook processing error:', error);
        return new Response(
            JSON.stringify({ error: 'Webhook processing failed' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
