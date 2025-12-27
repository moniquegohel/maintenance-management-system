"use client"

import { Suspense } from "react"
import RequestsPageContent from "@/components/requests/requests-page-content"

export default function RequestsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center py-12 text-muted-foreground">Loading requests...</div>}>
      <RequestsPageContent />
    </Suspense>
  )
}
