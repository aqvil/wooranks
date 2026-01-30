import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";

export function CanonicalTag() {
    const [location] = useLocation();
    // Ensure the base URL does not have a trailing slash, and handle potential missing env var gracefully
    const baseUrl = (import.meta.env.VITE_BASE_URL || window.location.origin).replace(
        /\/$/,
        ""
    );
    const canonicalUrl = `${baseUrl}${location}`;

    return (
        <Helmet>
            <link rel="canonical" href={canonicalUrl} />
        </Helmet>
    );
}
