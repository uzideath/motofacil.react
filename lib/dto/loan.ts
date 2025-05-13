export interface Loan {
    id: string;
    userId: string;
    motorcycleId: string;
    totalAmount: number;
    downPayment: number;
    installments: number;
    paidInstallments: number;
    remainingInstallments: number;
    totalPaid: number;
    debtRemaining: number;
    interestRate: number;
    interestType: string;
    paymentFrequency: string;
    dailyPaymentAmount: number;
    startDate: string;
    endDate: string;
    status: string;
    user: User;
    motorcycle: Motorcycle;
    payments: Payment[];
}

interface User {
    id: string;
    name: string;
    identification: string;
    age: number;
    phone: string;
    address: string;
    refName: string;
    refID: string;
    refPhone: string;
    createdAt: string;
}

interface Motorcycle {
    id: string;
    brand: string;
    model: string;
    plate: string;
    color: string;
    cc: number;
    gps: number;
}

interface Payment {
    id: string;
    loanId: string;
    paymentMethod: string;
    amount: number;
    paymentDate: string;
    isLate: boolean;
    cashRegisterId: string | null;
}
