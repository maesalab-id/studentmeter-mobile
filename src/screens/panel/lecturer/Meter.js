import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert } from 'react-native';
import { ListItem, Icon, Dialog, Button } from 'react-native-elements';
import moment from 'moment';
import Slider from '@react-native-community/slider';
import Loading from '../../Loading';

const style = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    classCard: {
        flex: 1, flexDirection: 'row',
        backgroundColor: '#1abc9c', padding: 15, marginTop: 10, borderRadius: 10,
    },
    classSubtitle: { color: '#fff' },
    classTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});

class Meter extends React.Component {
    state = { ready: false, loading: false, stats: [], selected: null };
    componentDidMount() {
        this.fetch();
    }
    async fetch() {
        const { client, route } = this.props;
        this.setState({ ready: false });
        const stats = await client.service('stats').find({
            query: {
                meetingId: route.params.meeting.id
            }
        });
        this.setState({ ready: true, stats: stats.data });
    }
    render() {
        const { client, route } = this.props;
        const { stats, ready, selected } = this.state;
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={style.container}>
                    <View style={{ backgroundColor: 'rgba(111, 202, 186, 1)', padding: 15, paddingBottom: 20, paddingTop: 20 }}>
                        <Text style={style.title}>{route.params.schedule.subject.name}</Text>
                        <Text style={{ fontSize: 15, color: '#fff' }}>Pertemuan #{route.params.meeting.number} - {route.params.meeting.date}</Text>
                    </View>
                    <View>
                        {ready ? (
                            stats.length ? (
                                stats.map((s, i) => (
                                    <ListItem Component={TouchableNativeFeedback} onPress={() => this.setState({ selected: s })} key={i} bottomDivider>
                                        <ListItem.Content>
                                            <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>{s.student.name}</ListItem.Title>
                                            <ListItem.Subtitle style={{ fontSize: 13 }}>{Object.keys(s.value).map((a) => `${a}: ${s.value[a] === null ? '-' : s.value[a]}`).join(', ')}</ListItem.Subtitle>
                                        </ListItem.Content>
                                        <ListItem.Chevron />
                                    </ListItem>
                                ))
                            ) : (
                                <View style={{ paddingTop: 100 }}>
                                    <Icon name="inventory" size={100} color="#dbdbdb" />
                                </View>
                            )
                        ) : (
                            <Loading />
                        )}
                    </View>
                </View>
                {selected && (
                    <Dialog overlayStyle={{ width: '90%' }} isVisible={true} onBackdropPress={() => this.setState({ selected: null })}>
                        <Dialog.Title title={selected.student.name} />
                        <View>
                            <MeterSlide schedule={route.params.schedule} stat={selected} client={client} onDone={this.fetch.bind(this)} />
                        </View>
                    </Dialog>
                )}
            </ScrollView>
        )
    }
}

function MeterSlide({ schedule, stat, client, onDone }) {
    const [stats, setStats] = React.useState({ ...stat.value });
    const [loading, setLoading] = React.useState(false);

    const updateStat = async () => {
        setLoading(true);
        await client.service('stats').patch(stat.id, { value: stats });
        setLoading(false);
        onDone();
    }

    return (
        <View>
            {schedule.stats.map((s, i) => {
                return (
                    <View key={i} style={{ marginBottom: 10 }}>
                        <Text>{s}: {`${stats[s]}%`}</Text>
                        <Slider key={i} step={1} minimumValue={0} maximumValue={100} value={stats[s]} onValueChange={(v) => {
                            const newStats = { ...stats };
                            newStats[s] = v;
                            setStats(stats => ({ ...stats, ...newStats }));
                        }} />
                    </View>
                )
            })}
            <Button title="Perbarui" loading={loading} icon={{ name: 'edit', color: '#fff' }} type="solid" buttonStyle={{
                backgroundColor: 'rgba(111, 202, 186, 1)',
                borderRadius: 5
            }} onPress={updateStat} />
        </View>
    );
}

export default Meter;