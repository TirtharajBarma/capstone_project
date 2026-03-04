import { NativeTabs, Icon, Label, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Platform, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  const handleTabPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const tabs = (
    <NativeTabs
      backgroundColor={Platform.OS === 'android' ? '#FAF8F6' : null}
      blurEffect="systemMaterialLight"
      tintColor="#7EC8A3"
      labelVisibilityMode="labeled"
      disableIndicator
      labelStyle={{
        color: 'black',
      }}
    >
      <NativeTabs.Trigger 
        name="index"
        onPress={handleTabPress}
      >
        <Label>Home</Label>
        <Icon 
          sf={{ default: 'house', selected: 'house.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="home" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="history"
        onPress={handleTabPress}
      >
        <Label>History</Label>
        <Icon 
          sf={{ default: 'clock', selected: 'clock.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="clock-outline" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="scan"
        onPress={handleTabPress}
      >
        <Label>Scan</Label>
        <Icon 
          sf={{ default: 'camera.viewfinder', selected: 'camera.viewfinder' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="camera" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="analytics"
        onPress={handleTabPress}
      >
        <Label>Analytics</Label>
        <Icon 
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="chart-bar" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="profile"
        onPress={handleTabPress}
      >
        <Label>Profile</Label>
        <Icon 
          sf={{ default: 'person', selected: 'person.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="account" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );

  if (Platform.OS === 'android') {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F6', paddingBottom: 0 }}>
        {tabs}
      </View>
    );
  }

  return tabs;
}
