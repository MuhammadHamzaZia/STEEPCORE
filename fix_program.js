import fs from 'fs';

let content = fs.readFileSync('STEEPCOREAPI/Program.cs', 'utf8');

// Find the second 'var builder = WebApplication.CreateBuilder'
const secondBuilderIdx = content.indexOf('var builder = WebApplication.CreateBuilder', 100);

if (secondBuilderIdx !== -1) {
    // We appended the whole file at line 198 (approx)
    // Let's get the original file back
    let original = content.substring(secondBuilderIdx - 500);
    // actually, let's find the start of the original file
    const startOfOriginal = content.indexOf('using Microsoft.AspNetCore.Authentication.JwtBearer;');
    
    let originalFile = content.substring(content.indexOf('using Microsoft.AspNetCore.Authentication.JwtBearer;', 100)); // The second using block
    
    fs.writeFileSync('STEEPCOREAPI/Program.cs', originalFile);
}

