import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Button, Divider } from 'react-native-elements';
import { RangeSlider } from '@sharcoux/slider';

export default function FilterSlider(props) {
  const [filter, setFilter] = React.useState({ ...props.value });
  const stats = Object.keys(filter);

  return (
    <View>
      {stats.map((s, i) => (
        <View key={i}>
          <Text>{s}: {`${filter[s][0]}% - ${filter[s][1]}%`}</Text>
          <RangeSlider
            range={filter[s]}
            step={1}
            minimumValue={0}
            maximumValue={100}
            outboundColor="rgba(111, 202, 186, .3)"
            inboundColor="rgba(111, 202, 186, 1)"
            onSlidingComplete={(v) => {
              const newFilter = { ...filter };
              newFilter[s] = v;
              setFilter((f) => ({ ...f, ...newFilter }));
            }}
          />
        </View>
      ))}
      <Divider style={{ marginTop: 10, marginBottom: 10 }} />
      <Button title="Terapkan" icon={{ name: 'filter-alt', color: '#fff' }} type="solid" buttonStyle={{
        backgroundColor: 'rgba(111, 202, 186, 1)',
        borderRadius: 5
      }} onPress={() => props.onDone(filter)} />
    </View>
  );
}