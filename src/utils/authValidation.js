import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(1, "Phone is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
    invalid_type_error: "Gender is required"
  }),
  address: z.string().trim().min(1, "Address is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

const firstZodError = (error) => {
  const issue = error.errors?.[0];
  if (!issue) {
    return "Invalid request data";
  }
  if (issue.code === "invalid_enum_value" && issue.path?.[0] === "gender") {
    return "Gender must be male, female, or other";
  }
  return issue.message;
};

export const validateRegister = (payload) => {
  const result = registerSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(firstZodError(result.error));
  }
  return result.data;
};

export const validateLogin = (payload) => {
  const result = loginSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(firstZodError(result.error));
  }
  return result.data;
};
