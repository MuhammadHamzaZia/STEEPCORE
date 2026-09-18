import fs from 'fs';

let content = fs.readFileSync('STEEPCOREAPI/Program.cs', 'utf8');

const targetStr = `        Description = "JWT Authorization header using the Bearer scheme. \n\n Enter 'Bearer' [space] and then your token in the text input below.\n\nExample: \\"Bearer 1safsfsdfdfd\\""`;

// Some OS might have \r\n
content = content.replace(/Description = "JWT Authorization header using the Bearer scheme\.[ \r\n]+Enter 'Bearer' \[space\] and then your token in the text input below\.[ \r\n]+Example: \\"Bearer 1safsfsdfdfd\\""/g, 
`Description = "JWT Authorization header using the Bearer scheme. \\r\\n\\r\\n Enter 'Bearer' [space] and then your token in the text input below.\\r\\n\\r\\nExample: \\"Bearer 1safsfsdfdfd\\""`);

fs.writeFileSync('STEEPCOREAPI/Program.cs', content);
