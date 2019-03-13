# React Native twitter with AWS Amplify 

![zopher](https://user-images.githubusercontent.com/26605247/54273843-9afd5400-457e-11e9-979e-e2bc714c0a01.png)

This project integrates a React Native front-end with an AWS Amplify back-end that has user authentication (AWS Cognito) and a GraphQL API (AWS AppSync) for CRUD operations between the client and the database (Amazon DynamoDB).

## App Overview

* Users can sign up/in to the app.

* Users can create posts by pressing the add button, writing inside the Modal, and pressing submit.

* Users can like/unlike posts.

* Users can delete their own posts.

* Users can update the posts feed by:
  * Pressing the reload button. 
  * Performing a pull-to-refresh.

## Prerequisites

* [Expo CLI](https://docs.expo.io/versions/latest/workflow/expo-cli/)
  * `npm install -g expo-cli`
  
* [AWS account](https://aws.amazon.com/amplify/)

* [Node JS](https://nodejs.org/en/download/) with [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

* [AWS Amplify CLI](https://aws-amplify.github.io/)
  * `npm install -g @aws-amplify/cli`
  * `amplify configure` ([link](https://www.youtube.com/watch?v=fWbM5DLh25U) for a step by step video).

## Configuring the project

1. Clone this repo to your local machine.

```
git clone https://github.com/jtaylor1989/Zopher.git

cd Zopher
```

2. Add AWS Amplify dependencies to your project.

```
yarn add aws-amplify aws-amplify-react-native

# or

npm install aws-amplify aws-amplify-react-native
```

3. Initialise the AWS Amplify project.

```
amplify init
```

Follow the same instructions as below.

<img width="725" alt="init" src="https://user-images.githubusercontent.com/26605247/54283592-42d24c00-4596-11e9-81bc-2348ad864b8e.png">

4. Configure an Amazon Cognito User Pool to store users credentials.

```
amplify add auth

# When prompt, choose: Yes, use the default configuration.
```

5. Add the API service to use GraphQL and store data in Amazon DynammoDB. 

```
amplify add api
```

Follow the below configuration.

<img width="718" alt="api" src="https://user-images.githubusercontent.com/26605247/54285392-c6da0300-4599-11e9-9eae-a445cd97cb43.png">

6. Time to deploy your project to AWS.

```
amplify push
```

<img width="718" alt="push" src="https://user-images.githubusercontent.com/26605247/54285245-811d3a80-4599-11e9-83b0-093e40087b9a.png">

After few minutes of automated operations, the Amplify CLI will create an Amazon Cognito User Pool and Identity Pool to store users crendentials and an AWS AppSync GraphQL API to allow for CRUD operations between client and servers.

## Running the application

1. Install client dependencies.

```
yarn

# or

npm install
```

2. Launch the React Native app in your simulator under your project directory.

```
expo start --ios

# or

expo start --android
```

## Step by step tutorial

* Check out the full set up process in the [Medium story](https://bit.ly/2QoI3JO)
* Video link for the demo in [here.](https://www.youtube.com/watch?time_continue=27&v=7bxXHWXV7O8)
