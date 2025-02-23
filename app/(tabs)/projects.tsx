import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow, isValid } from 'date-fns';

interface Repository {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
}

const languageColors: { [key: string]: string } = {
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  Python: '#3776AB',
  Java: '#B07219',
  'C++': '#F34B7D',
  Ruby: '#CC342D',
  default: '#A0AEC0',
};

// Helper function to safely format dates
const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isValid(date) ? formatDistanceToNow(date) + ' ago' : 'N/A';
};

export default function ProjectsScreen() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const response = await fetch(
        'https://api.github.com/users/idanDayani/repos'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      // Sort repositories by stars
      const sortedData = data.sort((a: Repository, b: Repository) => 
        b.stargazers_count - a.stargazers_count
      );
      setRepositories(sortedData);
    } catch (err) {
      setError('Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const renderRepository = ({ item }: { item: Repository }) => (
    <Pressable
      style={styles.repoCard}
      onPress={() => setSelectedRepo(item)}>
      <Text style={styles.repoName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.repoDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.repoFooter}>
        <View style={styles.repoMetadata}>
          {item.language && (
            <View style={styles.languageContainer}>
              <View
                style={[
                  styles.languageDot,
                  {
                    backgroundColor:
                      languageColors[item.language] || languageColors.default,
                  },
                ]}
              />
              <Text style={styles.languageText}>{item.language}</Text>
            </View>
          )}
          
          <View style={styles.starContainer}>
            <Ionicons name="star" size={16} color="#F6E05E" />
            <Text style={styles.starCount}>{item.stargazers_count}</Text>
          </View>
        </View>
        
        <View style={styles.dates}>
          <Text style={styles.dateText}>
            Created {formatDate(item.created_at)}
          </Text>
          <Text style={styles.updatedAt}>
            Updated {formatDate(item.updated_at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const RepoDetailsModal = () => (
    <Modal
      visible={!!selectedRepo}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedRepo(null)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedRepo?.name}</Text>
            <Pressable
              onPress={() => setSelectedRepo(null)}
              style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
          </View>

          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalDescription}>
              {selectedRepo?.description || 'No description available'}
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={20} color="#F6E05E" />
                <Text style={styles.statNumber}>
                  {selectedRepo?.stargazers_count || 0}
                </Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="git-network" size={20} color="#4299E1" />
                <Text style={styles.statNumber}>
                  {selectedRepo?.forks_count || 0}
                </Text>
                <Text style={styles.statLabel}>Forks</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="alert-circle" size={20} color="#FC8181" />
                <Text style={styles.statNumber}>
                  {selectedRepo?.open_issues_count || 0}
                </Text>
                <Text style={styles.statLabel}>Issues</Text>
              </View>
            </View>

            <View style={styles.datesContainer}>
              <Text style={styles.dateText}>
                Created {formatDate(selectedRepo?.created_at)}
              </Text>
              <Text style={styles.dateText}>
                Last updated {formatDate(selectedRepo?.updated_at)}
              </Text>
            </View>

            {selectedRepo?.topics && selectedRepo.topics.length > 0 && (
              <View style={styles.topicsContainer}>
                <Text style={styles.topicsTitle}>Topics</Text>
                <View style={styles.topicsList}>
                  {selectedRepo.topics.map((topic) => (
                    <View key={topic} style={styles.topicTag}>
                      <Text style={styles.topicText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Pressable
              style={styles.viewOnGithubButton}
              onPress={() => {
                if (selectedRepo?.html_url) {
                  Linking.openURL(selectedRepo.html_url);
                }
              }}>
              <Ionicons name="logo-github" size={20} color="white" />
              <Text style={styles.viewOnGithubText}>View on GitHub</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading repositories...</Text>
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
      <FlatList
        data={repositories}
        renderItem={renderRepository}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.headerTitle}>All Repositories</Text>
        }
      />
      <RepoDetailsModal />
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
  listContainer: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  repoCard: {
    backgroundColor: '#2D3748',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  repoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  repoDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 16,
  },
  repoFooter: {
    flexDirection: 'column',
    gap: 12,
  },
  repoMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  repoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  languageText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starCount: {
    color: '#A0AEC0',
    fontSize: 14,
    marginLeft: 4,
  },
  dates: {
    flexDirection: 'column',
    gap: 4,
  },
  dateText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  updatedAt: {
    color: '#A0AEC0',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A202C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    flex: 1,
  },
  modalDescription: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 24,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  datesContainer: {
    backgroundColor: '#2D3748',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  topicsContainer: {
    marginBottom: 24,
  },
  topicsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  topicTag: {
    backgroundColor: '#4299E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  topicText: {
    color: 'white',
    fontSize: 14,
  },
  viewOnGithubButton: {
    backgroundColor: '#2D3748',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  viewOnGithubText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});