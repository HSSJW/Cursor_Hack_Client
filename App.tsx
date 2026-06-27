// 응급 이송 도우미 — 메인 네비게이터
// 구조: BottomTab(검색 / 데이터 출처) + 검색 탭 내부 NativeStack
//   - VoiceInput → KeyboardInput → Loading → HospitalList → HospitalDetail
//                                                       → EmptyResult
//                                                       → ErrorScreen
//                                  → ClarificationScreen → Loading
// 탭 전환은 자체 state 유지 — 결과 화면에서 데이터 출처 탭 가도 결과 stack 보존.
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import VoiceInput from './src/screens/VoiceInput';
import KeyboardInput from './src/screens/KeyboardInput';
import Loading from './src/screens/Loading';
import HospitalList from './src/screens/HospitalList';
import HospitalDetail from './src/screens/HospitalDetail';
import EmptyResult from './src/screens/EmptyResult';
import ErrorScreen from './src/screens/ErrorScreen';
import ClarificationScreen from './src/screens/ClarificationScreen';
import DataSourcesScreen from './src/screens/DataSourcesScreen';

import { colorDark } from './src/theme/tokens';
import type { RootStackParamList, RootTabParamList } from './src/types/hospital';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function SearchStack() {
  return (
    <Stack.Navigator
      initialRouteName="VoiceInput"
      screenOptions={{
        headerShown: false, // 각 화면 자체 AppHeader 사용
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#16160F' },
      }}
    >
      <Stack.Screen name="VoiceInput" component={VoiceInput} />
      <Stack.Screen name="KeyboardInput" component={KeyboardInput} />
      <Stack.Screen name="Loading" component={Loading} />
      <Stack.Screen name="HospitalList" component={HospitalList} />
      <Stack.Screen name="HospitalDetail" component={HospitalDetail} />
      <Stack.Screen name="EmptyResult" component={EmptyResult} />
      <Stack.Screen name="ErrorScreen" component={ErrorScreen} />
      <Stack.Screen name="ClarificationScreen" component={ClarificationScreen} />
    </Stack.Navigator>
  );
}

function TabsRoot() {
  const t = colorDark;
  const insets = useSafeAreaInsets();
  const safeBottom = insets.bottom > 0 ? insets.bottom : 8;
  const extraGap = 14;
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopColor: t.border,
          borderTopWidth: 1,
          height: 56 + safeBottom + extraGap,
          paddingTop: 8,
          paddingBottom: safeBottom + extraGap,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        tabBarActiveTintColor: t.textPrimary,
        tabBarInactiveTintColor: t.textTertiary,
      }}
    >
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
        options={{
          title: '검색',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>○</Text>,
        }}
      />
      <Tab.Screen
        name="DataSourcesTab"
        component={DataSourcesScreen}
        options={{
          title: '데이터 출처',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 16, color }}>i</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <TabsRoot />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
