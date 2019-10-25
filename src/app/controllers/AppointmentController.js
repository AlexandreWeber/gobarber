import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Appointment from '../model/Appointment';
import User from '../model/User';
import File from '../model/File';

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Dados incorretos' });
    }

    const { provider_id, date } = req.body;

    // Verificar se o provider_id é um provider
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'Código do prestador de serviço inválido' });
    }

    // Verifica a data informada
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: 'A data informada é menor que a data atual' });
    }

    const checkAvailability = await Appointment.findOne({
      where: { provider_id, canceled_at: null, date: hourStart }
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'Data não está disponível' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart
    });

    return res.json(appointment);
  }

  async index(req, res) {
    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null
      },
      attributes: ['id', 'date'],
      order: ['date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'path']
            }
          ]
        }
      ]
    });

    return res.json(appointments);
  }
}

export default new AppointmentController();
