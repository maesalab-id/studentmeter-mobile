/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import io from 'socket.io-client';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import authentication from '@feathersjs/authentication-client';

import config from './config';

import Login from './src/screens/Login';
import Loading from './src/screens/Loading';
import Error from './src/screens/Error';

import { LHome, LRoom, LMeter, LStats } from './src/screens/panel';

const socket = io(`${config.baseURL}:${config.port}`);
const client = feathers();

client.configure(socketio(socket));
client.configure(authentication({ storage: AsyncStorage }));

const Stack = createStackNavigator();


class App extends React.Component {
  state = { user: null, ready: false, error: false, client: null }

  componentDidMount() {
    this.fetch();
  }

  async fetch() {
    socket.on('connect', async () => {
      let user = null;
      try {
        const auth = await client.reAuthenticate();
        user = auth.user;
      } catch (e) { };
      this.setState({ ready: true, error: false, user, client });
    });

    socket.on('connect_error', async (e) => {
      console.log(e);
      alert(JSON.stringify(e));
      this.setState({ ready: true, error: true });
    });
  }

  setUser(user) {
    this.setState({ user });
  }

  async onLogout() {
    AsyncStorage.removeItem('feathers-jwt');
    this.setUser(null);
  }

  render() {
    const { ready, user, error, client } = this.state;
    return (
      <SafeAreaProvider>
        {ready ? (
          !error ? (
            <NavigationContainer>
              {!user ? (
                <Stack.Navigator>
                  <Stack.Screen options={{ headerShown: false }} name="Login">
                    {props => <Login {...props} user={user} client={client} setUser={this.setUser.bind(this)} />}
                  </Stack.Screen>
                </Stack.Navigator>
              ) : ((function (self) {
                if (user.type === 'lecturer') {
                  return (
                    <Stack.Navigator screenOptions={{ title: `Halo, ${user.name}!` }}>
                      <Stack.Screen options={{
                        headerRight: () => <Icon onPress={self.onLogout.bind(self)} name="logout" />,
                        headerRightContainerStyle: { paddingRight: 12 }
                      }} name="Home">
                        {props => <LHome {...props} user={user} client={client} />}
                      </Stack.Screen>
                      <Stack.Screen options={{ title: 'Kelas' }} name="Room">
                        {props => <LRoom {...props} user={user} client={client} />}
                      </Stack.Screen>
                      <Stack.Screen options={{ title: 'Meter' }} name="Meter">
                        {props => <LMeter {...props} user={user} client={client} />}
                      </Stack.Screen>
                      <Stack.Screen options={{ title: 'Stats' }} name="Stats">
                        {props => <LStats {...props} user={user} client={client} />}
                      </Stack.Screen>
                    </Stack.Navigator>
                  )
                } else if (user.type === 'study-program') {
                  return (null);
                }
              })(this)
              )}
            </NavigationContainer>
          ) : (<Error retry={this.fetch.bind(this)} />)
        ) : (<Loading />)
        }
      </SafeAreaProvider>
    )
  }
}

export default App;
