import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert } from 'react-native';
import { ListItem, Button, Icon, FAB } from 'react-native-elements';
import moment from 'moment';
import Loading from '../screens/Loading';

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

class Meeting extends React.Component {
  state = { ready: false, loading: false, meetings: [], openAdd: false };
  componentDidMount() {
    this.fetch();
  }
  async fetch() {
    const { client } = this.props;
    this.setState({ ready: false });
    const meetings = await client.service('meetings').find();
    this.setState({ ready: true, meetings: meetings.data });
  }
  add() {
    const { client, route } = this.props;
    Alert.alert('Buat pertemuan?', `Anda yakin akan membuka pertemuan baru di tanggal ${moment().format('D MMMM YYYY')}?`, [{
      text: 'Buat Pertemuan',
      onPress: async () => {
        try {
          const meeting = await client.service('meetings').create({
            scheduleId: route.params.schedule.id
          });
        } catch (e) {
          console.log(e);
        }
        this.fetch();
      }
    }, {
      text: 'Batal'
    }]);
  }
  onLongPress(s) {
    const { client } = this.props;
    Alert.alert('Hapus pertemuan?', `Anda yakin ingin menghapus pertemuan ke-${s.number}?`, [{
      text: 'Hapus',
      onPress: async () => {
        await client.service('meetings').remove(s.id);
        this.fetch();
      }
    }, {
      text: 'Batal'
    }]);
  }
  render() {
    const { navigation, route } = this.props;
    const { meetings, ready, loading, openAdd } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={style.container}>
          <View>
            <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
              <Button title="Buka Pertemuan" icon={{ name: 'add', color: '#fff' }} type="solid" buttonStyle={{
                backgroundColor: 'rgba(111, 202, 186, 1)',
                borderRadius: 5
              }} onPress={this.add.bind(this)} />
            </View>
            {ready ? (
              meetings.length ? (
                meetings.map((s, i) => (
                  <ListItem Component={TouchableNativeFeedback} onLongPress={() => this.onLongPress(s)} onPress={() => navigation.navigate('Meter', { meeting: s, schedule: route.params.schedule, refreshHome: this.fetch.bind(this) })} key={i} bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>Pertemuan #{s.number}</ListItem.Title>
                      <ListItem.Subtitle style={{ fontSize: 13 }}>{s.date}</ListItem.Subtitle>
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
      </ScrollView>
    )
  }
}

export default Meeting;