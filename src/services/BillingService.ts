import {
    InvoiceRecord,
    CostMetric,
    EnterpriseBillingOverview,
    PaymentMethod,
    SubscriptionContext
} from '../types/billing';

export class BillingService {

    public static async getBillingOverview(): Promise<EnterpriseBillingOverview> {
        // Simulating latency
        await new Promise(r => setTimeout(r, 650));

        return {
            currentTier: 'ENTERPRISE',
            totalMonthlySpend: 24500.00,
            outstandingBalance: 0.00,
            nextBillingDate: new Date(Date.now() + 15 * 86400000).toISOString(),
            costMetrics: [
                { category: 'Compute', allocatedAmount: 12000, consumedAmount: 9500, projectedOverage: 0, percentageChangeMoM: 4.2 },
                { category: 'Storage', allocatedAmount: 5000, consumedAmount: 4800, projectedOverage: 200, percentageChangeMoM: 12.5 },
                { category: 'Network', allocatedAmount: 4500, consumedAmount: 5100, projectedOverage: 600, percentageChangeMoM: 22.1 },
                { category: 'Support', allocatedAmount: 2000, consumedAmount: 2000, projectedOverage: 0, percentageChangeMoM: 0.0 },
                { category: 'Licensing', allocatedAmount: 1000, consumedAmount: 1000, projectedOverage: 0, percentageChangeMoM: -5.0 }
            ]
        };
    }

    public static async getInvoices(statusFilter = 'ALL', limit = 10, offset = 0): Promise<{ data: InvoiceRecord[], total: number }> {
        await new Promise(r => setTimeout(r, 800));

        const allInvoices: InvoiceRecord[] = Array.from({ length: 144 }).map((_, i) => {
            const generatedDate = new Date();
            generatedDate.setMonth(generatedDate.getMonth() - i);
            const isPast = i > 0;
            const isRecentOverdue = i === 1 && Math.random() > 0.8;

            let status: InvoiceRecord['status'] = 'PAID';
            let paidAt = undefined;

            if (i === 0) {
                status = 'PENDING';
            } else if (isRecentOverdue) {
                status = 'OVERDUE';
            } else {
                const pd = new Date(generatedDate);
                pd.setDate(pd.getDate() + Math.random() * 5);
                paidAt = pd.toISOString();
            }

            return {
                id: `INV-${new Date().getFullYear()}-${(1000 + i).toString()}`,
                amountDue: 24500.00,
                amountPaid: status === 'PAID' ? 24500.00 : 0.00,
                currency: 'USD',
                status,
                issuedAt: generatedDate.toISOString(),
                dueDate: new Date(generatedDate.getTime() + 30 * 86400000).toISOString(),
                paidAt
            };
        });

        let filtered = allInvoices;
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(i => i.status === statusFilter);
        }

        return {
            data: filtered.slice(offset, offset + limit),
            total: filtered.length
        };
    }

    public static async getPaymentMethods(): Promise<PaymentMethod[]> {
        await new Promise(r => setTimeout(r, 400));
        return [
            { id: 'pm_1', type: 'CREDIT_CARD', lastFour: '4242', expiryMonth: '12', expiryYear: '2025', isDefault: true, provider: 'Stripe' },
            { id: 'pm_2', type: 'ACH_TRANSFER', lastFour: '9012', isDefault: false, provider: 'Plaid' }
        ];
    }

    public static async requestSubscriptionUpgrade(target: string): Promise<boolean> {
        await new Promise(r => setTimeout(r, 1200));
        console.log(`Requested upgrade to ${target}`);
        return true; // Simulate success
    }
}
