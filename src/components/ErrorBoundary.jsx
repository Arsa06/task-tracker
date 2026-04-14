import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button, Card } from './ui/Base';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        if (typeof this.props.onError === 'function') {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-dark-bg">
                    <Card className="w-full max-w-xl border-accent/20 p-8 text-center shadow-2xl shadow-accent/10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
                            <AlertTriangle size={30} />
                        </div>
                        <h1 className="mt-6 text-3xl font-bold font-outfit text-gray-900 dark:text-white">
                            Something went wrong
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                            Taskyy ran into an unexpected issue. Please refresh the page and try again.
                        </p>
                        <div className="mt-6 flex justify-center">
                            <Button type="button" onClick={() => window.location.reload()}>
                                <RefreshCcw size={16} /> Reload App
                            </Button>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    onError: PropTypes.func,
};

ErrorBoundary.defaultProps = {
    onError: undefined,
};

export default ErrorBoundary;
