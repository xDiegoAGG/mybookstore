import { UserNotFoundError } from "../../../../domain/errors/UserNotFoundError.js";

export const makeUsersController = ({ getUser, upsertProfile }) => ({
  me: async (req, res, next) => {
    try {
      const profile = await getUser.execute(req.user.userId);
      res.json(profile);
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        return res.json({
          userId: req.user.userId,
          name: null,
          address: null,
          email: req.user.email,
        });
      }
      next(err);
    }
  },

  updateMe: async (req, res, next) => {
    try {
      const { name, address } = req.body || {};
      const profile = await upsertProfile.execute({
        userId: req.user.userId,
        name,
        address,
        email: req.user.email,
      });
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },
});
