import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { getTutorial, type Tutorial } from '../services/tutorialService';
import { useTheme } from '../context/ThemeContext';

export default function TutorialDetailScreen({ route, navigation }: any) {
  const { tutorialId } = route.params;
  const { theme, colors } = useTheme();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTutorial();
  }, [tutorialId]);

  const loadTutorial = async () => {
    try {
      const t = await getTutorial(tutorialId);
      setTutorial(t);
    } catch (error) {
      console.error('Failed to load tutorial:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!tutorial) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Tutorial not found</Text>
      </View>
    );
  }

  // Build markdown content from tutorial sections
  const markdownContent = tutorial.sections
    .map((section) => {
      const heading = `## ${section.title}`;
      const body = section.content || '';
      const code = section.codeExample
        ? `\n\n\n\n
\n\n`
        : '';
      return `${heading}\n\n${body}${code}`;
    })
    .join('\n\n---\n\n');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {tutorial.title}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.title}>{tutorial.title}</Text>
          <Text style={styles.description}>{tutorial.description}</Text>
          
          <View style={styles.badges}>
            <View style={styles.languageBadge}>
              <Text style={styles.languageText}>{tutorial.language}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(tutorial.difficulty) }]}>
              <Text style={styles.difficultyText}>{tutorial.difficulty}</Text>
            </View>
          </View>
        </View>

        <View style={styles.markdownContainer}>
          <Markdown
            style={{
              body: { color: colors.textSecondary, fontSize: 16, lineHeight: 24 },
              heading1: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
              heading2: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
              heading3: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
              code_block: { backgroundColor: colors.card, padding: 10, borderRadius: 8, color: colors.text, fontFamily: 'monospace' },
              code_inline: { backgroundColor: colors.card, padding: 2, borderRadius: 4, color: colors.text, fontFamily: 'monospace' },
              link: { color: colors.primary },
              list_item: { color: colors.textSecondary, marginBottom: 5 },
            }}
          >
            {markdownContent}
          </Markdown>
        </View>
      </ScrollView>
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
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      paddingTop: 60,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 15,
    },
    backText: {
      color: colors.primary,
      fontSize: 24,
      fontWeight: '600',
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    errorText: {
      color: colors.error,
      fontSize: 16,
    },
    content: {
      flex: 1,
    },
    infoCard: {
      backgroundColor: colors.card,
      margin: 15,
      padding: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    description: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 15,
    },
    badges: {
      flexDirection: 'row',
      gap: 10,
    },
    languageBadge: {
      backgroundColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    languageText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    difficultyBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    difficultyText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    markdownContainer: {
      padding: 15,
      paddingBottom: 40,
    },
  });
