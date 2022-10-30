import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert } from 'react-native';
import { ListItem, Icon, Input, Avatar } from 'react-native-elements';
import moment from 'moment';
import Loading from '../../Loading';
import Border from '../../../components/Border';

const style = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    classCard: {
        flex: 1, flexDirection: 'row',
        backgroundColor: '#1abc9c', padding: 15, marginTop: 10, borderRadius: 10,
    },
    classSubtitle: { color: '#fff' },
    classTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});

class Home extends React.Component {
    state = { ready: false, loading: false, newClass: '', schedules: [], time: new Date() };
    componentDidMount() {
        this.fetch();
        setInterval(() => this.setState({ time: new Date() }), 1000);
    }
    async fetch() {
        const { client } = this.props;
        this.setState({ ready: false });
        const schedules = await client.service('schedules').find();
        this.setState({ ready: true, schedules: schedules.data });
    }
    getTotals(schedule) {
        const totalMeetings = schedule.meetings.length;
        let totalTasks = 0;
        for (let i = 0; i < totalMeetings; i++) {
            totalTasks += schedule.meetings[i].tasks.length;
        }
        let totalCompleted = 0;
        for (let i = 0; i < totalMeetings; i++) {
            for (let j = 0; j < schedule.meetings[i].tasks.length; j++) {
                totalCompleted += schedule.meetings[i].tasks[j].submissions.length;
            }
        }
        return <Text style={{ fontWeight: 'bold' }}>{`${schedule.class.attendances.length} peserta, ${totalMeetings} pertemuan, ${totalTasks} tugas`}</Text>
    }
    render() {
        const { navigation, user, logout } = this.props;
        const { schedules, ready } = this.state;
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={style.container}>
                    <View style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: 'center' }}>Selamat pagi, {user.name.split(' ')[0]}!</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', margin: 20, marginTop: 35 }}>
                        <View style={{ flex: 2 }}>
                            <Avatar
                                rounded
                                size="large"
                                source={require('../../../images/user.png')}
                            />
                        </View>
                        <View style={{ flex: 5, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 23 }}>{user.name}</Text>
                            <Text style={{ fontSize: 14 }}>{user.major.name}</Text>
                            <Text style={{ fontSize: 13 }}>{user.study_program.name}</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Icon name="logout" size={20} onPress={() => {
                                Alert.alert('Keluar akun?', 'Anda yakin ingin melakukan logout?', [
                                    { text: 'Keluar', onPress: logout },
                                    { text: 'Batal' }
                                ]);
                            }} />
                        </View>
                    </View>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        backgroundColor: 'rgba(111, 202, 186, .1)',
                        // padding: 10, paddingBottom: 20, paddingTop: 20,
                        padding: 10,
                        marginTop: 0,
                        margin: 20,
                        borderRadius: 5
                    }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'rgba(111, 202, 186, 1)', textAlign: 'center' }}>{moment(this.state.time).format('hh:mm:ss A')}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={{ marginLeft: 16, fontSize: 17, fontWeight: 'bold' }}>Kelas Mengajar</Text>
                        {ready ? (
                            schedules.length ? (
                                schedules.map((s, i) => (
                                    <ListItem Component={TouchableNativeFeedback} onPress={() => navigation.navigate('Room', { schedule: s, refreshHome: this.fetch.bind(this) })} key={i} bottomDivider>
                                        <ListItem.Content>
                                            <ListItem.Title style={{ fontSize: 15 }}>{s.subject.name}</ListItem.Title>
                                            <ListItem.Subtitle style={{ fontSize: 13 }}>{s.class.name} - {this.getTotals(s)}</ListItem.Subtitle>
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