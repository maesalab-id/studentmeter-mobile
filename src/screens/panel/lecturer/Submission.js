import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, PermissionsAndroid, ToastAndroid } from 'react-native';
import { Icon, Button, Dialog, Input, ListItem } from 'react-native-elements';
import moment from 'moment';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Loading from '../../Loading';
import config from '../../../../config';

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

class Submission extends React.Component {
  state = { ready: false, submissions: [] };

  componentDidMount() {
    const { navigation, route } = this.props;
    console.log(this.props);
    navigation.setOptions({ title: `Tugas #${route.params.task.id}` });
    this.fetch();
  }

  async fetch() {
    const { client, route } = this.props;
    this.setState({ ready: false });
    const submissions = await client.service('submissions').find({
      query: {
        taskId: route.params.task.id
      }
    });
    this.setState({ ready: true, submissions: submissions.data });
  }

  async download(id, name) {
    const url = `${config.baseURL}:${config.port}/document/${id}`;
    const toFile = `${RNFS.DownloadDirectoryPath}/${name}`;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const res = await RNFS.downloadFile({
            fromUrl: url,
            toFile: toFile
          });
          ToastAndroid.show(`File ${name} berhasil disimpan`, ToastAndroid.LONG);
          await FileViewer.open(toFile);
        } catch (e) { ToastAndroid.show('Error: ' + e.message, ToastAndroid.LONG) };

      } else {
        return false;
      }
    } catch (err) { console.log(err); return false }
  }

  render() {
    const { navigation, route } = this.props;
    const { ready, submissions } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={style.container}>
          <View>
            <View style={{ padding: 20, backgroundColor: 'rgba(111, 202, 186, .1)' }}>
              <Text>{route.params.task.description}</Text>
            </View>
            {ready ? (
              submissions.length ? (
                submissions.map((s, i) => (
                  <ListItem Component={TouchableNativeFeedback} onPress={() => this.download(s.id, `${s.filename}`)} key={i} bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>{s.student.name}</ListItem.Title>
                      <ListItem.Subtitle style={{ fontSize: 13 }}>{s.filename} - diupload pada {moment(s.created_at).format('YYYY-MM-DD')}</ListItem.Subtitle>
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

export default Submission;