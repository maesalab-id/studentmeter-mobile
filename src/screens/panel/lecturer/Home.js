import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert } from 'react-native';
import { ListItem, Icon, Input } from 'react-native-elements';
import randomColor from 'randomcolor';
import Loading from '../../Loading';
import Border from '../../../components/Border';

const style = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 25, fontWeight: 'bold', marginBottom: 10 },
    classCard: {
        flex: 1, flexDirection: 'row',
        backgroundColor: '#1abc9c', padding: 15, marginTop: 10, borderRadius: 10,
    },
    classSubtitle: { color: '#fff' },
    classTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});

class Home extends React.Component {
    state = { ready: false, loading: false, newClass: '', schedules: [] };
    componentDidMount() {
        this.fetch();
    }
    async fetch() {
        console.log('fetch');
        const { client } = this.props;
        this.setState({ ready: false });
        const schedules = await client.service('schedules').find();
        console.log(schedules);
        this.setState({ ready: true, schedules: schedules.data });
    }
    render() {
        const { navigation } = this.props;
        const { schedules, ready, loading } = this.state;
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={style.container}>
                    <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 20 }}>
                        <Text style={style.title}>Jadwal Mengajar</Text>
                        <Border margin={-4} />
                    </View>
                    <View>
                        {ready ? (
                            schedules.length ? (
                                schedules.map((s, i) => (
                                    <ListItem Component={TouchableNativeFeedback} onPress={() => navigation.navigate('Meeting', { schedule: s, refreshHome: this.fetch.bind(this) })} key={i} bottomDivider>
                                        <ListItem.Content>
                                            <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>{s.subject.name}</ListItem.Title>
                                            <ListItem.Subtitle style={{ fontSize: 13 }}>{s.class.name} - {s.class.attendances.length} peserta</ListItem.Subtitle>
                                        </ListItem.Content>
                                        <ListItem.Chevron />
                                    </ListItem>
                                ))
                            ) : (
                                <View>
                                    <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 20 }}>Belum ada jadwal</Text>
                                </View>
                            )
                        ) : (
                            <Loading />
                        )}
                    </View>
                </View>
            </ScrollView>
        )
    }
}

export default Home;