const fs = require('fs');
const path = require('path');

// Read servicesData.js
const servicesRaw = fs.readFileSync('D:/Website/src/data/servicesData.js', 'utf-8');
const services = new Function('return ' + servicesRaw.replace(/export\s+const\s+servicesData\s*=/, '').replace(/;\s*export[\s\S]*$/, ''))();

// Read welfareBoards.js
const boardsRaw = fs.readFileSync('D:/Website/src/data/welfareBoards.js', 'utf-8');
const boards = new Function('return ' + boardsRaw.replace(/export\s+const\s+welfareBoards\s*=/, '').replace(/;\s*export[\s\S]*$/, ''))();

// Read translations.js
const transRaw = fs.readFileSync('D:/Website/src/data/translations.js', 'utf-8');
const translations = new Function('return ' + transRaw.replace(/export\s+const\s+translations\s*=/, '').replace(/;\s*export[\s\S]*$/, ''))();

fs.mkdirSync('d:/New website/data', { recursive: true });

fs.writeFileSync('d:/New website/data/services.json', JSON.stringify(services, null, 2), 'utf-8');
fs.writeFileSync('d:/New website/data/welfareBoards.json', JSON.stringify(boards, null, 2), 'utf-8');
fs.writeFileSync('d:/New website/data/translations.json', JSON.stringify(translations, null, 2), 'utf-8');

console.log('Saved data files: services.json (' + services.length + '), welfareBoards.json (' + boards.length + ')');
