import Joi from "joi";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import chatServices from "../../services/chat";
import status, { BLOCK } from "../../../../enums/status";
const { findUserById, createChat, findChat, updateChat, findUser } =
  chatServices;

export class chatController {
  async oneToOneChat(req, res, next) {
    const validationSchema = Joi.object({
      receiverId: Joi.string().trim().required(),
      messages: Joi.string().trim().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { receiverId, messages } = validatedBody;
      const data = await findUser({ _id: req.userId });
      if (!data) {
        throw apiError.notFound(responseMessage.USER_ID_NOT_FOUND);
      }

      const user = await findUserById(receiverId);

      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else if (user.status === status.DELETE) {
        throw apiError.unauthorized(responseMessage.USER_ID_NOT_FOUND);
      }

      const chatQuery = {
        $or: [
          { senderId: req.userId, receiverId: receiverId },
          { senderId: receiverId, receiverId: req.userId },
        ],
      };
      const existingChat = await findChat(chatQuery);

      if (existingChat) {
        existingChat.messages.push({
          senderId: req.userId,
          receiverId: receiverId,
          message: messages,
        });
        await existingChat.save();
        return res.json(new response(existingChat, responseMessage.SUCCESS));
      } else {
        const newMessage = {
          senderId: req.userId,
          receiverId: receiverId,
          messages: {
            senderId: req.userId,
            receiverId: receiverId,
            message: messages,
          },
        };
        const result = await createChat(newMessage);
        return res.json(new response(result, responseMessage.SUCCESS));
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}
export default new chatController();
