import type { ReactNode } from "react"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Control, FieldPath } from "react-hook-form"
import { UserFormValues } from "../../hooks/useUserForm"

interface FormFieldWrapperProps {
    control: Control<UserFormValues>
    name: FieldPath<UserFormValues>
    label: string
    placeholder: string
    description: string
    icon: ReactNode
    type?: string
    required?: boolean
}

export function FormFieldWrapper({
    control,
    name,
    label,
    placeholder,
    description,
    icon,
    type = "text",
    required = true,
}: FormFieldWrapperProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className={`flex items-center gap-1.5 ${required ? "after:content-['*'] after:text-red-500 after:ml-0.5" : ""}`}>
                        {icon}
                        {label}
                    </FormLabel>
                    <FormControl>
                        <Input
                            type={type}
                            placeholder={placeholder}
                            {...field}
                            className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                        />
                    </FormControl>
                    <FormDescription className="text-xs">{description}</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
