/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, {useState, useEffect} from 'react';
import {Text, Button, View, TextInput, StyleSheet, ImageBackground} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as AppleAuthentication from 'expo-apple-authentication';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
import Sound from 'react-native-sound';
import {sound1} from './soundOne.js';
import {sound2} from './soundTwo';
import { MusicContext } from './Context';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { appleAuth } from '@invertase/react-native-apple-authentication';





const LoginModal = ({ navigation }) => {

  const [prompt, setPrompt] = useState('Please Sign In or Create an Account');
  const [username, onChangeUsername] = useState('');
  const [password, onChangePassword] = useState('');
  const [user, setUser] = useState(null);
  const [signedIn, setSignedIn] = useState(false);

  const onSignIn = () => {
    axios.post('http://solxrapp.com/users/login',
      {username, password})
      .then(({data}) => {
        if (data === 'invalid password') {
          setPrompt(data);
        } else {
          if (data.music === null) {
            data.music = true;
          }
          if (data.theme === null) {
            data.theme = true;
          }
          setSignedIn(true);
          setUser(data);
          storeUser(data);
          onChangeUsername('');
          onChangePassword('');
        }
      })
      .catch(() => {
        setPrompt('Invalid username');
      });
  };

  const onAppleButtonPress = async () => {

    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    console.log(appleAuthRequestResponse.user);

    if (username.length < 3 || password.length < 8) {
      return setPrompt('Invalid username or password');
    }

    axios.post('http://solxrapp.com/users/login',
      { username, password, appleID: appleAuthRequestResponse.user })
      .then(({data}) => {
        if (data === 'invalid password') {
          setPrompt(data);
        } else {
          if (data.music === null) {
            data.music = true;
          }
          if (data.theme === null) {
            data.theme = true;
          }
          setSignedIn(true);
          setUser(data);
          storeUser(data);
          onChangeUsername('');
          onChangePassword('');
        }
      })
      .catch(() => {
        setPrompt('Invalid username');
      });
  };

  const onSignUp = () => {
    if (username.length < 3 || password.length < 8) {
      return setPrompt('Invalid username or password');
    }
    axios.post('http://solxrapp.com/users/create',
      {username, password})
      .then(onSignIn)
      .catch(err => console.warn(err));
  };

  const getUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setSignedIn(true);
        const user = JSON.parse(storedUser);
        setUser(user);
      }
    } catch (e) {
      console.log('there was an error', e);
    }
  };

  const storeUser = async (user) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      console.log('there was an error', e);
    }
  };
    
  const playMusic = async () => {
    const storedUser = await AsyncStorage.getItem('user');
    const { music, theme} = JSON.parse(storedUser);
    if (music === true && theme === false) {
      sound1.play(() => {
        sound1.release();
      });
      sound1.setNumberOfLoops(-1);
      sound1.setVolume(0.5);
    } else if (music === true && theme === true) {
      sound2.play(() => {
        sound2.release();
      });
      sound2.setNumberOfLoops(-1);
      sound2.setVolume(0.5);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    setSignedIn(false);
    setUser(null);
    getUser();
  }, [isFocused]);

  return (
    <MusicContext.Consumer>{ ({ music }) => (
      <ImageBackground
        style={styles.image}
        source={require('./assets/starfield.png')}>
        {signedIn
          ? 
          <View style={styles.container}>
            <Text style={styles.text}>Hello {user && user.username}</Text>
            <Text></Text>
            <Text style={styles.text}>Welcome to solxr</Text>
            <Text></Text>
            <Button onPress={() => { navigation.navigate('index'); playMusic(music); }} title="Enter" />
            <Text></Text>
          </View>
          : 
          <View style={styles.container}>
            <Text style={styles.text}>{prompt}</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeUsername}
              value={username}
              defaultValue="username"
            />
            <TextInput
              style={styles.input}
              onChangeText={onChangePassword}
              value={password}
              secureTextEntry={true}
              defaultValue="password"
            />
            <Button
              onPress={onSignIn}
              title="Sign In"
            />
            <Text></Text>
            <Button
              onPress={onSignUp}
              title="Sign Up"
            />
            <Text></Text>
            <AppleButton
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={AppleButton.Type.SIGN_IN}
              style={{
                width: 160,
                height: 45
              }}
              onPress={() => onAppleButtonPress()}
            />
          </View>
        }
        <View style={{flex: 1}}/>
      </ImageBackground>
    )
    }</MusicContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    textAlign: 'center',
    paddingTop: '10%',
    paddingBottom: '2%',
    color: '#9ee7ff',
    fontSize: 26,
    fontWeight: 'bold',
    width: '100%'
  },
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    backgroundColor: 'white',
    padding: 5
  },
  text: {
    fontSize: 30,
    color: '#9ee7ff',
    textAlign: 'center',
  },
  image: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  }
});

export default LoginModal;
