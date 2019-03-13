import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import Amplify from '@aws-amplify/core'
import API, { graphqlOperation } from '@aws-amplify/api'
import { withAuthenticator } from 'aws-amplify-react-native'

import config from './src/aws-exports'
import Posts from './src/components/Posts'
import { listPosts } from './src/GraphQL/GraphQL'

// configure the app with Amplify
Amplify.configure(config)

class App extends React.Component {
  state = {
    posts: '',
    refreshing: false,
  }

  componentDidMount = async () => {
    this.timerID = await setInterval(() => { 
      this.countPosts()
      }, 
    1000)
  }

  componentWillUnmount = async () => {
    await clearInterval(this.timerID)
  }

  // Get number of posts from the Upload Component
  countPosts = async () => {
    try {
      const graphqldata = await API.graphql(graphqlOperation(listPosts))
      this.setState({ 
        posts: graphqldata.data.listPosts.items, postContent: '' 
      })
      // console.log(this.state.posts.length)
    } 
    catch (err) {
      console.log('error: ', err)
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>  
          {/* Number of entries */}
          <View style={{ flex: 1, alignItems: 'center', marginRight: 20 }}>
            <Text style={styles.textStyle}>
              ENTRIES
            </Text>
            <Text style={styles.textTimerStyle}>
              {this.state.posts.length}
            </Text>
          </View>
        </View>
        <Posts countPosts={this.countPosts} />
      </View>
    )
  }
}

export default withAuthenticator(
  App, {
  // Render a sign out button once logged in
  includeGreetings: true}
)

const styles = StyleSheet.create({
  container: {
    flex: 0.10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#a8abaf',
  },
  textStyle: {
    fontSize: 18,
    color: '#3d4147',
  },
  textTimerStyle: {
    fontSize: 18,
    color: '#5017ae',
    fontWeight: 'bold'
  },
  lockIconStyle: {
    color: '#5017ae', 
    fontSize: 45,
  }
})


