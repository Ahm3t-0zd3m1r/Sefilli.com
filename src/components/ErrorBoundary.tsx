import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private resetErrorState = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const rawMessage = this.state.error?.message || '';
      let errorMessage = 'Bir şeyler yanlış gitti.';

      try {
        const parsed = JSON.parse(rawMessage || '');
        if (parsed.error && parsed.error.includes('insufficient permissions')) {
          errorMessage = 'Bu işlemi yapmak için yetkiniz bulunmuyor.';
        }
      } catch (e) {
        if (rawMessage) {
          errorMessage = rawMessage;
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-farm-cream dark:bg-zinc-950 p-4">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl max-w-lg w-full border border-red-100 dark:border-white/5">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Bir hata oluştu</h1>
            <p className="text-gray-600 dark:text-zinc-300 mb-4 text-center">{errorMessage}</p>
            {rawMessage && (
              <div className="mb-8 p-4 rounded-2xl bg-farm-cream dark:bg-zinc-800 text-xs text-gray-500 dark:text-zinc-400 break-words">
                {rawMessage}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.resetErrorState}
                className="flex-1 bg-white dark:bg-zinc-800 text-farm-olive dark:text-farm-cream px-6 py-3 rounded-full font-bold border border-farm-olive/15 dark:border-white/10 hover:bg-farm-cream dark:hover:bg-zinc-700 transition-all"
              >
                Tekrar Dene
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-farm-olive text-white px-6 py-3 rounded-full font-bold hover:bg-farm-olive/90 transition-all"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
