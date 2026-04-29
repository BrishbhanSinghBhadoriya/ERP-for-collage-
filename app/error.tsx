"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => {
    // Log the error to an error reporting service if desired
    // console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-6">
      <Card className="max-w-xl w-full border-destructive/30">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try again. If the problem persists, contact support.
          </p>
          {error?.message && (
            <code className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 max-w-full truncate" title={error.message}>
              {error.message}
            </code>
          )}
          <div className="flex items-center gap-3 mt-2">
            <Button onClick={() => reset()} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Try again
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" /> Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


