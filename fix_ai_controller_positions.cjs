const fs = require('fs');
const file = '/app/applet/STEEPCOREAPI/Modules/AiEngine/Controllers/AiController.cs';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    'IsExpandable = node.IsExpandable',
    'IsExpandable = node.IsExpandable,\n                        PositionX = node.PositionX,\n                        PositionY = node.PositionY'
);

code = code.replace(
    'PositionX = 0,',
    'PositionX = n.PositionX,'
);

code = code.replace(
    'PositionY = 0,',
    'PositionY = n.PositionY,'
);

fs.writeFileSync(file, code);
