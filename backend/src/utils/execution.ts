// Shared execution utilities: language image map, default filenames, and basic exec commands

export const languageImages: Record<string, string> = {
  python: 'nexusquest-python',
  javascript: 'nexusquest-javascript',
  java: 'nexusquest-java',
  cpp: 'nexusquest-cpp',
  go: 'nexusquest-go',
};

// Choose default filename based on language and context
// variant controls historical differences across routes
// - 'stream' used to prefer main.js
// - 'playground'/'simple' used to prefer index.js
export function getDefaultFileName(
  language: string,
  variant: 'stream' | 'playground' | 'simple' = 'stream',
  codeForJava?: string
): string {
  switch (language) {
    case 'python':
      return 'main.py';
    case 'javascript':
      return variant === 'stream' ? 'main.js' : 'index.js';
    case 'cpp':
      return 'main.cpp';
    case 'java': {
      if (codeForJava) {
        const classMatch = codeForJava.match(/public\s+class\s+(\w+)/);
        return classMatch ? `${classMatch[1]}.java` : 'Main.java';
      }
      return 'Main.java';
    }
    default:
      return 'code.txt';
  }
}

// Basic execution command builder used by stream/simple/playground routes
// For advanced project execution (Maven/CMake, etc), project-execution keeps its own logic.
export function buildExecCommand(
  language: string,
  baseDir: string,
  files: Array<{ name: string; content: string }>,
  mainFile: string
): string {
  switch (language.toLowerCase()) {
    case 'python':
      // Preserve PYTHONPATH to allow intra-folder imports
      return `cd ${baseDir} && PYTHONPATH=${baseDir} python3 -u ${mainFile}`;

    case 'javascript':
      return `cd ${baseDir} && node ${mainFile}`;

    case 'java': {
      const mainFileContent = files.find(f => f.name === mainFile)?.content || '';
      const classMatch = mainFileContent.match(/public\s+class\s+(\w+)/);
      const className = classMatch ? classMatch[1] : 'Main';
      const javaFiles = files.filter(f => f.name.endsWith('.java')).map(f => f.name).join(' ');
      return `cd ${baseDir} && javac ${javaFiles} -d . && java -cp . ${className}`;
    }

    case 'cpp': {
      const cppFiles = files.filter(f => f.name.endsWith('.cpp')).map(f => f.name).join(' ');
      return `cd ${baseDir} && g++ -std=c++20 -I${baseDir} ${cppFiles} -o a.out && ./a.out`;
    }

    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}
