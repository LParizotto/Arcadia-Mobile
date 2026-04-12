import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native'
import axios from 'axios'
import { LinearGradient } from 'expo-linear-gradient' // gradiente pro card ficar mais bonito

export default function App () {
  const [games, setGames] = useState([]) // const que os jogos vão ser guardados
  const [loading, setLoading] = useState(true)
  const [searchGames, setSearchGames] = useState('') // const para barra de pesquisa

  const [modalVisible, setModalVisible] = useState(false) // const do modal (sempre começa em false para não aparecer a não ser q o usuário clique)
  const [selectedGame, setSelectedGame] = useState(null) // pega o jogo q foi clicado para mostrar no modal

  const [loadingMore, setLoadingMore] = useState(false) // loading pra scroll infinito

  const fetchGames = async (isNewSearch = false) => {
    if (isNewSearch) setLoading(true) // aqui eu vejo se a lista vai começar do zero ou só está somando itens na lista que já existe
    else setLoadingMore(true) // se for só o carregamento do scroll ele ativa a função pra carregar mais jogos quando chegar no rodapé (final da página)

    try {
      const randomPage = Math.floor(Math.random() * 50) + 1 // aqui a página que vai ser exibida é aleatória (pega um número entre 1 e 50)

      const response = await axios.get(process.env.EXPO_PUBLIC_API_URL, { // faz a chamada http pra URL da API (tá salva na .ENV)
        params: { // envia a chave da API e os filtros da requisição
          key: process.env.EXPO_PUBLIC_API_KEY,
          page_size: 50, // limite de 50 itens
          page: randomPage, // página randomizada 
          search: searchGames.trim() !== '' ? searchGames : '' // se tiver algo no search ele ignora a página randomizada e busca o texto que foi  pesquisado (ex.: zelda), se for search vazio ele obedece o randomPage
        }
      })
 
      const newGames = response.data.results // armazena o array de jogos 

      setGames(prev => { // atualiza a lista com os valores antigos
        if (isNewSearch) return newGames // se for busca nova, troca a lista antiga pela nova

        // se for scroll, filtra apenas para não repetir os jogos iguais na tela
        const filtered = newGames.filter( // filtro pra não aparecer o mesmo jogo (compara com os jogos que estão na PREV, se já tem, o jogo é descartado)
          game => !prev.some(oldGame => oldGame.id === game.id)
        )
        return [...prev, ...filtered] // junta os jogos da PREV com os jogos que foram filtrados (aumenta o tamanho do array)
      })
    } catch (error) {
      console.error('Erro ao buscar jogos:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSearch = async () => { // quando algo algum jogo é pesquisado 
    if (searchGames.trim() === '') { // se a pesquisa não tiver nada, só faz a busca do fetch normal
      fetchGames(true)
      return
    }
    setLoading(true) // loading pra busca 
    try {
      const response = await axios.get(process.env.EXPO_PUBLIC_API_URL, {
        params: { // faz a busca com o page_size maior, pra mostrar os jogos que foram pesquisados
          key: process.env.EXPO_PUBLIC_API_KEY,
          search: searchGames,
          page_size: 60
        }
      })
      setGames(response.data.results) // substitui TODA a lista, pelos jogos que foram achados na pesquisa
    } catch (error) {
      console.error('Erro ao carregar jogos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => { // função chamada quando o usuário chega no final da lista (carrega mais jogos)
    if (!loadingMore && !loading && searchGames.trim() === '') { // busca somente se não estiver carregando algo (scroll infinito ou pesquisa)
      fetchGames(false) // desativa a função do fetch pra somar os itens no array, não para substituilos
    }
  }

  const handleOpenModal = game => { 
    setSelectedGame(game) // pega o item clicado
    setModalVisible(true) // ativa o modal
  }

  const handleRandomGame = () => {
    if (games.length > 0) { // vê se o jogo já está no array carregado 
      const randomIndex = Math.floor(Math.random() * games.length) // sorteia o jogo entre 0 e o último jogo carregado do array

      const randomGame = games[randomIndex] // pega o jogo e abre o modal
      setSelectedGame(randomGame) /
      setModalVisible(true)
    }
  }

  useEffect(() => {
    fetchGames(true)
  }, []) // array vazio, carrega só quando a tela for montada na primeira vez 

  return (
    <View style={styles.container}>
      <StatusBar style='light' />
      <Text style={styles.title}>CATÁLOGO DE JOGOS</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder='Procurar um jogo...'
          placeholderTextColor='#888'
          value={searchGames}
          onChangeText={setSearchGames}
          onSubmitEditing={handleSearch} // pesquias com o ENTER
          returnKeyType='search'
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          {/* pesquisa quando clica no botão de BUSCAR */}
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size='large' color='#0561ff' />
          <Text style={{ color: '#fff', marginTop: 10 }}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore} // a função quando chega no fim
          onEndReachedThreshold={0.5} // detecta o fim quando faltar 50% da última tela
          ListFooterComponent={
            // loading quando carregar mais jogos
            loadingMore && (
              <View style={{ paddingVertical: 70 }}>
                <ActivityIndicator size='small' color='#0561ff' />
              </View>
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleOpenModal(item)}
            >
              <Image
                source={{ uri: item.background_image }}
                style={styles.image}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.95)']}
                style={styles.gradient}
              >
                <Text style={styles.gameName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.rating}>
                  ⭐ {item.rating?.toFixed(1) || '0.0'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.randomButton} onPress={handleRandomGame}>
        <Text style={styles.randomButtonText}>Jogo aleatório</Text>
      </TouchableOpacity>

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalCentered}>
          <View style={styles.modalContent}>
            {selectedGame && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedGame.background_image }}
                  style={styles.modalImage}
                />

                <View style={styles.modalDetails}>
                  <Text style={styles.modalTitle}>{selectedGame.name}</Text>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Lançamento:</Text>
                    <Text style={styles.modalValue}>
                      {selectedGame.released || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Avaliação:</Text>
                    <Text style={styles.modalValue}>
                      ⭐ {selectedGame.rating}
                    </Text>
                  </View>

                  <Text style={styles.modalLabel}>Gêneros:</Text>
                  <Text style={styles.modalValue}>
                    {selectedGame.genres?.map(g => g.name).join(', ')}
                  </Text>

                  <Text style={styles.modalLabel}>Plataformas:</Text>
                  <Text style={styles.modalValue}>
                    {selectedGame.platforms
                      ?.map(p => p.platform.name)
                      .join(', ')}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14181c',
    paddingTop: 50,
    paddingHorizontal: 12
  },
  loadingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
    letterSpacing: -1
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    height: 50,
    gap: 10
  },
  input: {
    flex: 1,
    backgroundColor: '#1f2429',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#30363d'
  },
  searchButton: {
    backgroundColor: '#0561ff',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  row: {
    justifyContent: 'space-between'
  },
  card: {
    flex: 0.48,
    height: 250,
    marginBottom: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 10
  },
  gameName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#fff',
    marginBottom: 2
  },
  rating: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: '600'
  },

  modalCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)'
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1f2429',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#30363d'
  },
  modalImage: {
    width: '100%',
    height: 200
  },
  modalDetails: {
    padding: 20
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15
  },
  modalInfoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10
  },
  modalLabel: {
    color: '#a7a7a7',
    fontSize: '16',
    fontWeight: 'bold'
  },
  modalValue: {
    color: '#ffff',
    fontSize: 14,
    marginBottom: 5
  },
  closeButton: {
    backgroundColor: '#0561ff',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  randomButton: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    left: '28%',
    backgroundColor: '#0561ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#00000055'
  },
  randomButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase'
  }
})
