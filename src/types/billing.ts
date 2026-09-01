export type InvoiceStatus = 'PAID' | 'OVERDUE' | 'PENDING' | 'FAILED' | 'DRAFT';
export type SubscriptionTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM_USAGE';
export type PaymentMethodType = 'CREDIT_CARD' | 'ACH_TRANSFER' | 'WIRE' | 'CRYPTO';

export interface SubscriptionContext {
    id: string;
    targetTier: SubscriptionTier;
    isActive: boolean;
    cycleStart: string;
    cycleEnd: string;
    autoRenew: boolean;
    monthlyCost: number;
}

export interface CostMetric {
    category: 'Compute' | 'Storage' | 'Network' | 'Support' | 'Licensing';
    allocatedAmount: number;
    consumedAmount: number;
    projectedOverage: number;
    percentageChangeMoM: number;
}

export interface InvoiceRecord {
    id: string;
    amountDue: number;
    amountPaid: number;
    currency: string;
    status: InvoiceStatus;
    issuedAt: string;
    dueDate: string;
    paidAt?: string;
    downloadUrl?: string;
}

export interface EnterpriseBillingOverview {
    currentTier: SubscriptionTier;
    totalMonthlySpend: number;
    outstandingBalance: number;
    nextBillingDate: string;
    costMetrics: CostMetric[];
}

export interface PaymentMethod {
    id: string;
    type: PaymentMethodType;
    lastFour: string;
    expiryMonth?: string;
    expiryYear?: string;
    isDefault: boolean;
    provider: string;
}
