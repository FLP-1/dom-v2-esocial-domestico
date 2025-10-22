import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    // ✅ Detectar sistema operacional
    const platform = process.platform;
    let ssid = 'Não detectado';
    let error: string | null = null;

    try {
      if (platform === 'win32') {
        // Windows - usar netsh
        const { stdout } = await execAsync('netsh wlan show interfaces');
        const lines = stdout.split('\n');
        
        for (const line of lines) {
          if (line.includes('SSID') && !line.includes('BSSID')) {
            const match = line.match(/SSID\s*:\s*(.+)/);
            if (match && match[1].trim() && match[1].trim() !== '') {
              ssid = match[1].trim();
              break;
            }
          }
        }
      } else if (platform === 'darwin') {
        // macOS - usar networksetup
        const { stdout } = await execAsync('networksetup -getairportnetwork en0');
        const match = stdout.match(/Current Wi-Fi Network: (.+)/);
        if (match && match[1].trim()) {
          ssid = match[1].trim();
        }
      } else if (platform === 'linux') {
        // Linux - usar iwgetid
        try {
          const { stdout } = await execAsync('iwgetid -r');
          if (stdout.trim()) {
            ssid = stdout.trim();
          }
        } catch {
          // Fallback para nmcli
          const { stdout } = await execAsync('nmcli -t -f active,ssid dev wifi | grep "^yes:" | cut -d: -f2');
          if (stdout.trim()) {
            ssid = stdout.trim();
          }
        }
      }
    } catch (execError) {
      error = execError instanceof Error ? execError.message : 'Erro ao executar comando';
    }

    // ✅ Rate limiting ajustado
    const now = Date.now();
    const lastCall = global.lastSSIDCall || 0;
    const timeDiff = now - lastCall;
    
    if (timeDiff < 1000) { // 1 segundo entre chamadas (reduzido)
      return res.status(429).json({ 
        success: false, 
        error: 'Rate limit: aguarde 1 segundo entre chamadas',
        ssid: 'Rate limited',
        platform: platform
      });
    }
    
    global.lastSSIDCall = now;

    return res.status(200).json({
      success: true,
      ssid: ssid,
      platform: platform,
      error: error,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na API de SSID:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      ssid: 'Erro',
      platform: process.platform
    });
  }
}