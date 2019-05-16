import * as React from 'react';
import { View, StyleSheet } from 'react-native';

// eslint-disable-next-line import/no-unresolved
import { ScreenContainer } from 'react-native-screens';

import createTabNavigator, {
  NavigationViewProps,
} from '../utils/createTabNavigator';
import BottomTabBar, { TabBarOptions } from '../views/BottomTabBar';
import ResourceSavingScene from '../views/ResourceSavingScene';
import { NavigationProp, Route, SceneDescriptor } from '../types';

type Props = NavigationViewProps & {
  getAccessibilityRole: (props: { route: any }) => string;
  getAccessibilityStates: (props: { route: any }) => string[];
  lazy?: boolean;
  tabBarComponent?: React.ComponentType<any>;
  tabBarOptions?: TabBarOptions;
  navigation: NavigationProp;
  descriptors: { [key: string]: SceneDescriptor };
  screenProps?: unknown;
};

type State = {
  loaded: number[];
};

class TabNavigationView extends React.PureComponent<Props, State> {
  static defaultProps = {
    lazy: true,
    getAccessibilityRole: () => 'button',
    getAccessibilityStates: ({ focused }: { focused: boolean }) =>
      focused ? ['selected'] : [],
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { index } = nextProps.navigation.state;

    return {
      // Set the current tab to be loaded if it was not loaded before
      loaded: prevState.loaded.includes(index)
        ? prevState.loaded
        : [...prevState.loaded, index],
    };
  }

  state = {
    loaded: [this.props.navigation.state.index],
  };

  _getButtonComponent = ({ route }: { route: Route }) => {
    const { descriptors } = this.props;
    const descriptor = descriptors[route.key];
    const options = descriptor.options;

    if (options.tabBarButtonComponent) {
      return options.tabBarButtonComponent;
    }

    return undefined;
  };

  _renderTabBar = () => {
    const {
      tabBarComponent: TabBarComponent = BottomTabBar,
      tabBarOptions,
      navigation,
      screenProps,
      getLabelText,
      getAccessibilityLabel,
      getAccessibilityRole,
      getAccessibilityStates,
      getTestID,
      renderIcon,
      onTabPress,
      onTabLongPress,
    } = this.props;

    const { descriptors } = this.props;
    const { state } = this.props.navigation;
    const route = state.routes[state.index];
    const descriptor = descriptors[route.key];
    const options = descriptor.options;

    if (options.tabBarVisible === false) {
      return null;
    }

    return (
      <TabBarComponent
        {...tabBarOptions}
        jumpTo={this._jumpTo}
        navigation={navigation}
        screenProps={screenProps}
        onTabPress={onTabPress}
        onTabLongPress={onTabLongPress}
        getLabelText={getLabelText}
        getButtonComponent={this._getButtonComponent}
        getAccessibilityLabel={getAccessibilityLabel}
        getAccessibilityRole={getAccessibilityRole}
        getAccessibilityStates={getAccessibilityStates}
        getTestID={getTestID}
        renderIcon={renderIcon}
      />
    );
  };

  _jumpTo = (key: string) => {
    const { navigation, onIndexChange } = this.props;

    const index = navigation.state.routes.findIndex(route => route.key === key);

    onIndexChange(index);
  };

  render() {
    const { navigation, renderScene, lazy } = this.props;
    const { routes } = navigation.state;
    const { loaded } = this.state;

    return (
      <View style={styles.container}>
        <ScreenContainer style={styles.pages}>
          {routes.map((route, index) => {
            if (lazy && !loaded.includes(index)) {
              // Don't render a screen if we've never navigated to it
              return null;
            }

            const isFocused = navigation.state.index === index;

            return (
              <ResourceSavingScene
                key={route.key}
                style={StyleSheet.absoluteFill}
                isVisible={isFocused}
              >
                {renderScene({ route })}
              </ResourceSavingScene>
            );
          })}
        </ScreenContainer>
        {this._renderTabBar()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  pages: {
    flex: 1,
  },
});

export default createTabNavigator(TabNavigationView);