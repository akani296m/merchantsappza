import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMerchantBySlug } from '../utils/getMerchantBySlug';

// Create Merchant Context
const MerchantContext = createContext();

/**
 * Provider component that fetches and provides merchant data
 * based on the merchantSlug URL parameter
 */
export function MerchantProvider({ children }) {
    const { merchantSlug } = useParams();
    const [merchant, setMerchant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchMerchant() {
            if (!merchantSlug) {
                setLoading(false);
                setNotFound(true);
                return;
            }

            setLoading(true);
            setError(null);
            setNotFound(false);

            const { merchant: fetchedMerchant, error: fetchError } = await getMerchantBySlug(merchantSlug);

            if (fetchError || !fetchedMerchant) {
                setNotFound(true);
                setError(fetchError);
            } else {
                setMerchant(fetchedMerchant);
            }

            setLoading(false);
        }

        fetchMerchant();
    }, [merchantSlug]);

    return (
        <MerchantContext.Provider value={{
            merchant,
            merchantSlug,
            loading,
            error,
            notFound
        }}>
            {children}
        </MerchantContext.Provider>
    );
}

/**
 * Hook to access merchant context
 */
export function useMerchant() {
    const context = useContext(MerchantContext);
    if (!context) {
        throw new Error('useMerchant must be used within a MerchantProvider');
    }
    return context;
}
