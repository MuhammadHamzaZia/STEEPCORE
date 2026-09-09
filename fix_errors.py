import os
import re

directories = ['/app/applet/STEEPCOREAPI/Modules', '/app/applet/STEEPCOREAPI/Shared']

patterns = [
    (re.compile(r'BadRequest\("([^"]+)"\)'), r'BadRequest(new { message = "\1" })'),
    (re.compile(r'NotFound\("([^"]+)"\)'), r'NotFound(new { message = "\1" })'),
    (re.compile(r'Unauthorized\("([^"]+)"\)'), r'Unauthorized(new { message = "\1" })'),
    (re.compile(r'StatusCode\((\d+),\s*"([^"]+)"\)'), r'StatusCode(\1, new { message = "\2" })'),
]

for root, dirs, files in os.walk('/app/applet/STEEPCOREAPI'):
    for file in files:
        if file.endswith('.cs'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = content
            for regex, replacement in patterns:
                new_content = regex.sub(replacement, new_content)
                
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")
