#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to find and kill processes using port 3000
function killPortProcesses(port = 3000) {
  return new Promise((resolve) => {
    const lsof = spawn('lsof', ['-ti', `:${port}`]);
    let pids = '';
    
    lsof.stdout.on('data', (data) => {
      pids += data.toString();
    });
    
    lsof.on('close', (code) => {
      if (pids.trim()) {
        const pidList = pids.trim().split('\n');
        console.log(`🔄 Stopping ${pidList.length} process(es) on port ${port}...`);
        
        pidList.forEach(pid => {
          try {
            process.kill(pid, 'SIGTERM');
            console.log(`✅ Stopped process ${pid}`);
          } catch (error) {
            console.log(`⚠️ Could not stop process ${pid}: ${error.message}`);
          }
        });
        
        setTimeout(resolve, 2000); // Wait 2 seconds for processes to stop
      } else {
        console.log(`✅ Port ${port} is free`);
        resolve();
      }
    });
    
    lsof.on('error', () => {
      console.log(`✅ Port ${port} is free`);
      resolve();
    });
  });
}

// Function to start the server
function startServer() {
  console.log('🚀 Starting El Principito Interactive Server...');
  
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });
  
  server.on('close', (code) => {
    console.log(`📴 Server stopped with code ${code}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGTERM');
    process.exit(0);
  });
}

// Main execution
async function main() {
  console.log('🎧 El Principito Interactive - Development Server');
  console.log('================================================');
  
  await killPortProcesses(3000);
  startServer();
}

main().catch(console.error);