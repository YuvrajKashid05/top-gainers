export function errorHandler(error, _req, res, _next) {
  console.error(
    "[api]",
    error instanceof Error ? error.message : "Unhandled error",
  );
  if (error?.name === "ZodError")
    return res.status(400).json({
      success: false,
      message: error.issues?.[0]?.message || "Invalid request",
    });
  return res.status(error?.statusCode || 500).json({
    success: false,
    message: error?.statusCode ? error.message : "Internal server error",
  });
}
