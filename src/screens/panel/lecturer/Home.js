import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert, Image } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import moment from 'moment';
import Loading from '../../Loading';

const style = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    classCard: {
        flex: 1, flexDirection: 'row',
        backgroundColor: '#1abc9c', padding: 15, marginTop: 10, borderRadius: 10,
    },
    classSubtitle: { color: '#fff' },
    classTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});

function generateGreetings(time) {
    var currentHour = time.format("HH");
    if (currentHour >= 3 && currentHour < 12) {
        return "pagi";
    } else if (currentHour >= 12 && currentHour < 15) {
        return "siang";
    } else if (currentHour >= 15 && currentHour < 18) {
        return "sore";
    } else if (currentHour >= 18 || currentHour < 3) {
        return "malam";
    } else {
        return "datang";
    }
}

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
        const { schedules, ready, time } = this.state;
        const greet = generateGreetings(moment(time));
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={style.container}>
                    <View style={{ marginTop: 15, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{fontSize: 12}}>Selamat {greet}, {user.name.split(' ')[0]}! </Text>
                        <Icon name={
                            greet === 'pagi' || greet === 'siang' ? 'sunny' : (
                                greet === 'sore' ? 'partly-sunny' : 'moon'
                            )
                        } type="ionicon" color={
                            greet === 'pagi' || greet === 'siang' ? '#f1c40f' : (
                                greet === 'sore' ? '#bdc3c7' : '#34495e'
                            )
                        } containerStyle={{ marginLeft: 5 }} size={17} />
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', padding: 20 }}>
                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'flex-start' }}>
                            <Image
                                style={{ width: '100%', height: 100, resizeMode: 'contain', borderRadius: 100 }}
                                source={require('../../../images/user.png')}
                            />
                        </View>
                        <View style={{ flex: 6, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 20 }}>
                            <Text style={{ fontSize: 23, color: 'rgba(111, 202, 186, 1)', fontWeight: 'bold' }}>{user.name}</Text>
                            <Text style={{ fontSize: 14 }}>{user.major.name}</Text>
                            <Text style={{ fontSize: 12 }}>{user.study_program.name}</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Icon name="logout" size={20} color="#e74c3c" onPress={() => {
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
                        padding: 10,
                        marginBottom: 20,
                        // margin: 20,
                        // marginLeft: 70,
                        // marginRight: 70,
                        borderRadius: 5
                    }}>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            {/* <Icon name="time" type="ionicon" size={30} color="rgba(111, 202, 186, 1)" /> */}
                            <Text style={{ fontSize: 30, color: 'rgba(111, 202, 186, 1)', fontWeight: 'bold' }}> {moment(this.state.time).format('hh:mm:ss A')}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={{ marginLeft: 16, fontSize: 17, fontWeight: 'bold', color: 'rgba(111, 202, 186, 1)' }}>Kelas Mengajar</Text>
                        {ready ? (
                            schedules.length ? (
                                schedules.map((s, i) => (
                                    <ListItem Component={TouchableNativeFeedback} onPress={() => navigation.navigate('Room', { schedule: s, refreshHome: this.fetch.bind(this) })} key={i} bottomDivider>
                                        <ListItem.Content>
                                            <ListItem.Title style={{ fontSize: 15, fontWeight: 'bold' }}>{s.subject.name}</ListItem.Title>
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