const { z } = require("zod");

// Validation error handler middleware
const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Merge params, query, and body
            const data = { ...req.params, ...req.query, ...req.body };
            schema.parse(data);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                for (const issue of error.issues) console.log("err-> ", issue);

                return res.status(400).json({
                    success: false,
                    error: "Validation failed",
                    details: error.errors.map((e) => ({
                        path: e.path.join("."),
                        message: e.message,
                    })),
                    code: "VALIDATION_ERROR",
                });
            }
            next(error);
        }
    };
};

// Idempotency key validation
const idempotencyKeySchema = z.object({
    idempotencyKey: z.string().uuid().optional(),
});

module.exports = {
    validate,
    idempotencyKeySchema,
};
