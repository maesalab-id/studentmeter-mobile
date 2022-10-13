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
    state = { ready: false, loading: false, newClass: '', enrollments: [] };
    componentDidMount() {
        this.fetch();
    }
    async fetch() {
        console.log('fetch');
        const { client } = this.props;
        this.setState({ ready: false });
        const enrollments = await client.service('enrollments').find();
        this.setState({ ready: true, enrollments: enrollments });
    }
    getTotals(schedule) {
        const totalMeetings = schedule.meetings.length;
        let totalTasks = 0;
        for (let i = 0; i < totalMeetings; i++) {
            totalTasks += schedule.meetings[i].tasks.length;
        };
        let totalCompleted = 0;
        for (let i = 0; i < totalMeetings; i++) {
            for (let j = 0; j < schedule.meetings[i].tasks.length; j++) {
                totalCompleted += schedule.meetings[i].tasks[j].submissions.length;
            }
        }
        return <Text style={{ fontWeight: 'bold' }}>{`${totalMeetings} pertemuan, ${totalCompleted}/${totalTasks} tugas`}</Text>
    }
    render() {
        const { navigation } = this.props;
        const { enrollments, ready, loading } = this.state;
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={style.container}>
                    <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 20 }}>
                        <Text style={style.title}>Jadwal Kelas</Text>
                        <Border margin={-4} />
                    </View>
                    <View>
                        {ready ? (
                            enrollments.length ? (
                                enrollments.map((e, i) => (
                                    <View key={i}>
                                        {e.class.schedules.map((s, j) => (
                                            <ListItem Component={TouchableNativeFeedback} key={j} onPress={() => navigation.navigate('Meeting', { schedule: s })} bottomDivider>
                                                <ListItem.Content>
                                                    <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>{s.subject.name}</ListItem.Title>
                                                    <ListItem.Subtitle style={{ fontSize: 13 }}>{e.class.name} - {this.getTotals(s)}</ListItem.Subtitle>
                                                </ListItem.Content>
                                                <ListItem.Chevron />
                                            </ListItem>
                                        ))}
                                    </View>
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