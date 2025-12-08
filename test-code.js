#!/usr/bin/env node

/**
 * NexusQuest Library Installation Feature - Comprehensive Test Suite
 * 
 * This script tests the complete library installation feature:
 * - Creating projects with auto-generated package.json
 * - Managing dependencies
 * - Executing code with dependencies
 */

const API_BASE = 'http://localhost:3000/api';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class TestRunner {
  constructor(token) {
    this.token = token;
    this.results = [];
    this.projectIds = {
      javascript: null,
      python: null,
    };
  }

  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  }

  log(message, type = 'info') {
    const prefix = {
      info: `${colors.blue}ℹ${colors.reset}`,
      success: `${colors.green}✓${colors.reset}`,
      error: `${colors.red}✗${colors.reset}`,
      warn: `${colors.yellow}⚠${colors.reset}`,
      test: `${colors.cyan}→${colors.reset}`,
    }[type];

    console.log(`${prefix} ${message}`);
  }

  async test(name, fn) {
    this.log(`Testing: ${name}`, 'test');
    try {
      const result = await fn();
      this.results.push({ name, passed: true, message: result });
      this.log(`${name} - PASSED`, 'success');
      return true;
    } catch (error) {
      this.results.push({ name, passed: false, message: error.message });
      this.log(`${name} - FAILED: ${error.message}`, 'error');
      return false;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    this.log('TEST SUMMARY', 'info');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    this.results.forEach((result, idx) => {
      const status = result.passed ? 'PASS' : 'FAIL';
      const color = result.passed ? colors.green : colors.red;
      console.log(`${color}${idx + 1}. ${result.name} - ${status}${colors.reset}`);
      if (result.message && !result.passed) {
        console.log(`   ${colors.yellow}${result.message}${colors.reset}`);
      }
    });

    console.log('='.repeat(60));
    console.log(`${colors.cyan}Total: ${passed}/${total} tests passed${colors.reset}\n`);

    return passed === total;
  }
}

async function main() {
  console.clear();
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║   NexusQuest Library Installation - Test Suite           ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}\n`);

  // Check if token is provided
  const token = process.argv[2];
  if (!token) {
    console.log(`${colors.red}Error: Please provide authentication token as argument${colors.reset}`);
    console.log(`\nUsage: node test-code.js <token>\n`);
    console.log('Example:');
    console.log('  node test-code.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');
    process.exit(1);
  }

  const runner = new TestRunner(token);

  // Test 1: Validate Token
  await runner.test('Validate Authentication Token', async () => {
    const response = await runner.request('GET', '/projects');
    if (!response.ok) throw new Error('Invalid token');
    return 'Token is valid';
  });

  // Test 2: Create JavaScript Project with package.json
  await runner.test('Create JavaScript Project (auto-generate package.json)', async () => {
    const response = await runner.request('POST', '/projects', {
      name: `Test JS Project ${Date.now()}`,
      description: 'Testing package.json generation',
      language: 'javascript',
    });

    if (!response.ok) throw new Error(response.data.error);

    const project = response.data.data;
    runner.projectIds.javascript = project._id;

    // Check if package.json was created
    const hasPackageJson = project.files.some(f => f.name === 'package.json');
    if (!hasPackageJson) throw new Error('package.json was not generated');

    // Verify package.json content
    const pkgFile = project.files.find(f => f.name === 'package.json');
    const pkgContent = JSON.parse(pkgFile.content);
    if (!pkgContent.name || !pkgContent.version || !pkgContent.dependencies) {
      throw new Error('package.json structure is invalid');
    }

    return `Project created with ID: ${project._id}, package.json generated successfully`;
  });

  // Test 3: Create Python Project
  await runner.test('Create Python Project', async () => {
    const response = await runner.request('POST', '/projects', {
      name: `Test Python Project ${Date.now()}`,
      description: 'Testing Python project creation',
      language: 'python',
    });

    if (!response.ok) throw new Error(response.data.error);

    const project = response.data.data;
    runner.projectIds.python = project._id;

    // Verify main.py was created
    const hasMainPy = project.files.some(f => f.name === 'main.py');
    if (!hasMainPy) throw new Error('main.py was not created');

    return `Project created with ID: ${project._id}`;
  });

  // Test 4: Add JavaScript Dependency
  await runner.test('Add JavaScript Dependency (axios)', async () => {
    const response = await runner.request(
      'POST',
      `/projects/${runner.projectIds.javascript}/dependencies`,
      {
        name: 'axios',
        version: '1.6.0',
      }
    );

    if (!response.ok) throw new Error(response.data.error);
    if (!response.data.dependencies.axios) throw new Error('axios was not added');

    return 'axios@1.6.0 added successfully';
  });

  // Test 5: Add Multiple Dependencies
  await runner.test('Add Multiple Dependencies', async () => {
    const dependencies = ['lodash', 'express', 'dotenv'];

    for (const dep of dependencies) {
      const response = await runner.request(
        'POST',
        `/projects/${runner.projectIds.javascript}/dependencies`,
        {
          name: dep,
          version: '*',
        }
      );

      if (!response.ok) throw new Error(`Failed to add ${dep}`);
    }

    return `Added ${dependencies.length} dependencies`;
  });

  // Test 6: Get All Dependencies
  await runner.test('Retrieve All Dependencies', async () => {
    const response = await runner.request(
      'GET',
      `/projects/${runner.projectIds.javascript}/dependencies`
    );

    if (!response.ok) throw new Error(response.data.error);

    const deps = Object.keys(response.data.dependencies);
    if (deps.length < 3) throw new Error('Expected at least 3 dependencies');

    return `Retrieved ${deps.length} dependencies: ${deps.join(', ')}`;
  });

  // Test 7: Update All Dependencies at Once
  await runner.test('Update All Dependencies', async () => {
    const response = await runner.request(
      'PUT',
      `/projects/${runner.projectIds.javascript}/dependencies`,
      {
        dependencies: {
          'axios': '1.6.0',
          'lodash': '4.17.21',
          'express': '4.18.2',
        },
      }
    );

    if (!response.ok) throw new Error(response.data.error);

    const depCount = Object.keys(response.data.dependencies).length;
    if (depCount !== 3) throw new Error(`Expected 3 dependencies, got ${depCount}`);

    return 'Dependencies updated successfully';
  });

  // Test 8: Delete a Dependency
  await runner.test('Delete a Dependency', async () => {
    const response = await runner.request(
      'DELETE',
      `/projects/${runner.projectIds.javascript}/dependencies/lodash`
    );

    if (!response.ok) throw new Error(response.data.error);

    const remaining = Object.keys(response.data.dependencies);
    if (remaining.includes('lodash')) throw new Error('lodash was not deleted');

    return `lodash deleted, ${remaining.length} dependencies remaining`;
  });

  // Test 9: Add Python Dependencies
  await runner.test('Add Python Dependencies', async () => {
    const pythonDeps = ['requests', 'numpy', 'pandas'];

    for (const dep of pythonDeps) {
      const response = await runner.request(
        'POST',
        `/projects/${runner.projectIds.python}/dependencies`,
        {
          name: dep,
          version: '*',
        }
      );

      if (!response.ok) throw new Error(`Failed to add ${dep}`);
    }

    return `Added ${pythonDeps.length} Python dependencies`;
  });

  // Test 10: Execute JavaScript Code with Dependencies
  await runner.test('Execute JavaScript Code with Dependencies', async () => {
    const response = await runner.request('POST', '/execution/run-project', {
      files: [
        {
          name: 'main.js',
          content: `
const axios = require('axios');
const express = require('express');

console.log('Testing JavaScript dependencies:');
console.log('- axios loaded successfully');
console.log('- express loaded successfully');
console.log('Success!');
          `.trim(),
          language: 'javascript',
        },
      ],
      mainFile: 'main.js',
      language: 'javascript',
      dependencies: {
        'axios': '1.6.0',
        'express': '4.18.2',
      },
    });

    if (!response.ok) throw new Error(response.data.error);
    if (!response.data.success) throw new Error(response.data.error);

    const hasSuccess = response.data.output.includes('Success');
    if (!hasSuccess) throw new Error('Expected output not found');

    return `Execution successful (${response.data.executionTime}ms)`;
  });

  // Test 11: Execute Python Code with Dependencies
  await runner.test('Execute Python Code with Dependencies', async () => {
    const response = await runner.request('POST', '/execution/run-project', {
      files: [
        {
          name: 'main.py',
          content: `
import requests
import numpy as np

print('Testing Python dependencies:')
print('- requests loaded successfully')
print('- numpy loaded successfully')
print('Success!')
          `.trim(),
          language: 'python',
        },
      ],
      mainFile: 'main.py',
      language: 'python',
      dependencies: {
        'requests': '2.31.0',
        'numpy': '1.24.0',
      },
    });

    if (!response.ok) throw new Error(response.data.error);
    if (!response.data.success) throw new Error(response.data.error);

    const hasSuccess = response.data.output.includes('Success');
    if (!hasSuccess) throw new Error('Expected output not found');

    return `Execution successful (${response.data.executionTime}ms)`;
  });

  // Test 12: Execute Code with No Dependencies
  await runner.test('Execute Code with No Dependencies', async () => {
    const response = await runner.request('POST', '/execution/run-project', {
      files: [
        {
          name: 'main.js',
          content: `
console.log('Hello, World!');
console.log('No dependencies needed');
          `.trim(),
          language: 'javascript',
        },
      ],
      mainFile: 'main.js',
      language: 'javascript',
    });

    if (!response.ok) throw new Error(response.data.error);
    if (!response.data.success) throw new Error(response.data.error);

    return `Execution successful (${response.data.executionTime}ms)`;
  });

  // Test 13: Test with Invalid Dependency
  await runner.test('Handle Invalid Dependency Gracefully', async () => {
    const response = await runner.request('POST', '/execution/run-project', {
      files: [
        {
          name: 'main.js',
          content: 'console.log("test");',
          language: 'javascript',
        },
      ],
      mainFile: 'main.js',
      language: 'javascript',
      dependencies: {
        'this-package-does-not-exist-12345': '1.0.0',
      },
    });

    // This test expects the execution to fail
    if (response.ok && response.data.success) {
      throw new Error('Should have failed with invalid dependency');
    }

    return 'Invalid dependency handled correctly';
  });

  // Test 14: Verify Project Files After Dependencies
  await runner.test('Verify Project Structure', async () => {
    const response = await runner.request('GET', `/projects/${runner.projectIds.javascript}`);

    if (!response.ok) throw new Error(response.data.error);

    const project = response.data.data;
    const fileNames = project.files.map(f => f.name);

    if (!fileNames.includes('main.js')) throw new Error('main.js not found');
    if (!fileNames.includes('package.json')) throw new Error('package.json not found');

    const hasDependencies = Object.keys(project.dependencies || {}).length > 0;
    if (!hasDependencies) throw new Error('No dependencies found in project');

    return `Project structure verified: ${fileNames.join(', ')}`;
  });

  // Print final summary
  console.log('');
  const allPassed = runner.printSummary();

  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error(`${colors.red}Fatal Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
