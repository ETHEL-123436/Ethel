import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { orderId, status, amount, reference } = await request.json();
    
    // Here you would typically update your database with the payment status
    console.log(`Orange Money Callback - Order ID: ${orderId}, Status: ${status}, Amount: ${amount}`);
    
    // Process the payment status and update your database
    // Example:
    // await prisma.payment.update({
    //   where: { orderId },
    //   data: { 
    //     status,
    //     amount,
    //     reference
    //   }
    // });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Orange Money Callback Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
