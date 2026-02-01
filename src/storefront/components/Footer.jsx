/**
 * Footer Component with Variants
 * Renders different footer layouts based on theme settings
 * Uses variant prop instead of separate components to reduce duplication
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaXTwitter, FaLinkedin, FaInstagram, FaYoutube, FaPinterest } from 'react-icons/fa6';
import { useTheme } from '../../context/ThemeContext';

// Social icons array for rendering
const SOCIAL_ICONS = [
    { Icon: FaXTwitter, label: 'X (Twitter)' },
    { Icon: FaLinkedin, label: 'LinkedIn' },
    { Icon: FaInstagram, label: 'Instagram' },
    { Icon: FaYoutube, label: 'YouTube' },
    { Icon: FaPinterest, label: 'Pinterest' },
];

/**
 * Social Links Component
 */
function SocialLinks({ inverted = false }) {
    return (
        <div className="flex gap-3">
            {SOCIAL_ICONS.map((social, i) => {
                const IconComponent = social.Icon;
                return (
                    <a
                        key={i}
                        href="#"
                        className="p-2 rounded-full transition-colors"
                        style={{
                            backgroundColor: inverted ? 'var(--color-background)' : 'var(--color-primary)',
                            color: inverted ? 'var(--color-primary)' : 'var(--color-background)',
                        }}
                        aria-label={social.label}
                    >
                        <IconComponent size={18} />
                    </a>
                );
            })}
        </div>
    );
}

/**
 * Newsletter Form Component
 */
function Newsletter({ inverted = false }) {
    return (
        <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 text-sm transition-colors focus:outline-none"
                style={{
                    backgroundColor: 'transparent',
                    border: `1px solid ${inverted ? 'rgba(var(--color-background-rgb), 0.3)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: inverted ? 'var(--color-background)' : 'var(--color-text)',
                }}
            />
            <button
                type="submit"
                className="px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                    backgroundColor: inverted ? 'var(--color-background)' : 'var(--color-primary)',
                    color: inverted ? 'var(--color-primary)' : 'var(--color-background)',
                    borderRadius: 'var(--radius-md)',
                }}
            >
                Subscribe
            </button>
        </form>
    );
}

/**
 * Legal Links Component
 */
function LegalLinks({ basePath, inverted = false }) {
    return (
        <div className="flex gap-6 text-sm">
            <Link
                to={`${basePath}/privacy`}
                className="transition-opacity hover:opacity-70"
                style={{ color: inverted ? 'rgba(var(--color-background-rgb), 0.7)' : 'var(--color-text-muted)' }}
            >
                Privacy Policy
            </Link>
            <Link
                to={`${basePath}/terms`}
                className="transition-opacity hover:opacity-70"
                style={{ color: inverted ? 'rgba(var(--color-background-rgb), 0.7)' : 'var(--color-text-muted)' }}
            >
                Terms of Service
            </Link>
        </div>
    );
}

/**
 * Footer Component
 * Supports three layout variants: columns, simple, minimal
 * 
 * @param {Object} props
 * @param {string} props.storeName - Store display name
 * @param {string} props.logoUrl - Logo image URL
 * @param {string} props.basePath - Base path for links
 * @param {Object} props.footerSections - Footer links grouped by section
 * @param {string} props.variant - Override variant (optional, uses theme default)
 */
export default function Footer({
    storeName,
    logoUrl,
    basePath,
    footerSections = {},
    variant: variantProp,
}) {
    const { footerVariant: contextVariant } = useTheme();
    const variant = variantProp || contextVariant;

    const currentYear = new Date().getFullYear();

    // ===== VARIANT LAYOUTS =====

    const variants = {
        // Columns: Full footer with link columns, socials, newsletter
        columns: (
            <footer
                className="px-6 md:px-12 lg:px-20"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-background)',
                    paddingTop: 'var(--spacing-section)',
                    paddingBottom: 'var(--spacing-card)',
                }}
            >
                {/* Top Grid */}
                <div
                    className="mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-16"
                    style={{ maxWidth: 'var(--spacing-container)' }}
                >
                    {/* Store Branding */}
                    <div className="col-span-12 md:col-span-5 lg:col-span-4">
                        <div className="flex flex-col items-start gap-4 mb-6">
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt={storeName}
                                    className="h-12 object-contain rounded p-1"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                />
                            ) : (
                                <div
                                    className="px-4 py-2 rounded-md flex items-center justify-center"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                >
                                    <span
                                        className="font-bold text-xl tracking-tighter uppercase"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        {storeName}
                                    </span>
                                </div>
                            )}
                            <span className="text-lg font-bold tracking-widest uppercase">
                                {storeName}
                            </span>
                        </div>
                    </div>

                    {/* Dynamic Link Sections */}
                    {Object.entries(footerSections).map(([sectionName, items]) => (
                        <div key={sectionName} className="col-span-6 md:col-span-3 lg:col-span-2">
                            <h3 className="font-bold text-lg mb-6 capitalize">{sectionName}</h3>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            to={`${basePath}${item.path === '/' ? '' : item.path}`}
                                            className="text-sm transition-opacity hover:opacity-70"
                                            style={{ color: 'rgba(var(--color-background-rgb), 0.7)' }}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Socials */}
                    <div className="col-span-12 md:col-span-12 lg:col-span-4 lg:text-right">
                        <h3 className="font-bold text-lg mb-6">Let's be social</h3>
                        <div className="flex gap-4 lg:justify-end">
                            <SocialLinks inverted />
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div
                    className="mx-auto flex flex-col-reverse md:flex-row justify-between items-start md:items-end gap-8 border-t pt-8"
                    style={{
                        maxWidth: 'var(--spacing-container)',
                        borderColor: 'rgba(var(--color-background-rgb), 0.2)'
                    }}
                >
                    <div className="flex flex-col gap-2">
                        <LegalLinks basePath={basePath} inverted />
                        <p className="mt-2 text-sm" style={{ color: 'rgba(var(--color-background-rgb), 0.5)' }}>
                            © {currentYear}, {storeName}
                        </p>
                    </div>
                    <Newsletter inverted />
                </div>
            </footer>
        ),

        // Simple: One row with logo, links, and copyright
        simple: (
            <footer
                className="py-12 px-6 border-t"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                }}
            >
                <div
                    className="mx-auto"
                    style={{ maxWidth: 'var(--spacing-container)' }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                        <div className="flex items-center gap-4">
                            {logoUrl ? (
                                <img src={logoUrl} alt={storeName} className="h-8 object-contain" />
                            ) : (
                                <span
                                    className="font-bold text-lg tracking-widths uppercase"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    {storeName}
                                </span>
                            )}
                        </div>

                        {/* Footer links in a row */}
                        <div className="flex flex-wrap justify-center gap-6">
                            {Object.values(footerSections).flat().slice(0, 6).map((item) => (
                                <Link
                                    key={item.id}
                                    to={`${basePath}${item.path === '/' ? '' : item.path}`}
                                    className="text-sm transition-opacity hover:opacity-70"
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <SocialLinks />
                    </div>

                    <div
                        className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <LegalLinks basePath={basePath} />
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            © {currentYear}, {storeName}
                        </p>
                    </div>
                </div>
            </footer>
        ),

        // Minimal: Just copyright and legal links
        minimal: (
            <footer
                className="py-6 px-6 border-t"
                style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)'
                }}
            >
                <div
                    className="mx-auto flex flex-col md:flex-row justify-between items-center gap-4"
                    style={{ maxWidth: 'var(--spacing-container)' }}
                >
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        © {currentYear} {storeName}. All rights reserved.
                    </p>
                    <LegalLinks basePath={basePath} />
                </div>
            </footer>
        ),
    };

    return variants[variant] || variants.columns;
}
