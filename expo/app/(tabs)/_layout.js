import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function TabsLayout() {
  const handleTabPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <NativeTabs
      backgroundColor={null}
      blurEffect="systemMaterial"
      tintColor={DynamicColorIOS({
        dark: '#D1E4D5',
        light: '#7EC8A3',
      })}
      labelStyle={{
        color: DynamicColorIOS({
          dark: 'white',
          light: 'black',
        }),
      }}
    >
      <NativeTabs.Trigger 
        name="index"
        onPress={handleTabPress}
      >
        <Label>Home</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="history"
        onPress={handleTabPress}
      >
        <Label>History</Label>
        <Icon sf={{ default: 'clock', selected: 'clock.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="scan"
        onPress={handleTabPress}
      >
        <Label>Scan</Label>
        <Icon sf={{ default: 'camera.viewfinder', selected: 'camera.viewfinder' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="analytics"
        onPress={handleTabPress}
      >
        <Label>Analytics</Label>
        <Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger 
        name="profile"
        onPress={handleTabPress}
      >
        <Label>Profile</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
