import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert } from 'react-native';
import { Tab, TabView } from 'react-native-elements';
import Meeting from '../../../components/Meeting';
import Students from '../../../components/Students';

const style = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    classCard: {
        flex: 1, flexDirection: 'row',
        backgroundColor: '#1abc9c', padding: 15, marginTop: 10, borderRadius: 10,
    },
    classSubtitle: { color: '#fff' },
    classTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});

class Room extends React.Component {
    state = { index: 0 };

    componentDidMount() {
        const { navigation, route } = this.props;
        navigation.setOptions({ title: route.params.schedule.subject.name });
    }

    render() {
        const { navigation, route } = this.props;
        const { index } = this.state;
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
                <Tab value={index} onChange={(index) => this.setState({ index })} style={{ backgroundColor: 'rgba(111, 202, 186, 1)' }} indicatorStyle={{ backgroundColor: 'rgba(111, 202, 186, 1)' }}>
                    <Tab.Item titleStyle={{ color: 'rgba(111, 202, 186, 1)' }} containerStyle={{ backgroundColor: 'rgba(111, 202, 186, .1)' }} title="PERTEMUAN" />
                    <Tab.Item titleStyle={{ color: 'rgba(111, 202, 186, 1)' }} containerStyle={{ backgroundColor: 'rgba(111, 202, 186, .1)' }} title="MAHASISWA" />
                </Tab>
                <TabView value={index} onChange={(index) => this.setState({ index })}>
                    <TabView.Item style={{ width: '100%' }}>
                        <Meeting {...this.props} />
                    </TabView.Item>
                    <TabView.Item style={{ width: '100%' }}>
                        <Students {...this.props} />
                    </TabView.Item>
                </TabView>
            </ScrollView>
        )
    }
}

export default Room;