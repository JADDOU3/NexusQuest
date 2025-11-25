import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  height?: string;
}

export function CodeEditor({ 
  value, 
  onChange, 
  language = 'python',
  height = '400px' 
}: CodeEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value);
  };

  const handleEditorDidMount: OnMount = (_editor, monaco) => {
    // Register Python autocomplete provider
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Python built-in functions and keywords
        const suggestions = [
          // Built-in functions
          { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Print to console' },
          { label: 'len', kind: monaco.languages.CompletionItemKind.Function, insertText: 'len(${1:sequence})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Return the length of a sequence' },
          { label: 'range', kind: monaco.languages.CompletionItemKind.Function, insertText: 'range(${1:stop})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Create a range of numbers' },
          { label: 'str', kind: monaco.languages.CompletionItemKind.Function, insertText: 'str(${1:object})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Convert to string' },
          { label: 'int', kind: monaco.languages.CompletionItemKind.Function, insertText: 'int(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Convert to integer' },
          { label: 'float', kind: monaco.languages.CompletionItemKind.Function, insertText: 'float(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Convert to float' },
          { label: 'list', kind: monaco.languages.CompletionItemKind.Function, insertText: 'list(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Create a list' },
          { label: 'dict', kind: monaco.languages.CompletionItemKind.Function, insertText: 'dict()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Create a dictionary' },
          { label: 'set', kind: monaco.languages.CompletionItemKind.Function, insertText: 'set(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Create a set' },
          { label: 'tuple', kind: monaco.languages.CompletionItemKind.Function, insertText: 'tuple(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Create a tuple' },
          { label: 'sum', kind: monaco.languages.CompletionItemKind.Function, insertText: 'sum(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Sum all items' },
          { label: 'max', kind: monaco.languages.CompletionItemKind.Function, insertText: 'max(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Return maximum value' },
          { label: 'min', kind: monaco.languages.CompletionItemKind.Function, insertText: 'min(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Return minimum value' },
          { label: 'sorted', kind: monaco.languages.CompletionItemKind.Function, insertText: 'sorted(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Return sorted list' },
          { label: 'reversed', kind: monaco.languages.CompletionItemKind.Function, insertText: 'reversed(${1:sequence})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Reverse a sequence' },
          { label: 'enumerate', kind: monaco.languages.CompletionItemKind.Function, insertText: 'enumerate(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Return enumerated pairs' },
          { label: 'zip', kind: monaco.languages.CompletionItemKind.Function, insertText: 'zip(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Zip iterables together' },
          { label: 'map', kind: monaco.languages.CompletionItemKind.Function, insertText: 'map(${1:function}, ${2:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Apply function to items' },
          { label: 'filter', kind: monaco.languages.CompletionItemKind.Function, insertText: 'filter(${1:function}, ${2:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Filter items by function' },
          { label: 'abs', kind: monaco.languages.CompletionItemKind.Function, insertText: 'abs(${1:number})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Return absolute value' },
          { label: 'round', kind: monaco.languages.CompletionItemKind.Function, insertText: 'round(${1:number})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Round a number' },
          { label: 'pow', kind: monaco.languages.CompletionItemKind.Function, insertText: 'pow(${1:base}, ${2:exp})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Return base to the power of exp' },
          { label: 'input', kind: monaco.languages.CompletionItemKind.Function, insertText: 'input(${1:prompt})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Read input from user' },
          { label: 'open', kind: monaco.languages.CompletionItemKind.Function, insertText: 'open(${1:file}, ${2:mode})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Open a file (blocked in IDE)' },
          
          // Keywords
          { label: 'def', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'def ${1:function_name}(${2:params}):\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Define a function' },
          { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'class ${1:ClassName}:\n    def __init__(self${2:, params}):\n        ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Define a class' },
          { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if ${1:condition}:\n    ${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'If statement' },
          { label: 'elif', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'elif ${1:condition}:\n    ${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Else if statement' },
          { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else:\n    ${1:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Else statement' },
          { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'For loop' },
          { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while ${1:condition}:\n    ${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'While loop' },
          { label: 'try', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Try-except block' },
          { label: 'with', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'with ${1:expression} as ${2:variable}:\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Context manager' },
          { label: 'lambda', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'lambda ${1:x}: ${2:x}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Lambda function' },
          { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'return ${1:value}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Return from function' },
          { label: 'yield', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'yield ${1:value}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Yield from generator' },
          { label: 'import', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'import ${1:module}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Import module (limited in IDE)' },
          { label: 'from', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'from ${1:module} import ${2:name}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Import from module' },
          
          // Common snippets
          { label: 'forrange', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for ${1:i} in range(${2:10}):\n    ${3:print(i)}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'For loop with range' },
          { label: 'listcomp', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '[${1:x} for ${1:x} in ${2:iterable}]', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'List comprehension' },
          { label: 'dictcomp', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '{${1:k}: ${2:v} for ${1:k}, ${2:v} in ${3:iterable}}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Dictionary comprehension' },
          { label: 'ifmain', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if __name__ == "__main__":\n    ${1:main()}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Main guard' },
        ];

        return {
          suggestions: suggestions.map(s => ({
            ...s,
            range: range,
          })),
        };
      },
    });

    // Enable parameter hints
    monaco.languages.registerSignatureHelpProvider('python', {
      signatureHelpTriggerCharacters: ['(', ','],
      provideSignatureHelp: () => {
        return {
          dispose: () => {},
          value: {
            signatures: [
              {
                label: 'print(value, ..., sep=" ", end="\\n")',
                documentation: 'Print values to console',
                parameters: [
                  { label: 'value', documentation: 'Value to print' },
                  { label: 'sep', documentation: 'Separator between values' },
                  { label: 'end', documentation: 'String appended after the last value' },
                ],
              },
            ],
            activeSignature: 0,
            activeParameter: 0,
          },
        };
      },
    });
  };

  return (
    <div className="h-full w-full relative overflow-hidden">
      <Editor
        height={height}
        defaultLanguage={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          suggestOnTriggerCharacters: true,
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          fontLigatures: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          bracketPairColorization: {
            enabled: true
          },
          guides: {
            bracketPairs: true,
            indentation: true
          },
          renderWhitespace: 'selection',
          renderLineHighlight: 'all',
        }}
      />
    </div>
  );
}