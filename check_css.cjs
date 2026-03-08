
const fs = require('fs');
const content = fs.readFileSync('c:/Users/ASUS/Downloads/link-in-bio/linkzy-app/src/pages/dashboard/Dashboard.css', 'utf8');
let depth = 0;
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
        if (char === '{') depth++;
        if (char === '}') depth--;
        if (depth < 0) {
            console.log(`Error: Extra closing brace at line ${i + 1}`);
            process.exit(1);
        }
    }
}
if (depth > 0) {
    console.log(`Error: Unclosed brace! Final depth: ${depth}`);
    // Let's find exactly where it started
    let d2 = 0;
    for (let i = 0; i < lines.length; i++) {
        for (let char of lines[i]) {
            if (char === '{') d2++;
            if (char === '}') d2--;
        }
        if (d2 > 0) {
            // This line or before has an unclosed brace
        }
    }
} else {
    console.log('Braces are balanced.');
}
