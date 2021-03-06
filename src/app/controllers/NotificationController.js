import Notification from '../schemas/Notification';
import User from '../model/User';

class NotificationController {
  async index(req, res) {
    // Verificar se o provider_id é um provider
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true }
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'O usuário não é um prestador de serviços' });
    }

    const notifications = await Notification.find({
      user: req.userId
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        read: true
      },
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
