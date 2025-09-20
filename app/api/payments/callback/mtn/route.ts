import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { transactionId, status } = await request.json();
    
    // Here you would typically update your database with the payment status
    console.log(`MTN Payment Callback - Transaction ID: ${transactionId}, Status: ${status}`);
    
    // Process the payment status and update your database
    // Example:
    // await prisma.payment.update({
    //   where: { transactionId },
    //   data: { status }
    // });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('MTN Callback Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
