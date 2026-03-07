import { z } from "zod";

// register schema email, phone, password, fieldOfStudy, fieldOfInterest, dateOfBirth 
const RegisterSchema = z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    fieldOfStudy: z.array(z.string()).optional().default([]),
    fieldOfInterest: z.array(z.string()).optional().default([]),
    dateOfBirth: z.string().pipe(z.coerce.date()),
});

// login schema email, phone, password,
const LoginSchema = z.object({
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

// updateProfile schema
const UpdateProfileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    studentId: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().optional(),
    fieldOfStudy: z.array(z.string()).optional(),
    fieldOfInterest: z.array(z.string()).optional(),
    dateOfBirth: z.string().pipe(z.coerce.date()).optional(),
    collageName: z.string().optional(),
    yearOfJoining: z.number().optional(),
    yearOfPassing: z.number().optional(),
});

// changePassword schema
const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    oldPassword: z.string().min(8, "Old password must be at least 8 characters long"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});

export {
    RegisterSchema,
    LoginSchema,
    UpdateProfileSchema,
    ForgotPasswordSchema
};