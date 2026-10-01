export function validate(schemas) {
  return (req, _res, next) => {
    try {
      req.validated = {};
      for (const [target, schema] of Object.entries(schemas)) req.validated[target] = schema.parse(req[target]);
      next();
    } catch (error) { next(error); }
  };
}
