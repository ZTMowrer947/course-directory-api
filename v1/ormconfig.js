// Imports
const path = require('path');

// Paths
const projectRoot = path.resolve(__dirname);
const sourcePath = path.join(projectRoot, 'src');
const distPath = path.join(projectRoot, 'dist');

const relativeEntityPath = path.join('database', 'entities');
const relativeMigrationPath = path.join('database', 'migrations');

/**
 * @type {import("typeorm").ConnectionOptions[]}
 */
module.exports = [
  {
    name: 'production',
    type: 'sqlite',

    database: path.join(distPath, 'database', 'fsjstd-restapi.db'),

    entities: [path.join(distPath, relativeEntityPath, '**', '*.js')],
    migrations: [path.join(distPath, relativeMigrationPath, '**', '*.js')],

    migrationsRun: true,

    cli: {
      entitiesDir: path.join(
        path.relative(projectRoot, distPath),
        relativeEntityPath
      ),
      migrationsDir: path.join(
        path.relative(projectRoot, distPath),
        relativeMigrationPath
      ),
    },
  },
  {
    name: 'staging',
    type: 'sqlite',

    database: ':memory:',

    entities: [
      path.join(sourcePath, relativeEntityPath, '**', '*.ts'),
      path.join(sourcePath, relativeEntityPath, '**', '*.js'),
    ],
    migrations: [
      path.join(sourcePath, relativeMigrationPath, '**', '*.ts'),
      path.join(sourcePath, relativeMigrationPath, '**', '*.js'),
    ],

    synchronize: true,

    logging: false,
  },
  {
    name: 'development',
    type: 'sqlite',

    database: path.join(sourcePath, 'database', 'fsjstd-restapi.db'),

    entities: [
      path.join(sourcePath, relativeEntityPath, '**', '*.ts'),
      path.join(sourcePath, relativeEntityPath, '**', '*.js'),
    ],
    migrations: [
      path.join(sourcePath, relativeMigrationPath, '**', '*.ts'),
      path.join(sourcePath, relativeMigrationPath, '**', '*.js'),
    ],

    migrationsRun: true,

    cli: {
      entitiesDir: path.join(
        path.relative(projectRoot, sourcePath),
        relativeEntityPath
      ),
      migrationsDir: path.join(
        path.relative(projectRoot, sourcePath),
        relativeMigrationPath
      ),
    },
  },
];
