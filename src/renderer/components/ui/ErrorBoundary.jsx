import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-base, #11111b)',
                    color: 'var(--text-primary, #cdd6f4)',
                    fontFamily: 'var(--font-sans, system-ui)',
                    padding: 40,
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                    <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 600 }}>
                        Terjadi Kesalahan
                    </h2>
                    <p style={{
                        margin: '0 0 24px',
                        fontSize: 14,
                        color: 'var(--text-secondary, #a6adc8)',
                        maxWidth: 400
                    }}>
                        Aplikasi mengalami error yang tidak terduga.
                        Silakan reload untuk melanjutkan.
                    </p>

                    {/* Error details (collapsible) */}
                    <details style={{
                        marginBottom: 24,
                        textAlign: 'left',
                        maxWidth: 500,
                        width: '100%'
                    }}>
                        <summary style={{
                            cursor: 'pointer',
                            fontSize: 12,
                            color: 'var(--text-dim, #6c7086)',
                            marginBottom: 8
                        }}>
                            Detail Error
                        </summary>
                        <pre style={{
                            background: 'var(--bg-surface, #1e1e2e)',
                            padding: 12,
                            borderRadius: 8,
                            fontSize: 11,
                            overflow: 'auto',
                            maxHeight: 150,
                            color: '#f38ba8'
                        }}>
                            {this.state.error?.toString()}
                            {'\n\n'}
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </details>

                    <button
                        onClick={this.handleReload}
                        style={{
                            background: 'var(--accent-indigo, #6366f1)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '10px 24px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Reload Aplikasi
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
