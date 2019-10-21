import * as Yup from 'yup';
import User from '../model/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6)
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: `Dados incorretos` });
    }

    const emailExists = req.body.email;
    const userExists = await User.findOne({ where: { email: emailExists } });

    if (userExists) {
      return res
        .status(400)
        .json({ error: `Usuário ${emailExists} já existe` });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider
    });
  }

  async index({ res }) {
    const users = await User.findAll();

    return res.json(users);
  }

  async show(req, res) {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });

    if (user) {
      return res.json(user);
    }

    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      )
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Dados incorretos' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (user.email !== email) {
      const emailExists = req.body.email;
      const userExists = await User.findOne({ where: { email: emailExists } });

      if (userExists) {
        return res
          .status(400)
          .json({ error: `Usuário ${emailExists} já existe` });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha anterior inválida' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      provider
    });
  }
}

export default new UserController();
