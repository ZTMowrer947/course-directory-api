// Imports
import 'reflect-metadata';

import api from '@/api';

// Server setup
const port = Number.parseInt(process.env.PORT ?? '5000', 10);

api.listen(port, () => {
  console.log(`Course directory API now running on port ${port}...`);
});
