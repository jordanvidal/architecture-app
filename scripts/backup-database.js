// scripts/backup-database.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL non trouvée dans .env');
  process.exit(1);
}

// Créer le dossier backups s'il n'existe pas
const backupsDir = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir);
}

// Nom du fichier avec date et heure
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `backup_${timestamp}.sql`;
const filepath = path.join(backupsDir, filename);

console.log('🔄 Début du backup...');
console.log(`📁 Fichier: ${filename}`);

const command = `pg_dump "${DATABASE_URL}" > "${filepath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erreur backup:', error.message);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Avertissements:', stderr);
  }
  
  // Vérifier la taille du fichier
  const stats = fs.statSync(filepath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('✅ Backup terminé !');
  console.log(`📏 Taille: ${fileSizeInMB} MB`);
  console.log(`📍 Emplacement: ${filepath}`);
  
  // Nettoyer les vieux backups (garder les 10 derniers)
  cleanOldBackups();
});

function cleanOldBackups() {
  const files = fs.readdirSync(backupsDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      path: path.join(backupsDir, f),
      time: fs.statSync(path.join(backupsDir, f)).mtime
    }))
    .sort((a, b) => b.time - a.time);
  
  if (files.length > 10) {
    const toDelete = files.slice(10);
    toDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️ Ancien backup supprimé: ${file.name}`);
    });
  }
}