import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// Amplify auth imports and config 
import Amplify from '@aws-amplify/core'
import { withAuthenticator } from 'aws-amplify-react-native'
import config from './aws-exports';

// Amplify api imports
import {
  createPost, 
  getPost, 
  listPosts, 
  deletePost, 
  createLike, 
  deleteLike
} from './GraphQL'

Amplify.configure(config)

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
      </View>
    );
  }
}

export default withAuthenticator(App, {includeGreetings: true})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
