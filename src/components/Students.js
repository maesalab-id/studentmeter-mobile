import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert } from 'react-native';
import { ListItem, Button, Icon, FAB, Dialog } from 'react-native-elements';
import _ from 'lodash';
import Loading from '../screens/Loading';
import FilterSlider from '../components/FilterSlider';

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
  state = { ready: false, loading: false, attendances: [], openFilter: false };
  componentDidMount() {
    const { route } = this.props;
    const schedule = route.params.schedule;
    const filter = {};
    for (let i = 0; i < schedule.stats.length; i++) {
      const stat = schedule.stats[i];
      filter[stat] = [0, 100];
    }
    this.setState({ filter }, this.fetch.bind(this));
  }
  async fetch() {
    const { route, client } = this.props;
    const { filter } = this.state;
    this.setState({ ready: false });
    const attendances = await client.service('attendances').find({
      query: {
        classId: route.params.schedule.classId,
        scheduleId: route.params.schedule.id,
        filter: JSON.stringify(filter)
      }
    });

    this.setState({ ready: true, attendances: attendances.data });
  }
  render() {
    const { navigation, route } = this.props;
    const { attendances, ready, openFilter, filter } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={style.container}>
          <View>
            <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
              <Button title="Filter Performa" icon={{ name: 'filter-alt', color: '#fff' }} type="solid" buttonStyle={{
                backgroundColor: 'rgba(111, 202, 186, 1)',
                borderRadius: 5
              }} onPress={() => this.setState({ openFilter: true })} />
            </View>
            {ready ? (
              attendances.length ? (
                attendances.map((a, i) => (
                  <ListItem Component={TouchableNativeFeedback} onPress={() => navigation.navigate('Stats', { student: a.student, schedule: route.params.schedule })} key={i} bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title style={{ fontWeight: 'bold', fontSize: 17 }}>{a.student.name}</ListItem.Title>
                      <ListItem.Subtitle style={{ fontSize: 13 }}>{Object.keys(a.student.performance).map((k) => `${k}: ${a.student.performance[k] === null ? '-' : a.student.performance[k] + '%'}`).join(', ')}</ListItem.Subtitle>
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

export default Students;