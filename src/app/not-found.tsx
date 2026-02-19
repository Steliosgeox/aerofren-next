import Link from "next/link";

/**
 * Custom 404 page
 * Server component — shown when a route doesn't match.
 * Uses AEROFREN glass-theme styling with Greek text.
 */
export default function NotFound() {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.code}>404</div>
                <h1 style={styles.title}>Η σελίδα δεν βρέθηκε</h1>
                <p style={styles.message}>
                    Η σελίδα που αναζητάτε δεν υπάρχει ή έχει μετακινηθεί.
                </p>
                <div style={styles.actions}>
                    <Link href="/" style={styles.btnPrimary}>
                        Αρχική σελίδα
                    </Link>
                    <Link href="/products" style={styles.btnSecondary}>
                        Προϊόντα
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Inline styles for server component (no styled-jsx in server components)
const styles: Record<string, React.CSSProperties> = {
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
    },
    card: {
        textAlign: "center" as const,
        maxWidth: 480,
        padding: "3rem 2rem",
        borderRadius: "1.5rem",
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
    },
    code: {
        fontSize: "5rem",
        fontWeight: 700,
        lineHeight: 1,
        marginBottom: "0.5rem",
        background: "linear-gradient(135deg, #00bae2, #0066cc)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    title: {
        fontSize: "1.5rem",
        fontWeight: 600,
        margin: "0 0 0.75rem",
        color: "var(--theme-text, #e0e8f0)",
    },
    message: {
        fontSize: "1rem",
        color: "var(--theme-text-secondary, #8899aa)",
        margin: "0 0 1.5rem",
        lineHeight: 1.5,
    },
    actions: {
        display: "flex",
        gap: "0.75rem",
        justifyContent: "center",
        flexWrap: "wrap" as const,
    },
    btnPrimary: {
        display: "inline-flex",
        alignItems: "center",
        padding: "0.625rem 1.5rem",
        borderRadius: "0.75rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        textDecoration: "none",
        background: "var(--theme-accent, #00bae2)",
        color: "#fff",
    },
    btnSecondary: {
        display: "inline-flex",
        alignItems: "center",
        padding: "0.625rem 1.5rem",
        borderRadius: "0.75rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        textDecoration: "none",
        background: "rgba(255, 255, 255, 0.06)",
        color: "var(--theme-text, #e0e8f0)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
    },
};
