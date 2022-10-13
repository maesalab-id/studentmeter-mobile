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
                  <ListItem Component={TouchableNativeFeedback} key={i} bottomDivider>
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