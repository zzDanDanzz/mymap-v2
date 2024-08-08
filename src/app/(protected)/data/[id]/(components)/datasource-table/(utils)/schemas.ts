import { z } from "zod";

export const addColumnSchema = z
  .object({
    name: z.string().min(1, "نام ستون نمی‌تواند خالی باشد"),
    data_type: z.string().min(1, "نوع داده نمی‌تواند خالی باشد"),
    is_nullable: z.boolean().default(true),
    default_value: z.string().optional(),
  })
  .refine(
    (data) => {
      let isValid = true;

      // if is_nullable is true, must provide default_value
      if (data.is_nullable === true && data.default_value === undefined) {
        isValid = false;
      }

      return isValid;
    },
    { message: "مقدار پیش‌فرض نمی‌تواند خالی باشد" },
  );
