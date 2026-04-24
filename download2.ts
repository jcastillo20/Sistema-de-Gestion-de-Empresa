import fs from 'fs';
import https from 'https';
import path from 'path';

const filesToDownload = [
  'src/types.ts',
  'src/services/apiService.ts',
  'src/constants.ts',
  'src/components/common/DataTable.tsx',
  'src/mockDb.ts'
];

const baseUrl = 'https://raw.githubusercontent.com/jcastillo20/Sistema-de-Gestion-de-Empresa/main/';

const downloadFile = (file: string) => {
  return new Promise<void>((resolve, reject) => {
    const url = baseUrl + file;
    const dest = path.join(process.cwd(), file);
    
    // Ensure directory exists
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        fs.writeFileSync(dest, data);
        console.log(`Downloaded ${file}`);
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

async function main() {
  for (const file of filesToDownload) {
    try {
      await downloadFile(file);
    } catch (e) {
      console.error(`Error downloading ${file}:`, e);
    }
  }
}

main();
