/**
 * quiz controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::quiz.quiz",
  ({ strapi }) => ({
    async increasePlayCount(ctx) {
      try {
        const body = JSON.parse(ctx.request.body as string);
        if (typeof body.quizId !== "string") {
          return ctx.badRequest("quiz id is required");
        }
        const quizId = body.quizId as string;
        const quiz = await strapi.db.query("api::quiz.quiz").findOne({
          where: { id: quizId },
        });
        strapi.db.query("api::quiz.quiz").update({
          where: { id: quizId },
          data: { playCount: quiz.playCount + 1 },
        });
        return ctx.send({ playCount: quiz.playCount + 1 });
      } catch (err) {
        return ctx.badRequest(err);
      }
    },
  })
);
