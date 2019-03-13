import React from 'react'
import { 
  Alert, 
  Keyboard, 
  ScrollView, 
  StyleSheet, 
  TextInput,
  Modal,
  TouchableOpacity, 
  View,
  RefreshControl } from 'react-native'

import API, { graphqlOperation } from '@aws-amplify/api'
import Auth from '@aws-amplify/auth'
import Amplify from '@aws-amplify/core'

import { Card, Icon, Text } from 'native-base'

import config from '../aws-exports'
import { 
  createPost, 
  deletePost, 
  listPosts, 
  createLike, 
  deleteLike } from '../GraphQL/GraphQL'

// configure the app with Amplify 
Amplify.configure(config)

export default class Upload extends React.Component {
  state = { 
    posts: [],
    postsUser: '',
    postContent: '',
    postOwnerId: '',
    postOwnerUsername: '',
    modalVisible: false,
    likeOwnerUsername: '',
    likeOwnerId: '',
  }

  componentDidMount = async () => {
    await Auth.currentAuthenticatedUser()
    .then(user => {
      this.setState(
        {  
          postOwnerUsername: user.username,
          likeOwnerUsername: user.username,
          postOwnerId: user.attributes.sub,
          likeOwnerId: user.attributes.sub,
        }
      )
    })
    .catch(err => console.log(err))
    await this.listPosts()
    // Update the number of entries in the parent component: ChallengeScreen
    await this.props.countPosts()
  }

  _onRefresh = () => {
    this.setState({refreshing: true})
    this.listPosts().then(() => {
      this.setState({refreshing: false})
    })
  }

  listPosts = async () => {
    try {
      const graphqldata = await API.graphql(graphqlOperation(listPosts))
      const listOfAllposts = await graphqldata.data.listPosts.items
      const listOfAllpostsPerUser = await listOfAllposts.filter(
        userPosts => userPosts.postOwnerId === this.state.postOwnerId
        ).length
      this.setState({ 
        posts: listOfAllposts,
        postsUser: listOfAllpostsPerUser,
        postContent: '' 
      })
      // console.log(this.state.postsUser)
    } 
    catch (err) {
      console.log('error: ', err)
    }
  }
  
  createPost = async () => {
    const post = this.state
    if (post.postContent === '') {
      Alert.alert('Write something!') 
      return
    }   
    try {
      await API.graphql(graphqlOperation(createPost, post))
      await this.componentDidMount()
      // console.log('Post successfully created.')
      Keyboard.dismiss()
      this.hideModal()
    } catch (err) {
      console.log('Error creating post.', err)
    }
  }

  deletePostAlert = async (post) => {
    await Alert.alert(
      'Delete Post',
      'Are you sure you wanna delete this post?',
      [
        {text: 'Cancel', onPress: () => {return}, style: 'cancel'},
        {text: 'OK', onPress: () => this.deletePost(post)},
      ],
      { cancelable: false }
    )
  }

  deletePost = async (post) => {
    const postId = await post['id'] 
    try {
      await API.graphql(graphqlOperation(deletePost, { id: postId }))
      await this.componentDidMount()
      // console.log('Post successfully deleted.')
    } catch (err) {
      console.log('Error deleting post.', err)
    }
  }

  showModal = () => {
    this.setState({ modalVisible: true })
  }

  hideModal = () => {
    this.setState({ modalVisible: false })
  }

  onChangeText = (key, val) => {
    this.setState({ [key]: val })
  }

  toggleLikePost = async (post) => {
    const loggedInUser = await this.state.postOwnerId
    // Get the like instance of the logged in user
    const likeUserObject = await post.likes.items.filter(
      obj => obj.likeOwnerId === loggedInUser
    )
    // If there is a like instance fire a delete action
    if (likeUserObject.length !== 0) {
      await this.deleteLike(likeUserObject)
      return
    }
    // Otherwise create a like instance
    await this.createLike(post)
  }

  createLike = async (post) => {
    const postId = await post['id']
    this.setState({numberLikes: 1})
    const like = {
      likeOwnerId: this.state.likeOwnerId,
      numberLikes: this.state.numberLikes,
      likeOwnerUsername: this.state.likeOwnerUsername,
      id: postId,
    }
    try {
      await API.graphql(graphqlOperation(createLike, like))
      await this.componentDidMount()
    } catch (err) {
      console.log('Error creating like.', err)
    }
  }
  
  deleteLike = async (likeUserObject) => {
    const likeId = await likeUserObject[0]['id']
    try {
      await API.graphql(graphqlOperation(deleteLike, { id: likeId }))
      await this.componentDidMount()
    } catch (err) {
      console.log('Error deleting like.', err)
    }
  }

  // Cascading delete for the posts and their associated likes 
  deleteLikesOfPost = async (likeId) => {
    try {
      await API.graphql(graphqlOperation(deleteLike, { id: likeId }))
    } catch (err) {
      console.log('Error deleting like.', err)
    }
  }


  render() {		
    let loggedInUser = this.state.postOwnerId // Get the user ID
    return (
      <View style={{flex: 1}}>
        <View style={styles.headerStyle}>
          <Modal
            animationType="slide"  
            transparent={false}
            onRequestClose={() => {return}}
            visible={this.state.modalVisible}>
            <View style={styles.modalContainer}>
              <View style={styles.postCardStyle}>
                <Card>
                  <TextInput
                    onChangeText={val => this.onChangeText('postContent', val)}
                    placeholder="Tell us the best..."
                    value={this.state.postContent}
                    multiline={true}
                    maxLength={150}
                    autoFocus={true} // check for performance issue when true
                    style={{ height: 150, fontSize: 20, padding: 13 }}
                  />
                  <View style={{alignItems: 'flex-end', padding: 5}}>
                    <Text style={{color: '#fb7777', fontWeight: 'bold'}}>
                      {150 - this.state.postContent.length}
                    </Text>
                  </View>
                </Card>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={this.hideModal}
                    style={[styles.twinButtonStyle, {backgroundColor: '#5017AE'}]}>
                    <Text style={styles.buttonText}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={this.createPost}
                    style={[styles.twinButtonStyle, {backgroundColor: '#f16f69'}]}>
                    <Text style={styles.buttonText}>
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>        
          </Modal>
          {/* Open modal to write a post */}          
          <TouchableOpacity onPress={this.showModal}>
            <Icon 
              active 
              name='add-circle'
              style={styles.iconStyle}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.componentDidMount}>
            <Icon 
              active 
              name='refresh'
              style={styles.iconStyle}
            />
          </TouchableOpacity>
        </View>        
        <ScrollView 
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
        >
          <View style={{flex: 1, alignItems: 'center'}}>          
            {
              this.state.posts.map((post, index) => (
                <Card key={index} style={styles.cardStyle}>
                  {/* Show delete Icon if logged in user is the post owner */}
                  <View style={styles.cardHeaderStyle}>
                    { post.postOwnerId === loggedInUser &&
                      <View style={{flex:1, justifyContent: 'center', alignItems: 'flex-start'}}>
                        <TouchableOpacity
                          onPress={() => this.deletePostAlert(post)}>
                          <Icon name='md-more' style={{color: '#1f267e'}}/>
                        </TouchableOpacity>
                      </View> 
                    }
                  </View>                      
                  <TouchableOpacity>
                    <Text style={styles.postBody}>
                      {post.postContent}
                    </Text>                                    
                  </TouchableOpacity>                   
                  <View style={styles.cardFooterStyle}>
                    <View style={{flex:1, justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                      <Text style={styles.postUsername}>
                        {post.postOwnerUsername}
                      </Text> 
                    </View>
                    {/* Logged in user liked this post */}
                    {
                      post.likes.items.length !== 0 &&
                      post.likes.items.filter(obj => obj.likeOwnerId === loggedInUser).length === 1 &&
                      <View style={{flex:1, justifyContent: 'center', alignItems: 'flex-end'}}>
                        <TouchableOpacity
                          onPress={() => this.toggleLikePost(post)}>
                          <Icon
                            name='md-heart'
                            style={{ fontSize: 45, color: '#fb7777' }}
                          />
                        </TouchableOpacity>
                      </View>       
                    }
                    {/* Logged in user did not like this post */}
                    {
                      post.likes.items.length !== 0 && 
                      post.likes.items.filter(obj => obj.likeOwnerId === loggedInUser).length === 0 &&
                      <View style={{flex:1, justifyContent: 'center', alignItems: 'flex-end'}}>
                        <TouchableOpacity
                          onPress={() => this.toggleLikePost(post)}>
                          <Icon
                            name='md-heart'
                            style={{ fontSize: 45, color: '#69ff' }}
                          />
                        </TouchableOpacity>
                      </View>              
                    }
                    {/* Post has no likes */}
                    {
                      post.likes.items.length === 0 && 
                      <View style={{flex:1, justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                        <TouchableOpacity
                          onPress={() => this.toggleLikePost(post)}>
                          <Icon
                            name='md-heart'
                            style={{ fontSize: 45, color: '#69ff' }}
                          />
                        </TouchableOpacity>
                      </View>                  
                    }                                      
                  </View>
                </Card>
              ))
            }
          </View>     
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStyle: {
    padding: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postUsername: { 
    fontSize: 14, 
    fontWeight: 'bold',
    color: '#1f267e'
  },
  postBody: { 
    fontSize: 20, 
    color: '#1f267e',
    padding: 12
  },
  iconStyle : {
    color: '#5017ae',
    fontSize: 38
  },
  cardStyle: {
    flex: 1,
    backgroundColor: '#d0d9ed',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooterStyle: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderStyle : {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  twinButtonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 10,
    width: 130,
    height: 48,
    flexDirection: 'row'
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#fff",
  },
  postCardStyle: {
    marginTop: 45, 
    padding: 20
  },
  modalContainer: {
    flex:1, 
    backgroundColor:'#eadee4'
  }
})


