import { z } from "zod";

export const addColumnSchema = z
  .object({
    name: z.string().min(1, "نام ستون نمی‌تواند خالی باشد"),
    data_type: z.string().min(1, "نوع داده نمی‌تواند خالی باشد"),
    is_nullable: z.boolean().default(true),
    default_value: z.string().optional(),
  })
  /**
   * if `is_nullable` is `false`, then `default_value` must be provided.
   */
  .refine(
    (data) => {
      let isValid = true;

      // if is_nullable is true, must provide default_value
      if (data.is_nullable === false && !data.default_value) {
        isValid = false;
      }

      return isValid;
    },
    { message: "مقدار پیش‌فرض نمی‌تواند خالی باشد", path: ["default_value"] }
  );
