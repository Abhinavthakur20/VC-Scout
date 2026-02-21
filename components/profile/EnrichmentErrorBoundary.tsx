"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { Button } from "@/components/ui/button";

interface State {
  hasError: boolean;
}

export class EnrichmentErrorBoundary extends Component<{ children: ReactNode }, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Enrichment panel error", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="mb-3 text-sm text-rose-700">Enrichment panel crashed unexpectedly.</p>
          <Button variant="secondary" size="sm" onClick={() => this.setState({ hasError: false })}>
            Retry render
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
