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
}

export default new UserController();
