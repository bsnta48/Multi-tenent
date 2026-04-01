import z from "zod"

const SignInSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"),
    rememberMe: z.string()
})

const PasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long")
}).refine((data) => (data.password === data.confirmPassword), {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

const AcceptInviteSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long"),
    email: z.string().email(),
    role: z.enum(["admin", "member"]),
    tenentId: z.string()
}).refine((data) => (data.password === data.confirmPassword), {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})


export { SignInSchema, PasswordSchema, AcceptInviteSchema }