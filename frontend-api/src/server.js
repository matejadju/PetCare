import app from './app.js';
import { config } from './config/env.js';

app.listen(config.port, () => {
    console.log(
        `PetCare Frontend API running on port ${config.port}`
    );
});