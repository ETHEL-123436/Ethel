import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { orderId, status, amount } = await request.json();
    
    // Here you would typically update your database with the payment status
    console.log(`Orange Money Callback - Order ID: ${orderId}, Status: ${status}, Amount: ${amount}`);
    
    // Process the payment status and update your database
    // Example:
    // await prisma.payment.update({
    //   where: { orderId },
    //   data: { 
    //     status,
    //     amount
    //   }
    // });
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Orange Money Callback Error:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
