import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import PaymentMethod from "@/models/PaymentMethod";
import CompanySettings from "@/models/CompanySettings"; // Fallback for backward compatibility

export async function GET() {
  try {
    await connectDb();
    
    // Try to fetch from new PaymentMethod collection first
    const paymentMethods = await PaymentMethod.find({}).lean();
    
    let paymentGateways: any = {};
    
    if (paymentMethods && paymentMethods.length > 0) {
      // Use new collection
      console.log("📥 Using PaymentMethod collection");
      paymentMethods.forEach(pm => {
        paymentGateways[pm.gateway] = {
          isActive: pm.isActive,
          ...(pm.gateway === 'razorpay' && {
            keyId: pm.keyId || '',
            keySecret: pm.keySecret || '',
            webhookSecret: pm.webhookSecret || ''
          }),
          ...(pm.gateway === 'stripe' && {
            publishableKey: pm.publishableKey || '',
            secretKey: pm.secretKey || '',
            webhookSecret: pm.webhookSecret || ''
          }),
          ...(pm.gateway === 'paypal' && {
            clientId: pm.clientId || '',
            clientSecret: pm.clientSecret || '',
            mode: pm.mode || 'sandbox'
          }),
          ...(pm.gateway === 'upi' && {
            upiId: pm.upiId || '',
            merchantName: pm.merchantName || ''
          }),
          ...(pm.gateway === 'cashfree' && {
            appId: pm.appId || '',
            secretKey: pm.secretKey || '',
            environment: pm.environment || 'sandbox',
            webhookSecret: pm.webhookSecret || '',
            // Map environment to mode for frontend compatibility
            mode: pm.environment === 'sandbox' ? 'sandbox' : 'live'
          })
        };
      });
    } else {
      // Fallback to old CompanySettings collection
      console.log("⚠️ PaymentMethod collection empty, falling back to CompanySettings");
      const settings = await CompanySettings.findOne({}).lean();
      if (settings?.paymentGateways) {
        paymentGateways = settings.paymentGateways;
      }
    }

    // Only return the SINGLE active and configured payment gateway
    // Only one payment method can be active at a time
    let activeGateway = null;
    
    // Check Cashfree first (priority)
    const cashfree = (paymentGateways as any).cashfree;
    if (cashfree?.isActive && 
        cashfree?.appId && 
        cashfree?.secretKey) {
      console.log("✅ Cashfree configured and active");
      const cashfreeMode = cashfree.environment === 'sandbox' ? 'sandbox' : 'live';
      activeGateway = {
        id: 'cashfree',
        name: 'Cashfree',
        type: 'card',
        keyId: cashfree.appId,
        mode: cashfreeMode,
        description: 'Pay with cards, UPI, wallets, netbanking'
      };
    }
    
    // Check Razorpay
    if (!activeGateway && paymentGateways.razorpay?.isActive && 
        paymentGateways.razorpay?.keyId && 
        paymentGateways.razorpay?.keySecret) {
      console.log("✅ Razorpay configured and active");
      activeGateway = {
        id: 'razorpay',
        name: 'Razorpay',
        type: 'card',
        keyId: paymentGateways.razorpay.keyId,
        description: 'Pay with cards, UPI, netbanking'
      };
    }

    // Check Stripe
    if (!activeGateway && paymentGateways.stripe?.isActive && 
        paymentGateways.stripe?.publishableKey && 
        paymentGateways.stripe?.secretKey) {
      console.log("✅ Stripe configured and active");
      activeGateway = {
        id: 'stripe',
        name: 'Stripe',
        type: 'card',
        keyId: paymentGateways.stripe.publishableKey,
        description: 'Pay with cards, Apple Pay, Google Pay'
      };
    }

    // Check PayPal
    if (!activeGateway && paymentGateways.paypal?.isActive && 
        paymentGateways.paypal?.clientId && 
        paymentGateways.paypal?.clientSecret) {
      console.log("✅ PayPal configured and active");
      activeGateway = {
        id: 'paypal',
        name: 'PayPal',
        type: 'wallet',
        keyId: paymentGateways.paypal.clientId,
        mode: paymentGateways.paypal.mode,
        description: 'Pay with PayPal account or cards'
      };
    }

    // Check UPI
    if (!activeGateway && paymentGateways.upi?.isActive && 
        paymentGateways.upi?.upiId && 
        paymentGateways.upi?.merchantName) {
      console.log("✅ UPI configured and active");
      activeGateway = {
        id: 'upi',
        name: 'UPI',
        type: 'upi',
        upiId: paymentGateways.upi.upiId,
        merchantName: paymentGateways.upi.merchantName,
        description: 'Pay with UPI apps'
      };
    }


    return NextResponse.json({ 
      success: true, 
      data: { 
        activeGateway, // Single active gateway
        activeGateways: activeGateway ? [activeGateway] : [] // For backward compatibility
      } 
    });
  } catch (error) {
    console.error("GET payment gateways error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch payment gateways" 
    }, { status: 500 });
  }
}
