"use client"

import { useStore } from "@/contexts/StoreContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function StoreSwitcher() {
  const { isAdmin, currentStore, allStores, switchStore, isLoading } = useStore()

  // Only show for admins
  if (!isAdmin) {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Loading stores...</span>
      </div>
    )
  }

  // No stores available
  if (allStores.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>No stores available</span>
      </div>
    )
  }

  const handleStoreChange = (storeId: string) => {
    if (storeId === "admin-view") {
      // Clear selection - go back to admin view
      localStorage.removeItem("selectedStoreId")
      window.location.reload()
    } else {
      switchStore(storeId)
    }
  }

  return (
    <div className="flex items-center gap-2 px-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentStore?.id || "admin-view"}
        onValueChange={handleStoreChange}
      >
        <SelectTrigger className="h-9 w-[200px]">
          <SelectValue placeholder="Select store">
            {currentStore ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">{currentStore.code}</span>
                <span className="text-muted-foreground">•</span>
                <span className="truncate">{currentStore.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Admin View</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="admin-view"
            className="cursor-pointer font-medium"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Admin View (All Stores)</span>
            </div>
          </SelectItem>
          {allStores.map((store) => (
            <SelectItem
              key={store.id}
              value={store.id}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{store.code}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{store.name}</span>
                </div>
                {currentStore?.id === store.id && (
                  <Check className="h-4 w-4 ml-2" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Compact version for mobile/sidebar
export function StoreSwitcherCompact() {
  const { isAdmin, currentStore, allStores, switchStore, isLoading } = useStore()

  if (!isAdmin || isLoading || allStores.length === 0) {
    return null
  }

  return (
    <Select value={currentStore?.id || ""} onValueChange={switchStore}>
      <SelectTrigger className="h-8 w-full">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              {currentStore?.code || "All"}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allStores.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{store.code}</span>
              <span className="text-muted-foreground text-xs">
                {store.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Store badge - shows current store for employees
export function StoreBadge() {
  const { currentStore, isEmployee, isLoading } = useStore()

  if (isLoading || !currentStore || !isEmployee) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary">
      <Building2 className="h-4 w-4" />
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold">{currentStore.code}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-sm">{currentStore.name}</span>
      </div>
    </div>
  )
}
