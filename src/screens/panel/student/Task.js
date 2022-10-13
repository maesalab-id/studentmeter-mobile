import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert } from 'react-native';
import { Icon, Button, Dialog, Input, ListItem, Divider, Chip } from 'react-native-elements';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import { shortText } from 'limit-text-js';
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
  state = { ready: false, meetings: [], loadingAdd: false, openAdd: false, newTask: '', selected: null, choosedFile: null };

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

  async chooseFile() {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.docx, DocumentPicker.types.doc, DocumentPicker.types.xls, DocumentPicker.types.xlsx, DocumentPicker.types.plainText]
      });
      this.setState({ choosedFile: res });
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) error(err);
    }
  }

  async submit() {
    const { client, user } = this.props;
    const { choosedFile, selected } = this.state;
    const file = await RNFS.readFile(choosedFile.uri, 'base64');
    this.setState({ loadingAdd: true });
    await client.service('submissions').create({
      file, filename: choosedFile.name, taskId: selected.id, studentId: user.id
    });
    this.setState({ loadingAdd: false, choosedFile: null, selected: null }, this.fetch.bind(this));
    this.props.route.params.refresh();
  }

  render() {
    const { navigation, route } = this.props;
    const { ready, tasks, loadingAdd, selected, choosedFile } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={style.container}>
          <View>
            {ready ? (
              tasks.length ? (
                tasks.map((s, i) => (
                  <ListItem Component={TouchableNativeFeedback} onPress={() => this.setState({ selected: s })} key={i} bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>{shortText(s.description, 30, '...')}</ListItem.Title>
                      <ListItem.Subtitle style={{ fontSize: 13 }}>{moment(s.date).format('YYYY-MM-DD')} {s.submissions.length > 0 && <Text style={{ fontWeight: 'bold', color: '#2ecc71' }}>Diupload <Icon name='check' size={15} color="#2ecc71" /></Text>}</ListItem.Subtitle>
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
          <Dialog overlayStyle={{ width: '90%' }} isVisible={true} onBackdropPress={() => this.setState({ selected: null, choosedFile: null })}>
            <Dialog.Title title="Tugas Anda" />
            <View>
              <Text style={{ fontSize: 16, marginBottom: 10 }}>{selected.description}</Text>
              <Divider style={{ marginBottom: 15 }} />
              <Button title={choosedFile ? 'Ganti Dokumen' : 'Pilih Dokumen'} titleStyle={{ color: 'rgba(111, 202, 186, 1)' }} icon={{ name: 'file-upload', color: 'rgba(111, 202, 186, 1)' }} type="outline" buttonStyle={{ marginBottom: 5 }} onPress={this.chooseFile.bind(this)} />
              {choosedFile && <Text style={{ marginBottom: 15 }}>File dipilih: {choosedFile.name}</Text>}
              <Button disabled={!choosedFile} title="Simpan" icon={{ name: 'save', color: '#fff' }} type="solid" buttonStyle={{
                backgroundColor: 'rgba(111, 202, 186, 1)',
                borderRadius: 5
              }} onPress={this.submit.bind(this)} loading={loadingAdd} />
            </View>
          </Dialog>
        )}
      </ScrollView>
    )
  }
}

export default Task;