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

class Task extends React.Component {
  state = { ready: false, tasks: [], openAdd: false, loadingAdd: false, newTask: '' };

  componentDidMount() {
    const { navigation, route } = this.props;
    navigation.setOptions({ title: `Tugas ${route.params.schedule.subject.name}` });
    this.fetch();
  }

  async fetch() {
    const { client, route } = this.props;
    this.setState({ ready: false });
    const tasks = await client.service('tasks').find({
      query: {
        meetingId: route.params.meeting.id
      }
    });
    this.setState({ ready: true, tasks: tasks.data });
  }

  async add() {
    const { client, route } = this.props;
    const { newTask } = this.state;
    this.setState({ loadingAdd: true });
    const task = await client.service('tasks').create({
      description: newTask, meetingId: route.params.meeting.id
    });
    this.setState({ loadingAdd: false, newTask: '' }, this.fetch.bind(this));
  }

  onLongPress(s) {
    const { client } = this.props;
    Alert.alert('Hapus tugas?', `Anda yakin ingin menghapus tugas ini?`, [{
      text: 'Hapus',
      onPress: async () => {
        await client.service('tasks').remove(s.id);
        this.fetch();
      }
    }, {
      text: 'Batal'
    }]);
  }

  render() {
    const { navigation, route } = this.props;
    const { ready, tasks, openAdd, loadingAdd, newTask } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={style.container}>
          <View>
            <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
              <Button title="Buat Tugas" icon={{ name: 'add', color: '#fff' }} type="solid" buttonStyle={{
                backgroundColor: 'rgba(111, 202, 186, 1)',
                borderRadius: 5
              }} onPress={() => this.setState({ openAdd: true })} />
            </View>
            {ready ? (
              tasks.length ? (
                tasks.map((s, i) => (
                  <ListItem Component={TouchableNativeFeedback} onLongPress={() => this.onLongPress(s)} onPress={() => navigation.navigate('Submission', { task: s })} key={i} bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>{s.description}</ListItem.Title>
                      <ListItem.Subtitle style={{ fontSize: 13 }}>{moment(s.createdAt).format('YYYY-MM-DD')} - <Text>{s.submissions.length}/{route.params.schedule.class.attendances.length} peserta selesai</Text></ListItem.Subtitle>
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
              <Input placeholder="Tulis deskripsi tugas..." value={newTask} onChangeText={(text) => this.setState({ newTask: text })} multiline />
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

export default Task;