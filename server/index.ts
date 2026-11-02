import { createStudioApp } from './app';

const port = Number(process.env.PORT || 4310);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be a number between 1024 and 65535.');
const { app } = await createStudioApp(process.env.STUDIO_DATA_DIR || './data', port);
const server = app.listen(port, '127.0.0.1', () => console.log(`InteractiveStudio service: http://127.0.0.1:${port}`));
server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
