import { redis } from "@/lib/redis";

export async function POST(request: Request) {
    const body = await request.json();
    const { tenentName } = body;
    if (!tenentName) {
        return Response.json({
            success: false,
            message: "Tenent name is required",
        }, { status: 400 })
    }

    try {
        const subdomain = tenentName.toLowerCase().replace(/[^a-z0-9-]/g, '')
        const subdomainAlreadyExists = await redis.get(`tenent:${subdomain}`)
        if (subdomainAlreadyExists) {
            return Response.json({
                success: false,
                message: "Subdomain already exists",
            }, { status: 400 })
        }

        const result = await redis.set(`tenent:${subdomain}`, {
            tenentId: subdomain,
            name: tenentName,
            createdAt: Date.now()
        })

        if (!result) {
            return Response.json({
                success: false,
                message: "Something went wrong",
            }, { status: 500 })
        }

        return Response.json({
            success: true,
            message: "Tenent created successfully",
        }, { status: 201 })
        
    } catch (error) {
        return Response.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 })
    }
}