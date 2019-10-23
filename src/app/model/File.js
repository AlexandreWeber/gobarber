import { Model, Sequelize } from 'sequelize';
import enviroment from '../../config/enviroment';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            const { protocol, server, port } = enviroment;
            return `${protocol}://${server}:${port}/files/${this.path}`;
          }
        }
      },
      {
        sequelize
      }
    );

    return this;
  }
}

export default File;
