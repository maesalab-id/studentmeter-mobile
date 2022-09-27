import React from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import { Card, Input, Button, Text } from 'react-native-elements';

const style = StyleSheet.create({
    smText: { fontSize: 20, backgroundColor: 'rgba(0,0,0,.04)', borderRadius: 10, padding: 10 },
    link: { color: '#3498db', textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 20 },
    center: { textAlign: 'center' }
});

class Login extends React.Component {
    state = {
        loading: false,
        data: {
            username: '',
            password: '',
        }
    }
    onChange(f, v) {
        const { data } = this.state;
        data[f] = v;
        this.setState({ data });
    }
    onSubmit() {
        const { data, type } = this.state;
        const { client, navigation, setUser } = this.props;
        if (data.password && data.username) {
            this.setState({ loading: true }, async () => {
                try {
                    const auth = await client.authenticate({ ...data, strategy: 'local' });
                    const user = auth.user;
                    this.setState({
                        loading: false, data: {
                            username: '',
                            name: '',
                            password: '',
                        }
                    }, () => {
                        setUser(user);
                    });
                } catch (e) {
                    console.log(e);
                    alert(e);
                    this.setState({ loading: false });
                }
            });
        } else {
            alert('Isi semua field!');
        };
    }
    render() {
        const { data } = this.state;
        const { navigation } = this.props;
        return (
            <View>
                <ScrollView>
                    <Image source={require('../images/logo.png')} style={{ width: Dimensions.get('screen').width / 2.5, resizeMode: 'contain', alignSelf: 'center', height: 200, marginTop: 10 }} />
                    <Text style={{ textAlign: 'center', fontSize: 30, fontWeight: 'bold', color: 'rgba(111, 202, 186, 1)' }}>StudentMeter</Text>
                    <View style={{ padding: 40 }}>
                        <Input value={data.username} onChangeText={(t) => this.onChange('username', t)} inputStyle={style.smText} placeholder="Username" />
                        <Input value={data.password} onChangeText={(t) => this.onChange('password', t)} secureTextEntry={true} inputStyle={style.smText} placeholder="Password" />
                        <Button onPress={this.onSubmit.bind(this)} title="Login" type="solid" buttonStyle={{
                            backgroundColor: 'rgba(111, 202, 186, 1)',
                            borderRadius: 5
                        }} />
                    </View>
                </ScrollView>
            </View>
        )
    }
}

export default Login;