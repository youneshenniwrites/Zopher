import React from 'react'
import { 
  StyleSheet, 
  View, 
  TextInput,
  ScrollView,
  Dimensions,
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
  listPosts
} from './GraphQL'

// Imports from native-base
import { Form, Item, Button, Text, Card } from 'native-base'

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

  render() {
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
                  <Text style={styles.postUsername}>{
                    post.postOwnerUsername}
                  </Text>         
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

// Get the width of the device
let { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 13,
    borderBottomWidth: 2,
    borderBottomColor: '#3354fd'
  },
  postUsername: { 
    fontSize: 18, 
    color: '#3354fd'
  },
  postBody: { 
    fontSize: 24, 
    color: '#1986f9'
  },
  buttonStyle : {
    marginLeft: 21,
    marginRight: 21,
    padding: 22,
  },
  cardStyle: {
    backgroundColor: '#ffdddddd',
    borderBottomWidth: 5,
    borderBottomColor: '#3354fd', 
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.95,
    marginTop: 10
  },
  cardFooterStyle: {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'flex-end',
  } 
});
