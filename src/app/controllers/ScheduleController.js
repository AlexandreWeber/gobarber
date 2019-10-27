import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../model/Appointment';
import User from '../model/User';

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true }
    });

    if (!checkUserProvider) {
      return res
        .status(401)
        .json({ error: 'Usuário não é um prestador de serviços' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);
    console.log(parsedDate);
    console.log(startOfDay(parsedDate));
    console.log(endOfDay(parsedDate));
    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)]
        }
      },
      order: ['date']
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
