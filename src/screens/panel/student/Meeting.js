import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert } from 'react-native';
import { Icon, Button, Dialog, Input, ListItem } from 'react-native-elements';
import moment from 'moment';
import Loading from '../../Loading';

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
  state = { ready: false, meetings: [], openAdd: false, loadingAdd: false, newTask: '' };

  componentDidMount() {
    const { navigation, route } = this.props;
    navigation.setOptions({ title: route.params.schedule.subject.name });
    this.fetch();
  }

  async fetch() {
    const { client, route } = this.props;
    this.setState({ ready: false });
    const meetings = await client.service('meetings').find({
      query: {
        scheduleId: route.params.schedule.id
      }
    });
    this.setState({ ready: true, meetings: meetings.data });
  }

  getTaskCount(s) {
    const totalTask = s.tasks.length;
    let completedTask = s.tasks.filter((t) => t.submissions.length > 0).length;
    return (
      <Text style={{
        color: totalTask > 0 ? (completedTask < totalTask ? '#e67e22' : '#2ecc71') : undefined,
        fontWeight: 'bold'
      }}>{`${completedTask}/${totalTask} tugas`}</Text>
    );
  }

  render() {
    const { navigation, route } = this.props;
    const { ready, meetings, openAdd, loadingAdd } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={style.container}>
          <View>
            {ready ? (
              meetings.length ? (
                meetings.map((s, i) => (
                  <ListItem Component={TouchableNativeFeedback} onPress={() => navigation.navigate('Task', { schedule: route.params.schedule, meeting: s, refresh: this.fetch.bind(this) })} key={i} bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>Pertemuan #{s.number}</ListItem.Title>
                      <ListItem.Subtitle style={{ fontSize: 13 }}>{moment(s.date).format('YYYY-MM-DD')} - {this.getTaskCount(s)}</ListItem.Subtitle>
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
        {openAdd && (
          <Dialog overlayStyle={{ width: '90%' }} isVisible={true} onBackdropPress={() => this.setState({ openAdd: false })}>
            <Dialog.Title title="Tugas Baru" />
            <View>
              <Input placeholder="Tulis deskripsi tugas..." onChangeText={(text) => this.setState({ newTask: text })} multiline />
              <Button title="Simpan" icon={{ name: 'add', color: '#fff' }} type="solid" buttonStyle={{
                backgroundColor: 'rgba(111, 202, 186, 1)',
                borderRadius: 5
              }} onPress={this.add.bind(this)} loading={loadingAdd} />
            </View>
          </Dialog>
        )}
      </ScrollView>
    )
  }
}

export default Meeting;