export async function POST(request: Request) {
    const email = await request.json();
    if (!email.email) {
        return Response.json({ success: false, message: "Email is required" }, { status: 400 });
    }
    return Response.json({ success: true, message: "Password reset link sent successfully", email }, { status: 200 });
}