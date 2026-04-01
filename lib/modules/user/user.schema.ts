import z from "zod";
import { ROLES } from "@/lib/constants";

const ProfileSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters long"),
    lastName: z.string().min(3, "Last name must be at least 3 characters long"),
    phone: z.string().min(10, "Phone number must be at least 10 digits long").max(20, "Phone number must be at most 20 digits long"),
    dob: z.string(),
    address: z.string(),
    branch: z.string(),
    department: z.string(),
    jobTitle: z.string(),
    jobDescription: z.string(),
    joinDate: z.string(),
    level: z.string(),
    officialContact: z.string().min(10, "Official contact must be at least 10 digits long").max(20, "Official contact must be at most 20 digits long"),
    province: z.string(),
    servicePeriod: z.string(),
    status: z.string(),
    subDepartment: z.string(),
    unit: z.string()
})

const UpdateSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long").regex(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers"),
    role: z.enum(Object.values(ROLES)),
    userProfile: ProfileSchema.partial(),
    verified: z.boolean(),
    verifyCode: z.string().nullable(),
    verifyCodeExpiry: z.date().nullable()
})

const UserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long"),
}).refine((data) => (data.password === data.confirmPassword), {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

const SignUpSchema = UserSchema.extend({
    organizationName: z.string().min(3, "Organization name must be at least 3 characters long"),
})

export { UpdateSchema, ProfileSchema, SignUpSchema, UserSchema }