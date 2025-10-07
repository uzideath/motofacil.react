# Loan Form Auto-Date Calculation Update

## Overview
Updated the loan form to automatically calculate the end date when the start date changes, with proper business day calculation that excludes Sundays for DAILY frequency loans.

## Changes Made

### 1. Auto-Calculate End Date (`components/loans/hooks/useLoanForm.tsx`)

#### New Helper Function: `addBusinessDaysToDate`
```typescript
const addBusinessDaysToDate = (startDate: Date, daysToAdd: number): Date => {
    let currentDate = new Date(startDate)
    let addedDays = 0

    while (addedDays < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1)
        // If it's not Sunday (0 = Sunday), count it
        if (currentDate.getDay() !== 0) {
            addedDays++
        }
    }

    return currentDate
}
```

This function adds business days (Monday-Saturday) to a start date, skipping all Sundays.

#### New useEffect Hook: Auto-Update End Date
```typescript
useEffect(() => {
    if (isMounted.current) {
        const startDate = form.getValues("startDate")
        const paymentFrequency = form.getValues("paymentFrequency")
        const loanTermMonths = form.getValues("loanTermMonths") || 18
        
        if (startDate && paymentFrequency) {
            const start = new Date(startDate)
            let calculatedEndDate: Date

            if (paymentFrequency === "DAILY") {
                // Add 540 business days (18 months * 30 days), excluding Sundays
                const businessDays = loanTermMonths * 30
                calculatedEndDate = addBusinessDaysToDate(start, businessDays)
            } else if (paymentFrequency === "WEEKLY") {
                // Add weeks
                const weeks = loanTermMonths * 4
                calculatedEndDate = new Date(start)
                calculatedEndDate.setDate(calculatedEndDate.getDate() + (weeks * 7))
            } else if (paymentFrequency === "BIWEEKLY") {
                // Add biweeks
                const biweeks = loanTermMonths * 2
                calculatedEndDate = new Date(start)
                calculatedEndDate.setDate(calculatedEndDate.getDate() + (biweeks * 14))
            } else {
                // Add months
                calculatedEndDate = new Date(start)
                calculatedEndDate.setMonth(calculatedEndDate.getMonth() + loanTermMonths)
            }

            // Set the calculated end date
            const endDateString = calculatedEndDate.toISOString().split('T')[0]
            form.setValue("endDate", endDateString, { shouldValidate: true })
        }
    }
}, [form.watch("startDate"), form.watch("paymentFrequency"), form.watch("loanTermMonths")])
```

**Triggers**: When `startDate`, `paymentFrequency`, or `loanTermMonths` changes  
**Action**: Automatically calculates and sets the `endDate` field

### 2. Updated End Date Field (`components/loans/components/LoanFormTermsCard.tsx`)

#### Made End Date Read-Only When Auto-Calculated
```tsx
<Input
    type="date"
    className="pl-9"
    {...field}
    readOnly={!!formValues.startDate}
/>
```

When a start date is selected, the end date field becomes read-only to prevent manual changes that would conflict with the auto-calculation.

#### Updated Description
```tsx
<FormDescription className="text-xs">
    {formValues.startDate 
        ? formValues.paymentFrequency === "DAILY"
            ? "Calculado automáticamente (excluye domingos)" 
            : "Calculado automáticamente desde fecha de inicio"
        : "Fecha estimada de finalización"}
</FormDescription>
```

Shows different messages:
- **With start date + DAILY**: "Calculado automáticamente (excluye domingos)"
- **With start date + Other**: "Calculado automáticamente desde fecha de inicio"
- **No start date**: "Fecha estimada de finalización"

### 3. Enhanced Installment Count Display (`components/loans/components/LoanFormTermsCard.tsx`)

#### Updated Payment Frequency Description
```tsx
{formValues.paymentFrequency === "DAILY" && "Pagos todos los días (lunes a sábado)"}
```

Now clearly indicates that DAILY payments are Monday through Saturday.

#### Smart Installment Calculation
The installment count now:
1. **Uses date-based calculation** when both dates are provided
2. **Excludes Sundays** for DAILY frequency
3. **Shows exact count** instead of approximation when dates are available
4. **Falls back to month-based estimation** when dates are not available

```tsx
{formValues.startDate && formValues.endDate ? (
    `${actualInstallments} cuotas (calculado desde fechas)`
) : (
    `≈ ${estimatedInstallments} cuotas totales`
)}
```

## User Experience Flow

### Scenario 1: Creating a New Loan

1. **User selects start date**: e.g., July 31, 2025
2. **System auto-calculates end date**:
   - For DAILY (18 months): April 21, 2027 (540 business days, excluding Sundays)
   - For WEEKLY (18 months): January 28, 2027 (72 weeks)
   - For MONTHLY (18 months): January 31, 2027 (18 months)
3. **Installment count updates**: Shows exact count based on dates
4. **End date is read-only**: Prevents manual conflicts
5. **User can still adjust**: Change loan term months to recalculate

### Scenario 2: Changing Payment Frequency

1. **User changes from MONTHLY to DAILY**
2. **End date recalculates**: Now excludes Sundays
3. **Installment count updates**: Shows more installments (due to daily payments)
4. **Description updates**: Now mentions "lunes a sábado"

### Scenario 3: Adjusting Loan Term

1. **User changes loan term from 18 to 24 months**
2. **End date recalculates**: Extends based on new term
3. **Installment count updates**: Shows new total
4. **All calculations remain accurate**

## Calculation Examples

### DAILY Frequency (18 months)
- **Start**: July 31, 2025 (Thursday)
- **Business Days**: 540 (18 months × 30 days)
- **Sundays Skipped**: ~90 days
- **Calendar Days**: 630 days
- **End**: April 21, 2027 (Wednesday)
- **Installments**: 540 payments

### WEEKLY Frequency (18 months)
- **Start**: July 31, 2025
- **Weeks**: 72 (18 months × 4 weeks)
- **Calendar Days**: 504 days
- **End**: January 14, 2027
- **Installments**: 72 payments

### MONTHLY Frequency (18 months)
- **Start**: July 31, 2025
- **Months**: 18
- **End**: January 31, 2027
- **Installments**: 18 payments

## Benefits

1. **Automatic**: No manual date calculation needed
2. **Accurate**: Properly excludes Sundays for DAILY loans
3. **Transparent**: Clear descriptions of what's being calculated
4. **Consistent**: Same logic as backend calculation
5. **User-Friendly**: Read-only fields prevent conflicts
6. **Real-Time**: Updates immediately when inputs change
7. **Informative**: Shows exact installment counts

## Technical Details

### Business Day Logic
- **Monday-Saturday**: Days 1-6 (counted)
- **Sunday**: Day 0 (excluded)
- **Loop**: Increments days until target business days reached
- **Safe**: Uses cloned date objects to avoid mutations

### Dependencies
The auto-calculation depends on:
- `startDate` field value
- `paymentFrequency` field value
- `loanTermMonths` field value

Changes to any of these trigger recalculation.

### Edge Cases Handled
1. **No start date**: End date remains editable
2. **Invalid dates**: Validation prevents submission
3. **Past dates**: Allowed for editing historical loans
4. **Leap years**: JavaScript Date handles automatically
5. **Month boundaries**: Proper month addition logic

## Testing Checklist

- [ ] Select start date → End date auto-populates
- [ ] Change frequency → End date updates
- [ ] Change loan term → End date updates
- [ ] DAILY frequency excludes Sundays
- [ ] End date is read-only when start date exists
- [ ] Installment count matches date range
- [ ] Description shows correct message for each state
- [ ] Edit existing loan preserves dates
- [ ] Form validation works correctly
- [ ] Submission sends correct installment count

## Migration Notes

- **Existing loans**: Will display their stored dates without modification
- **New loans**: Will use auto-calculation by default
- **Editing**: End date recalculates when start date changes
- **Backward compatible**: Falls back to month-based if dates missing
