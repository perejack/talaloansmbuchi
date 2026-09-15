// PayHero M-Pesa STK Push Service

export interface InitiatePaymentResult {
  success: boolean;
  checkoutId?: string;
  checkoutRequestId?: string;
  reference?: string;
  normalizedPhone?: string;
  message?: string;
  error?: string;
}

export interface PaymentStatusResult {
  success: boolean;
  status: 'paid' | 'failed' | 'pending';
  state: 'success' | 'failed' | 'pending';
  receiptNumber?: string | null;
  resultDesc?: string;
  message?: string;
}

export class PayHeroService {
  /**
   * Normalize Kenyan phone number format
   * Supports: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX, 7XXXXXXXX, 1XXXXXXXX
   */
  static formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
    if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
    if (!cleaned.startsWith('254')) cleaned = '254' + cleaned;
    return cleaned;
  }

  static isValidKenyanPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    if (/^0(7\d{8}|1\d{8})$/.test(cleaned)) return true;
    if (/^254(7\d{8}|1\d{8})$/.test(cleaned)) return true;
    if (/^(7\d{8}|1\d{8})$/.test(cleaned)) return true;
    return false;
  }

  /**
   * Initiate STK Push via PayHero
   */
  static async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    reference?: string,
    customerName?: string,
  ): Promise<InitiatePaymentResult> {
    try {
      const response = await fetch('/api/payhero/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          phoneNumber: phoneNumber,
          amount: Math.round(Number(amount)),
          description: 'AfriQuick Loan Processing Fee',
          reference: reference || `AFRIQUICK-${Date.now()}`,
          referencePrefix: 'AFRIQUICK',
          customer_name: customerName,
        }),
      });

      const data = (await response.json().catch(() => null)) as Record<string, any> | null;

      if (!response.ok || !data || data.success === false) {
        return {
          success: false,
          error: data?.message || data?.error || 'Failed to initiate STK push payment',
        };
      }

      const checkoutId = data.checkoutId || data.checkoutRequestId;
      if (!checkoutId) {
        return {
          success: false,
          error: 'Payment initiated but missing checkout identifier',
        };
      }

      return {
        success: true,
        checkoutId,
        checkoutRequestId: checkoutId,
        reference: data.reference,
        normalizedPhone: data.normalizedPhone,
        message: data.message || 'STK Push sent successfully',
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error initiating payment',
      };
    }
  }

  /**
   * Check status of PayHero transaction
   */
  static async checkPaymentStatus(checkoutId: string): Promise<PaymentStatusResult> {
    const response = await fetch('/api/payhero/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutId }),
    });

    const data = (await response.json().catch(() => null)) as Record<string, any> | null;

    if (!response.ok || !data || data.status === 'error') {
      throw new Error(data?.message || 'Transaction status check failed');
    }

    const rawStatus = String(data.rawStatus || data.status || '').toLowerCase();
    const mappedStatus = String(data.status || '').toLowerCase();

    if (
      mappedStatus === 'paid' ||
      mappedStatus === 'success' ||
      rawStatus === 'completed' ||
      rawStatus === 'success' ||
      rawStatus === 'paid'
    ) {
      return {
        success: true,
        status: 'paid',
        state: 'success',
        receiptNumber: data.receiptNumber || null,
        resultDesc: data.resultDesc || data.message || 'Payment completed successfully',
      };
    }

    if (
      mappedStatus === 'failed' ||
      rawStatus === 'failed' ||
      rawStatus === 'cancelled' ||
      rawStatus === 'canceled'
    ) {
      return {
        success: false,
        status: 'failed',
        state: 'failed',
        resultDesc: data.resultDesc || data.message || 'Payment was cancelled or failed',
      };
    }

    return {
      success: false,
      status: 'pending',
      state: 'pending',
      resultDesc: data.resultDesc || data.message || 'Payment is pending confirmation',
    };
  }
}
