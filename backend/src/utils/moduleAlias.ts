import path from 'path';
import moduleAlias from 'module-alias';

const projectRoot = path.resolve(__dirname, '..');

moduleAlias.addAliases({
  '@constants': path.join(projectRoot, 'constants'),
});

