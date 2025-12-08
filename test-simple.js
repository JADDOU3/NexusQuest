#!/usr/bin/env node

/**
 * Simple JavaScript Dependency Test
 * Tests the library installation feature with proper quote handling
 */

const API_BASE = 'http://localhost:3000/api';

async function request(method, endpoint, body = null, token) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
}

async function main() {
  const token = process.argv[2];
  
  if (!token) {
    console.log('Usage: node test-simple.js <token>');
    process.exit(1);
  }

  console.log('\n🧪 Testing JavaScript with Dependencies\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Execute JavaScript with axios
    console.log('\n1️⃣  Executing JavaScript code with axios dependency...\n');
    
    const jsCode = `const axios = require('axios');
const _ = require('lodash');

console.log('Testing dependencies:');
console.log('✓ axios loaded');
console.log('✓ lodash loaded');

// Test lodash
const sum = _.sum([1, 2, 3, 4, 5]);
console.log('Sum of [1,2,3,4,5]:', sum);

// Test axios exists
if (axios.VERSION) {
  console.log('Axios version:', axios.VERSION);
}

console.log('\\n✓ All dependencies working!');`;

    const response1 = await request('POST', '/execution/run-project', {
      files: [{
        name: 'main.js',
        content: jsCode,
        language: 'javascript'
      }],
      mainFile: 'main.js',
      language: 'javascript',
      dependencies: {
        'axios': '1.6.0',
        'lodash': '4.17.21'
      }
    }, token);

    if (response1.ok && response1.data.success) {
      console.log('✅ SUCCESS!\n');
      console.log('Output:');
      console.log(response1.data.output);
      console.log('\nExecution time:', response1.data.executionTime, 'ms');
    } else {
      console.log('❌ FAILED\n');
      console.log('Error:', response1.data.error);
      console.log('Output:', response1.data.output);
    }

    // Test 2: Execute Python with dependencies
    console.log('\n' + '='.repeat(60));
    console.log('\n2️⃣  Executing Python code with requests dependency...\n');
    
    const pyCode = `import requests
import json

print('Testing Python dependencies:')
print('✓ requests loaded')

# Test that requests is working
print('Requests version:', requests.__version__)

print('\\n✓ All dependencies working!');`;

    const response2 = await request('POST', '/execution/run-project', {
      files: [{
        name: 'main.py',
        content: pyCode,
        language: 'python'
      }],
      mainFile: 'main.py',
      language: 'python',
      dependencies: {
        'requests': '2.31.0'
      }
    }, token);

    if (response2.ok && response2.data.success) {
      console.log('✅ SUCCESS!\n');
      console.log('Output:');
      console.log(response2.data.output);
      console.log('\nExecution time:', response2.data.executionTime, 'ms');
    } else {
      console.log('❌ FAILED\n');
      console.log('Error:', response2.data.error);
      console.log('Output:', response2.data.output);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Test completed!\n');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
