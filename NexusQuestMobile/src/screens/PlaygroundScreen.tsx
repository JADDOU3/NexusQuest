import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import EventSource from 'react-native-sse';
import 'react-native-url-polyfill/auto';

const DEFAULT_CODE: Record<string, string> = {
  python: `# Python Playground
print("Hello from Python!")

name = input("Enter your name: ")
print(f"Welcome, {name}!")`,
  javascript: `// JavaScript Playground
console.log("Hello from JavaScript!");

const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);`,
  java: `// Java Playground
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Welcome, " + name + "!");
        scanner.close();
    }
}`,
  cpp: `// C++ Playground
#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;
    
    string name;
    cout << "Enter your name: ";
    getline(cin, name);
    cout << "Welcome, " << name << "!" << endl;
    
    return 0;
}`,
};

type Language = 'python' | 'javascript' | 'java' | 'cpp';

export default function PlaygroundScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage]);
    setOutput('');
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please write some code first!');
      return;
    }

    // Close any previous stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsRunning(true);
    setOutput('Running...\n');

    try {
      const token = await AsyncStorage.getItem('nexusquest-token');
      const baseURL = (api.defaults.baseURL as string) ?? '';

      if (!baseURL) {
        setOutput('Error: Playground base URL is not configured.');
        setIsRunning(false);
        return;
      }

      const url = `${baseURL}/api/playground/execute`;

      // Use GET with query params for EventSource compatibility
      const params = new URLSearchParams({
        code,
        language,
        sessionId,
      }).toString();

      const es = new EventSource(`${url}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      eventSourceRef.current = es;

      es.addEventListener('message', (event: any) => {
        if (!event.data) return;

        try {
          const evt = JSON.parse(event.data);

          if (evt.type === 'stdout' && evt.data) {
            setOutput((prev) => prev + String(evt.data));
          } else if (evt.type === 'stderr' && evt.data) {
            setOutput((prev) => prev + '\n[stderr] ' + String(evt.data));
          } else if (evt.type === 'error' && evt.content) {
            setOutput((prev) => prev + '\n[error] ' + String(evt.content));
          } else if (evt.type === 'end') {
            // execution finished
            es.close();
            eventSourceRef.current = null;
            setIsRunning(false);
          }
        } catch {
          // ignore malformed chunks
        }
      });

      es.addEventListener('error', (e: any) => {
        setOutput((prev) => prev + '\n\nStream error occurred.');
        es.close();
        eventSourceRef.current = null;
        setIsRunning(false);
      });
    } catch (error: any) {
      setOutput(`Error: ${error.message || 'Failed to execute code'}`);
      setIsRunning(false);
    }
  };

  const handleSendInput = async () => {
    if (!inputValue.trim()) return;

    try {
      await api.post('/api/playground/input', {
        sessionId: sessionId,
        input: inputValue,
      });
      setInputValue('');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send input');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const languageButtons = [
    { value: 'python' as Language, label: 'Python', color: '#3b82f6' },
    { value: 'javascript' as Language, label: 'JavaScript', color: '#eab308' },
    { value: 'java' as Language, label: 'Java', color: '#ef4444' },
    { value: 'cpp' as Language, label: 'C++', color: '#a855f7' },
  ];

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Playground</Text>
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={handleRunCode}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.runButtonText}>▶ Run</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Language Selector */}
      <View style={styles.languageSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {languageButtons.map((lang) => (
            <TouchableOpacity
              key={lang.value}
              style={[
                styles.languageButton,
                language === lang.value && { backgroundColor: lang.color },
              ]}
              onPress={() => handleLanguageChange(lang.value)}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === lang.value && styles.languageButtonTextActive,
                ]}
              >
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Code Editor */}
      <View style={styles.editorContainer}>
        <Text style={styles.sectionTitle}>Code Editor</Text>
        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={setCode}
          multiline
          placeholder="Write your code here..."
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
          textAlignVertical="top"
        />
      </View>

      {/* Output */}
      <View style={styles.outputContainer}>
        <Text style={styles.sectionTitle}>Output</Text>
        <ScrollView style={styles.outputScroll}>
          <Text style={styles.outputText}>{output || 'Output will appear here...'}</Text>
        </ScrollView>
      </View>

      {/* Input Field (for programs that need input) */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Send input to program..."
          placeholderTextColor="#64748b"
          onSubmitEditing={handleSendInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendInput}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 15,
      paddingTop: 60,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
    },
    backText: {
      color: colors.primary,
      fontSize: 24,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    runButton: {
      backgroundColor: colors.success,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      minWidth: 70,
      alignItems: 'center',
    },
    runButtonDisabled: {
      opacity: 0.6,
    },
    runButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    languageSelector: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    languageButton: {
      backgroundColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 8,
    },
    languageButtonText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    languageButtonTextActive: {
      color: '#fff',
    },
    editorContainer: {
      flex: 1,
      padding: 15,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    codeInput: {
      flex: 1,
      backgroundColor: colors.card,
      color: colors.text,
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      fontFamily: 'monospace',
      borderWidth: 1,
      borderColor: colors.border,
    },
    outputContainer: {
      height: 200,
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    outputScroll: {
      flex: 1,
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outputText: {
      color: colors.success,
      fontSize: 13,
      fontFamily: 'monospace',
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 15,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 10,
    },
    inputField: {
      flex: 1,
      backgroundColor: colors.card,
      color: colors.text,
      padding: 10,
      borderRadius: 8,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sendButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      justifyContent: 'center',
    },
    sendButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });
