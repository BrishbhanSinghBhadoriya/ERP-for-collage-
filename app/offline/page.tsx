"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const retry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-6">
      <Card className="max-w-xl w-full border-primary/20">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <WifiOff className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">You are offline</h1>
          <p className="text-muted-foreground">
            It looks like your internet connection is down. Check your connection and try again.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Button onClick={retry} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Retry
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


