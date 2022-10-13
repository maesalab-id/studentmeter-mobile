import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableNativeFeedback, Alert } from 'react-native';
import {
  RadarChart
} from 'react-native-charts-wrapper';
import { Dimensions } from 'react-native';
import { Tab, TabView, Icon } from 'react-native-elements';
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

class Stats extends React.Component {
  state = { index: 0, ready: false, performances: [] };

  componentDidMount() {
    const { navigation, route } = this.props;
    navigation.setOptions({ title: route.params.student.name });
    this.fetch();
  }
  async fetch() {
    const { route, client } = this.props;
    this.setState({ ready: false });
    const performances = await client.service('performances').find({
      query: {
        scheduleId: route.params.schedule.id,
        studentId: route.params.student.id
      }
    });
    this.setState({ ready: true, performances: performances });
  }
  hasData(p) {
    const keys = Object.keys(p.stats[0].value);
    for (let i = 0; i < keys.length; i++) {
      if (!p.stats[0].value[keys[i]]) return false;
    }
    return true;
  }
  render() {
    const { navigation, route } = this.props;
    const { performances, ready, index } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={style.container}>
          <View>
            {ready ? (
              performances.length ? (
                <View>
                  <Tab value={index} onChange={(index) => this.setState({ index })} style={{ backgroundColor: 'rgba(111, 202, 186, 1)' }} indicatorStyle={{ backgroundColor: 'rgba(111, 202, 186, 1)' }}>
                    {performances.map((p, i) => (
                      <Tab.Item key={i} titleStyle={{ color: 'rgba(111, 202, 186, 1)' }} containerStyle={{ backgroundColor: 'rgba(111, 202, 186, .1)' }} title={`#${p.number}`} />
                    ))}
                  </Tab>
                  <TabView value={index} onChange={(index) => this.setState({ index })}>
                    {performances.map((p, i) => (
                      <TabView.Item key={i} style={{ width: '100%', padding: 0, margin: 0 }}>
                        {this.hasData(p) ? (
                          <RadarChart
                            style={{ width: '100%', height: Dimensions.get('window').height - 200 }}
                            xAxis={{ valueFormatter: Object.keys(p.stats[0].value) }}
                            data={{
                              dataSets: [{
                                values: (function () {
                                  const keys = Object.keys(p.stats[0].value);
                                  const values = keys.map((k) => ({ value: p.stats[0].value[k] }));
                                  console.log(values);
                                  return values;
                                })(),
                                label: route.params.student.name,
                                config: { drawFilled: true }
                              }],
                            }}
                          />
                        ) : <Text style={{ fontSize: 25, textAlign: 'center', marginTop: 20 }}>Data belum diisi</Text>}
                      </TabView.Item>
                    ))}
                  </TabView>
                </View>
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

export default Stats;