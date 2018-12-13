import React from 'react'
import { 
  StyleSheet, 
  View, 
  TextInput, 
} from 'react-native'

// Amplify auth imports and config 
import Amplify from '@aws-amplify/core'
import { withAuthenticator } from 'aws-amplify-react-native'
import config from './aws-exports';
import Auth from '@aws-amplify/auth';

// Amplify api imports
import API, { graphqlOperation } from '@aws-amplify/api'
import {
  createPost, 
} from './GraphQL'

// Imports from native-base
import { Form, Item, Button, Text } from 'native-base'

Amplify.configure(config)

class App extends React.Component {
  state = {
    postContent: '',
    postOwnerId: '',
    postOwnerUsername: '',
  }

  // Get the current authenticated user 
  componentDidMount = async () => {
    await Auth.currentAuthenticatedUser()
    .then(user => {
      this.setState(
        {  
          postOwnerUsername: user.username,
          postOwnerId: user.attributes.sub,
        }
      )
    })
    .catch(err => console.log(err));
  }

  // Get user input
  onChangeText = (key, val) => {
    this.setState({ [key]: val })
  }

  //Let the user create a new post 
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

  render() {
    return (
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
    );
  }
}

export default withAuthenticator(App, {includeGreetings: true})

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
  }
});
