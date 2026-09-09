const fs = require('fs');
const file = '/app/applet/STEEPCOREAPI/Modules/Blueprints/Controllers/BlueprintsController.cs';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('using STEEPCOREAPI.Data;', 'using STEEPCOREAPI.Shared.Database;');

fs.writeFileSync(file, code);
