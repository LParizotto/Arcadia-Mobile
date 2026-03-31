import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet,  Text,  View,  FlatList,  Image,  ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    try {
      const response = await axios.get(process.env.EXPO_PUBLIC_API_URL, {
        params: {
          key: process.env.EXPO_PUBLIC_API_KEY,
          page_size: 50,
        },
      });
      setGames(response.data.results);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{color: '#fff', marginTop: 10}}>Carregando Jogos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>CATÁLOGO DE JOGOS</Text>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.background_image }}
              style={styles.image}
              resizeMode="cover"
            />
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.95)']}
              style={styles.gradient}
            >
              <Text style={styles.gameName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
            </LinearGradient>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14181c',
    paddingTop: 50,
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -1,
    color: '#fff',
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 0.48,
    height: 280, 
    marginBottom: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 10,
  },
  gameName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'black',
    textShadowRadius: 5,
  },
  rating: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: '600',
  },
});