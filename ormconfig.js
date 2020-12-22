// Imports
const path = require('path');

// Paths
const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

/**
 * @type {import("typeorm").ConnectionOptions[]}
 */
module.exports = [
  {
    name: 'development',
    type: 'sqlite',
    database: path.join(rootDir, 'coursedir-dev.sqlite'),
    entities: [path.join(srcDir, 'entities', '**.entity.ts')],
    migrations: [path.join(srcDir, 'migrations', '**.ts')],
    cli: {
      entitiesDir: path.join('src', 'entities'),
      migrationsDir: path.join('src', 'migrations'),
    },
  },
  {
    name: 'testing',
    type: 'sqlite',
    database: ':memory:',
    entities: [path.join(srcDir, 'entities', '**.entity.ts')],
    migrations: [path.join(srcDir, 'migrations', '**.ts')],
    migrationsRun: true,
  },
  {
    name: 'production',
    type: 'sqlite',
    database: path.join(rootDir, 'coursedir-prod.sqlite'),
    entities: [path.join(distDir, 'entities', '**.entity.js')],
    migrations: [path.join(distDir, 'migrations', '**.js')],
    cli: {
      entitiesDir: path.join('dist', 'entities'),
      migrationsDir: path.join('dist', 'migrations'),
    },
  },
];
