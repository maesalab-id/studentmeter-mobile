import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback } from 'react-native';
import { ListItem, Icon, Dialog, Button, Input } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import Loading from '../../Loading';
import FilterSlider from '../../../components/FilterSlider';

const style = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', color: 'rgba(111, 202, 186, 1)' },
    classCard: {
        flex: 1, flexDirection: 'row',
        backgroundColor: '#1abc9c', padding: 15, marginTop: 10, borderRadius: 10,
    },
    classSubtitle: { color: '#fff' },
    classTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});

class Meter extends React.Component {
    state = { ready: false, loading: false, stats: [], selected: null, q: '', openFilter: false, assess: false };
    componentDidMount() {
        const { route } = this.props;
        const schedule = route.params.schedule;
        const filter = {};
        for (let i = 0; i < schedule.stats.length; i++) {
            const stat = schedule.stats[i];
            filter[stat] = [0, 100];
        }
        this.setState({ filter }, this.fetch.bind(this));
        this.fetch();
    }
    toggleAssess(assess) {
        const { route } = this.props;
        const schedule = route.params.schedule;
        this.setState({ assess: assess }, () => {
            const filter = {};
            if (!assess) {
                for (let i = 0; i < schedule.stats.length; i++) {
                    const stat = schedule.stats[i];
                    filter[stat] = [0, 100];
                }
            } else {
                for (let i = 0; i < schedule.assessments.length; i++) {
                    const stat = schedule.assessments[i].name;
                    filter[stat] = [0, 100];
                }
            }
            this.setState({ filter }, this.fetch.bind(this));
        });
    }
    async fetch() {
        const { client, route } = this.props;
        const { assess, filter } = this.state;
        const schedule = route.params.schedule;

        this.setState({ ready: false });
        const stats = await client.service('stats').find({
            query: {
                meetingId: route.params.meeting.id,
                scheduleId: schedule.id,
                filter: JSON.stringify(filter),
                assess: assess
            }
        });
        this.setState({ ready: true, stats: stats.data });
    }
    render() {
        const { client, route, navigation } = this.props;
        const { stats, ready, selected, q, assess, openFilter, filter } = this.state;
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={style.container}>
                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(111, 202, 186, .1)', padding: 15, paddingBottom: 20, paddingTop: 20 }}>
                        <View style={{ flex: 3 }}>
                            <Text style={style.title}>{route.params.schedule.subject.name}</Text>
                            <Text style={{ fontSize: 15, color: 'rgba(111, 202, 186, 1)' }}>Pertemuan #{route.params.meeting.number} - {route.params.meeting.date}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Button onPress={() => navigation.navigate('Task', { schedule: route.params.schedule, meeting: route.params.meeting })} icon={{ name: 'list', color: '#fff' }} containerStyle={{ borderRadius: 100 }} buttonStyle={{ backgroundColor: 'rgba(111, 202, 186, 1)', borderRadius: 100, width: 50, height: 50 }} />
                        </View>
                    </View>
                    <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10, flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                            <Button icon={{ name: 'filter-alt', color: '#fff' }} type="solid" buttonStyle={{ backgroundColor: 'rgba(111, 202, 186, 1)', borderRadius: 5 }} onPress={() => this.setState({ openFilter: true })} />
                        </View>
                        <View style={{ flex: 6, justifyContent: 'center' }}>
                            <Text style={{ marginLeft: 16, fontSize: 13, fontWeight: 'bold', color: 'rgba(111, 202, 186, 1)' }}>Mode View</Text>
                            <Picker style={{ marginTop: -15 }} selectedValue={assess} onValueChange={(v) => this.toggleAssess(v)}>
                                <Picker.Item label="Parameter Mentah" value={false} />
                                <Picker.Item label="Analitikal" value={true} />
                            </Picker>
                        </View>
                    </View>
                    <View style={{ paddingLeft: 10, paddingRight: 10, marginTop: -15 }}>
                        <Input leftIcon={{ name: 'search' }} containerStyle={{ marginBottom: -20 }} onChangeText={(t) => this.setState({ q: t })} placeholder="Cari..." />
                    </View>
                    <View>
                        {ready ? (
                            stats.length ? (
                                stats.filter((s) => s.student.name.toLowerCase().indexOf(q.toLowerCase()) !== -1).map((s, i) => (
                                    <ListItem Component={TouchableNativeFeedback} onPress={() => this.setState({ selected: s })} key={i} bottomDivider>
                                        <ListItem.Content>
                                            <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>{s.student.name}</ListItem.Title>
                                            <ListItem.Subtitle style={{ fontSize: 13 }}>{Object.keys(s.value).map((a) => `${a}: ${s.value[a] === null ? '-' : s.value[a] + '%'}`).join(', ')}</ListItem.Subtitle>
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
                {openFilter && (
                    <Dialog overlayStyle={{ width: '90%' }} isVisible={true} onBackdropPress={() => this.setState({ openFilter: false })}>
                        <Dialog.Title title="Filter Performa" />
                        <View>
                            <FilterSlider value={filter} onDone={(f) => this.setState({ filter: f, openFilter: false }, this.fetch.bind(this))} />
                        </View>
                    </Dialog>
                )}
            </ScrollView>
        )
    }
}

function MeterSlide({ schedule, stat, client, onDone }) {
    console.log(stat);
    const [stats, setStats] = React.useState({ ...stat.value });
    const [notes, setNotes] = React.useState({ ...stat.notes });
    const [loading, setLoading] = React.useState(false);

    const updateStat = async () => {
        setLoading(true);
        await client.service('stats').patch(stat.id, { value: stats, notes: notes });
        setLoading(false);
        onDone();
    }

    return (
        <View>
            {schedule.stats.map((s, i) => {
                return (
                    <View key={i} style={{ marginBottom: 10 }}>
                        <Text style={{ marginLeft: 15 }}>{s}: {`${stats[s]}%`}</Text>
                        <Slider key={i} step={1} minimumValue={0} maximumValue={100} value={stats[s]} onValueChange={(v) => {
                            const newStats = { ...stats };
                            newStats[s] = v;
                            setStats(stats => ({ ...stats, ...newStats }));
                        }} />
                        <Input placeholder={`Catatan ${s}`} value={notes[s]} onChangeText={(t) => {
                            const newNotes = { ...notes };
                            newNotes[s] = t;
                            setNotes(notes => ({ ...notes, ...newNotes }));
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