import { StyleSheet, Dimensions } from 'react-native'

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

export default styles