"use client"

import type React from "react"
import { useState } from "react"
import { Form } from "@/components/ui/form"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import type { Motorcycle } from "@/lib/types"
import { useMotorcycleForm } from "./hooks/useMotorcycleForm"
import { MotorcycleDialogHeader } from "./form/MotorcycleDialogHeader"
import { BasicInfoSection } from "./form/MotorcycleBasicInfoSection"
import { FormErrorSummary } from "./form/MotorcycleErrorFormSummary"
import { FormActions } from "./form/MotorcycleFormActions"
import { IdentificationSection } from "./form/MotorcycleIdentificationSection"
import { CharacteristicsSection } from "./form/MotorcyleCharacteristicsSecion"

type Props = {
  children: React.ReactNode
  motorcycleId?: string
  motorcycleData?: Motorcycle
  onCreated?: (newMotorcycle?: Motorcycle) => void
}

export function MotorcycleForm({ children, motorcycleId, motorcycleData, onCreated }: Props) {
  const [open, setOpen] = useState(false)

  const { form, loading, onSubmit, resetForm, isEditing, hasErrors } = useMotorcycleForm({
    motorcycleId,
    motorcycleData,
    onCreated,
    onClose: () => {
      setOpen(false)
      resetForm()
    },
  })

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <MotorcycleDialogHeader isEditing={isEditing} onClose={handleClose} />

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-8">
              <BasicInfoSection control={form.control} />
              <CharacteristicsSection control={form.control} />
              <IdentificationSection control={form.control} />

              {hasErrors && <FormErrorSummary errors={form.formState.errors} />}

              <FormActions loading={loading} isEditing={isEditing} onCancel={handleClose} />
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
