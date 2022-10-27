import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert } from 'react-native';
import { ListItem, Button, Icon, FAB, Dialog, Input, Switch } from 'react-native-elements';
import _ from 'lodash';
import Loading from '../screens/Loading';
import FilterSlider from '../components/FilterSlider';

const style = StyleSheet.create({
  smText: { fontSize: 20, backgroundColor: 'rgba(0,0,0,.04)' },
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
  state = { ready: false, loading: false, attendances: [], openFilter: false, q: '', assess: false };
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
  toggleAssess() {
    const { route } = this.props;
    const schedule = route.params.schedule;
    const assess = !this.state.assess;
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
    const { route, client } = this.props;
    const { filter, assess } = this.state;
    this.setState({ ready: false });
    const attendances = await client.service('attendances').find({
      query: {
        classId: route.params.schedule.classId,
        scheduleId: route.params.schedule.id,
        filter: JSON.stringify(filter),
        assess: assess
      }
    });
    this.setState({ ready: true, attendances: attendances.data });
  }
  render() {
    const { navigation, route } = this.props;
    const { attendances, ready, openFilter, filter, q, assess } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={style.container}>
          <View>
            <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10, flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 5 }}>
                <Button title="Filter Performa" icon={{ name: 'filter-alt', color: '#fff' }} type="solid" buttonStyle={{ backgroundColor: 'rgba(111, 202, 186, 1)', borderRadius: 5 }} onPress={() => this.setState({ openFilter: true })} />
              </View>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Switch color="rgba(111, 202, 186, 1)" value={assess} onValueChange={this.toggleAssess.bind(this)} />
              </View>
            </View>
            <View style={{ paddingLeft: 10, paddingRight: 10 }}>
              <Input leftIcon={{ name: 'search' }} containerStyle={{ marginBottom: -20 }} onChangeText={(t) => this.setState({ q: t })} placeholder="Cari..." />
            </View>
            {ready ? (
              attendances.length ? (
                attendances.filter((a) => a.student.name.toLowerCase().indexOf(q.toLowerCase()) !== -1).map((a, i) => (
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