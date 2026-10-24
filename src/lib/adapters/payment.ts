import { Order, PaymentAdapter } from '../types'

// ============================================================
// Stub Payment Adapter
// TODO: Replace with CMI (Centre Monétique Interbancaire) gateway
// CMI integration docs: https://www.cmi.co.ma
//
// To integrate CMI:
// 1. Create adapters/cmi-payment.ts
// 2. Implement PaymentAdapter using CMI's server-to-server API
// 3. Environment vars needed: CMI_MERCHANT_ID, CMI_API_KEY, CMI_SECRET
// 4. Change the export below to use the CMI adapter
// ============================================================

const stubPaymentAdapter: PaymentAdapter = {
  async processPayment(order: Order) {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (order.paymentMethod === 'cod') {
      return {
        success: true,
        transactionId: `COD-${Date.now()}`,
      }
    }

    // TODO: Implement CMI card payment
    // const cmiResponse = await cmiGateway.charge({
    //   amount: order.total,
    //   currency: 'MAD',
    //   cardToken: cardToken,
    //   merchantId: process.env.CMI_MERCHANT_ID,
    //   storeKey: process.env.CMI_SECRET,
    // })
    return {
      success: true,
      transactionId: `CARD-${Date.now()}`,
    }
  },
}

export const paymentAdapter: PaymentAdapter = stubPaymentAdapter
