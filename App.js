import React from 'react'
import { 
  View, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native'

// Amplify auth imports and config 
import Amplify from '@aws-amplify/core'
import { withAuthenticator } from 'aws-amplify-react-native'
import config from './aws-exports'
import Auth from '@aws-amplify/auth'

// Amplify api imports
import API, { graphqlOperation } from '@aws-amplify/api'
import {
  createPost,
  listPosts,
  deletePost,
} from './GraphQL'

// Imports from native-base
import { Form, Item, Button, Text, Card, Icon } from 'native-base'

// Import style
import styles from './Styles'

Amplify.configure(config)

class App extends React.Component {
  state = {
    postContent: '',
    postOwnerId: '',
    postOwnerUsername: '',
    posts: [],
  }

  componentDidMount = async () => {
    // Get the current authenticated user 
    await Auth.currentAuthenticatedUser()
    .then(user => {
      this.setState(
        {  
          postOwnerUsername: user.username,
          postOwnerId: user.attributes.sub,
        }
      )
    })
    .catch(err => console.log(err))
    // Mount all published posts on app load
    this.listPosts()
    
  }

  // Get user input
  onChangeText = (key, val) => {
    this.setState({ [key]: val })
  }

  // Let the user create a new post 
  createPost = async () => {
    const post = this.state
    if (post.postContent === '') {
      console.log('Write something!') 
      return
    }   
    try {
      await API.graphql(graphqlOperation(createPost, post))
      await this.componentDidMount()
      console.log('Post successfully created.', post)
    } catch (err) {
      console.log('Error creating post.', err)
    }
  }

  // List all posts
  listPosts = async () => {
    try {
      const graphqldata = await API.graphql(
        graphqlOperation(listPosts)
      )
      this.setState(
        { 
          posts: graphqldata.data.listPosts.items, 
          postContent: '' 
        }
      )
    } 
    catch (err) {
      console.log('error: ', err)
    }
  }

  // Alert users when they press the delete button
  deletePostAlert = async (post) => {
    await Alert.alert(
      'Delete Post',
      'Are you sure you wanna delete this post?',
      [
        {text: 'Cancel', onPress: () => console.log('Canceled'), style: 'cancel'},
        {text: 'OK', onPress: () => this.confirmDeletePost(post)},
      ],
      { cancelable: false }
    )
  }

  // Delete a post instance
  confirmDeletePost = async (post) => {
    // Grab the post id
    const postId = await post['id'] 
    try {
      await API.graphql(graphqlOperation(deletePost, { id: postId }))
      await this.componentDidMount()
      console.log('Post successfully deleted.')
    } catch (err) {
      console.log('Error deleting post.', err)
    }
  }

  render() {
    // Grab the ID of the logged in user
    let loggedInUser = this.state.postOwnerId
    return (
      <View style={{flex: 1}}>
        <View style={styles.headerStyle}>
          <Form style={{padding: 13}}>
            <Item>
              <TextInput
                onChangeText={val => this.onChangeText('postContent', val)}
                placeholder="Type here ..."
                value={this.state.postContent}
                style={{fontSize:22, padding: 13}}
              />
            </Item>
          </Form>      
          <View style={{ flexDirection: 'row'}}>
            <Button 
              style={styles.buttonStyle} 
              onPress={this.createPost}>
              <Text>Add Post</Text>
            </Button>
          </View>          
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={{flex: 1, alignItems: 'center'}}>          
            {
              this.state.posts.map((post, index) => (
                <Card key={index} style={styles.cardStyle}>
                  <Text style={styles.postBody}>
                    {post.postContent}
                  </Text>                                    
                  <Text style={styles.postUsername}>
                    {post.postOwnerUsername}
                  </Text>
                  {/* Check if the logged in user is the post owner */}
                  { post.postOwnerId === loggedInUser &&
                    <Icon
                      name='ios-trash' 
                      onPress={() => this.deletePostAlert(post)}
                    />
                  }        
                </Card>
              ))
            }
          </View>     
        </ScrollView>
      </View>       
    );
  }
}

export default withAuthenticator(App, {includeGreetings: true})