import {z} from "zod";

// register schema email, phone, password, fieldOfStudy, fieldOfInterest, dateOfBirth 

const RegisterSchema = z.object({
    email: z.email({
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    }),
    phone: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    fieldOfStudy: z.array(z.string()).optional(),
    fieldOfInterest: z.array(z.string()).optional(),
    dateOfBirth: z.string().optional(),
});

// login schema email, phone, password,
const LoginSchema = z.object({
    email: z.email({
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    }).optional(),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});
// updateProfile schema
const UpdateProfileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    studentId : z.string().optional(),
    email: z.email({
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    }).optional(),
    phone: z.string().optional(),
    fieldOfStudy: z.array(z.string()).optional(),
    fieldOfInterest: z.array(z.string()).optional(),
    dateOfBirth: z.string().optional(),
    collageName: z.string().optional(),
    yearOfJoining: z.number().optional(),
    yearOfPassing: z.number().optional(),
});

// changePassword schema
const ForgotPasswordSchema = z.object({
    email: z.email({
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    }),
    oldPassword: z.string().min(8, "Old password must be at least 8 characters long"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});

export { RegisterSchema, LoginSchema, UpdateProfileSchema, ForgotPasswordSchema };