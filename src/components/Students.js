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

class Students extends React.Component {
  state = { ready: false, loading: false, attendances: [], openAdd: false };
  componentDidMount() {
    this.fetch();
  }
  async fetch() {
    const { route, client } = this.props;
    this.setState({ ready: false });
    const attendances = await client.service('attendances').find({
      query: {
        classId: route.params.schedule.classId
      }
    });
    this.setState({ ready: true, attendances: attendances.data });
  }
  render() {
    const { navigation, route } = this.props;
    const { attendances, ready } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={style.container}>
          <View>
            {ready ? (
              attendances.length ? (
                attendances.map((a, i) => (
                  <ListItem Component={TouchableNativeFeedback} onPress={() => navigation.navigate('Stats', { student: a.student, schedule: route.params.schedule })} key={i} bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>{a.student.name}</ListItem.Title>
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

export default Students;