import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedProps,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface GitHubProfile {
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
}

interface Repository {
  name: string;
  description: string;
  stargazers_count: number;
  language: string;
  updated_at: string;
  created_at: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [topRepos, setTopRepos] = useState<Repository[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGitHubData();
  }, []);

  const fetchGitHubData = async () => {
    try {
      const [profileResponse, reposResponse] = await Promise.all([
        fetch('https://api.github.com/users/idanDayani'),
        fetch('https://api.github.com/users/idanDayani/repos'),
      ]);

      if (!profileResponse.ok || !reposResponse.ok) {
        throw new Error('Failed to fetch GitHub data');
      }

      const profileData = await profileResponse.json();
      const reposData = await reposResponse.json();

      // Calculate total stars
      const stars = reposData.reduce((acc: number, repo: Repository) => acc + repo.stargazers_count, 0);
      setTotalStars(stars);

      // Sort repos by stars and get top 3
      const sortedRepos = reposData.sort((a: Repository, b: Repository) => 
        b.stargazers_count - a.stargazers_count
      ).slice(0, 3);

      setProfile(profileData);
      setTopRepos(sortedRepos);
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Animated.View
          entering={FadeIn.duration(1000)}
          style={styles.heroSection}>
          <Image
            source={{ uri: profile?.avatar_url }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Idan Dayani</Text>
          <Text style={styles.role}>Full Stack Developer & Team Lead</Text>
        </Animated.View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="git-branch" size={24} color="#4299E1" />
            <AnimatedText style={styles.statNumber}>
              {profile?.public_repos}
            </AnimatedText>
            <Text style={styles.statLabel}>Repositories</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#4299E1" />
            <AnimatedText style={styles.statNumber}>
              {profile?.followers}
            </AnimatedText>
            <Text style={styles.statLabel}>Followers</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#4299E1" />
            <AnimatedText style={styles.statNumber}>
              {totalStars}
            </AnimatedText>
            <Text style={styles.statLabel}>Total Stars</Text>
          </View>
        </View>

        <View style={styles.topReposSection}>
          <Text style={styles.sectionTitle}>Top Repositories</Text>
          {topRepos.map((repo) => (
            <View key={repo.name} style={styles.repoCard}>
              <View style={styles.repoHeader}>
                <Text style={styles.repoName}>{repo.name}</Text>
                <View style={styles.repoStats}>
                  <Ionicons name="star" size={16} color="#F6E05E" />
                  <Text style={styles.repoStars}>{repo.stargazers_count}</Text>
                </View>
              </View>
              {repo.description && (
                <Text style={styles.repoDescription} numberOfLines={2}>
                  {repo.description}
                </Text>
              )}
              <View style={styles.repoFooter}>
                <View style={styles.repoMetadata}>
                  {repo.language && (
                    <View style={styles.languageContainer}>
                      <View
                        style={[
                          styles.languageDot,
                          { backgroundColor: '#4299E1' },
                        ]}
                      />
                      <Text style={styles.languageText}>{repo.language}</Text>
                    </View>
                  )}
                  <Text style={styles.dateText}>
                    Created {formatDistanceToNow(new Date(repo.created_at))} ago
                  </Text>
                </View>
                <Text style={styles.updatedAt}>
                  Updated {formatDistanceToNow(new Date(repo.updated_at))} ago
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.githubButton}
          onPress={() => Linking.openURL('https://github.com/idanDayani')}>
          <Ionicons name="logo-github" size={24} color="white" />
          <Text style={styles.githubButtonText}>Follow on GitHub</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A202C',
  },
  loadingText: {
    color: '#A0AEC0',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A202C',
  },
  errorText: {
    color: '#FC8181',
    fontSize: 16,
  },
  heroSection: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  role: {
    fontSize: 18,
    color: '#A0AEC0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: '#2D3748',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  topReposSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  repoCard: {
    backgroundColor: '#2D3748',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  repoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  repoName: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  repoDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 12,
  },
  repoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repoStars: {
    color: 'white',
    marginLeft: 4,
  },
  repoFooter: {
    flexDirection: 'column',
    gap: 8,
  },
  repoMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  languageText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  dateText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  updatedAt: {
    color: '#A0AEC0',
    fontSize: 12,
  },
  githubButton: {
    backgroundColor: '#4299E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    margin: 20,
  },
  githubButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});