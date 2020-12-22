// Babel registration
require('@babel/register')({
  extensions: ['.ts'],
});

// Load TypeORM CLI
require('typeorm/cli');
