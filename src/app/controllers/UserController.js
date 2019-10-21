import User from '../model/User';

class UserController {
  async store(req, res) {
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
}

export default new UserController();
