import React from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  View,
  ViewProps,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
  TouchableOpacity,
} from 'react-native';
import {
  StyledComponentProps,
  StyleType,
  Interaction,
} from '@kitten/theme';
import { CheckMark } from '../common/checkmark.component';

interface ToggleComponentProps {
  disabled?: boolean;
  onValueChange?: (value: boolean) => void;
  value?: boolean;
  appearance?: string;
  status?: string;
  size?: string;
}

export type Props = ToggleComponentProps & StyledComponentProps & ViewProps;

export class Toggle extends React.Component<Props> {

  static defaultProps = {
    disabled: false,
    value: false,
  };

  thumbAnimation: Animated.Value;
  switchAnimation: Animated.Value;
  ellipseAnimation: Animated.Value;
  switchAnimationActive: boolean;
  panResponder: PanResponderInstance;

  constructor(props: Props) {
    super(props);
    const thumbSize: number = props.themedStyle.height - (props.themedStyle.borderWidth * 2);
    this.thumbAnimation = new Animated.Value(thumbSize);
    this.switchAnimation = new Animated.Value(0);
    this.ellipseAnimation = new Animated.Value(props.value ? 0.01 : 1.0);
    this.switchAnimationActive = false;

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
      onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture,
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
      onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture,
      onPanResponderTerminationRequest: this.onPanResponderTerminationRequest,
      onPanResponderGrant: () => this.onPanResponderGrant(thumbSize),
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) =>
        this.onPanResponderRelease(evt, gestureState, thumbSize),
    });
  }

  private animateSwitch = (value: boolean, callback: () => void = () => null): void => {
    this.switchAnimationActive = true;
    Animated.timing(
      this.switchAnimation,
      {
        toValue: value ? 20 : -20,
        duration: 200,
        easing: Easing.bezier(0.65, 0.12, 0.09, 1.26),
      },
    ).start(() => {
      this.switchAnimationActive = false;
      callback();
    });
  };

  private animateThumb = (value: number, callback: () => void = () => null): void => {
    Animated.timing(this.thumbAnimation, {
      toValue: value,
      duration: 150,
      easing: Easing.linear,
    }).start(callback);
  };

  private animateEllipse: (value: number) => void = (value: number): void => {
    Animated.timing(this.ellipseAnimation, {
      toValue: value,
      duration: 200,
      easing: Easing.linear,
    }).start();
  };

  private stopAnimations(): void {
    const value: number = this.props.value ? 0.01 : 1;
    Animated.timing(this.switchAnimation, { toValue: value }).stop();
    Animated.timing(this.ellipseAnimation, { toValue: value }).stop();
    Animated.timing(this.thumbAnimation, { toValue: value }).stop();
    this.ellipseAnimation.setValue(value);
  }

  private onPressIn: () => void = (): void => {
    this.props.dispatch([Interaction.ACTIVE]);
  };

  private onPressOut: () => void = (): void => {
    this.props.dispatch([]);
  };

  private onStartShouldSetPanResponder: () => boolean = (): boolean => {
    return true;
  };

  private onStartShouldSetPanResponderCapture: () => boolean = (): boolean => {
    return true;
  };

  private onMoveShouldSetPanResponder: () => boolean = (): boolean => {
    return true;
  };

  private onMoveShouldSetPanResponderCapture: () => boolean = (): boolean => {
    return true;
  };

  private onPanResponderTerminationRequest: () => boolean = (): boolean => {
    return false;
  };

  private onPanResponderGrant: (size: number) => void = (thumbSize: number): void => {
    this.onPressIn();
    if (this.props.disabled) {
      return;
    }
    if (this.switchAnimationActive) {
      this.switchAnimationActive = false;
      this.stopAnimations();
      return;
    }
    this.animateThumb(thumbSize * 1.2);
    this.animateEllipse(this.props.value ? 1 : 0.01);
  };

  private onPanResponderMove: () => boolean = (): boolean => {
    return true;
  };

  private onPanResponderRelease = (evt: GestureResponderEvent,
                                   gestureState: PanResponderGestureState,
                                   thumbSize: number): void => {

    if (!this.props.disabled) {
      const propValue = this.props.value;
      if ((!propValue && gestureState.dx > -5) || (propValue && gestureState.dx < 5)) {
        this.toggle(this.onValueChange, thumbSize);
      } else {
        this.animateEllipse(propValue ? 0.01 : 1);
      }
    }
    this.animateThumb(thumbSize);
    this.onPressOut();
  };

  private toggle = (callback = (value: boolean) => null, thumbSize: number): void => {
    const toValue = !this.props.value;
    this.animateSwitch(toValue, () => {
      this.switchAnimation.setValue(0);
      callback(toValue);
    });
    this.animateThumb(thumbSize);
  };

  onValueChange = (): void => {
    if (this.props.onValueChange) {
      this.props.onValueChange(!this.props.value);
    }
  };

  private getComponentStyle = (style: StyleType): StyleType => {
    const thumbComponentSize: number = style.height - (style.borderWidth * 2);
    return {
      wrapper: {
        width: style.width,
        height: style.height,
      },
      componentContainer: {
        width: style.width,
        height: style.height,
        borderRadius: style.height / 2,
        borderWidth: style.borderWidth,
        borderColor: style.onTintColor,
      },
      componentDisabledBox: {
        backgroundColor: style.tintColor,
        width: style.width,
        borderRadius: style.width / 2,
        height: this.props.disabled ? style.height : 0,
      },
      componentEllipse: {
        width: style.width - (style.borderWidth * 2),
        height: style.height - (style.borderWidth * 2),
        borderRadius: (style.height - (style.borderWidth * 2)) / 2,
      },
      componentThumb: {
        height: thumbComponentSize,
        width: thumbComponentSize,
        borderWidth: style.borderWidth,
        borderRadius: thumbComponentSize / 2,
        marginHorizontal: 1.5,
      },
      highlight: {
        width: style.highlightWidth,
        height: style.highlightHeight,
        borderRadius: style.highlightHeight / 2,
        backgroundColor: style.highlightColor,
      },
      switchOffsetValue: style.offsetValue,
      thumbComponentSize: thumbComponentSize,
      checkMarkSize: style.iconSize,
      colors: {
        onTint: style.onTintColor,
        thumb: style.thumbColor,
        tint: style.tintColor,
      },
    };
  };

  private getInterpolatedColor = (offsetValue: number,
                                  outputColorStart: string,
                                  outputColorEnd: string): Animated.AnimatedDiffClamp => {

    return this.switchAnimation.interpolate({
      inputRange: this.props.value ? [-offsetValue, 0] : [0, offsetValue],
      outputRange: [
        outputColorStart,
        outputColorEnd,
      ],
    });
  };

  render(): React.ReactElement<ViewProps> {
    const componentStyle: StyleType = this.getComponentStyle(this.props.themedStyle);
    const { disabled, value, style } = this.props;
    const interpolatedTintColor: Animated.AnimatedDiffClamp = this.getInterpolatedColor(
      componentStyle.switchOffsetValue,
      componentStyle.colors.tint,
      componentStyle.colors.onTint,
    );
    const interpolatedCheckColor: Animated.AnimatedDiffClamp = this.getInterpolatedColor(
      componentStyle.switchOffsetValue,
      componentStyle.colors.thumb,
      componentStyle.colors.onTint,
    );
    const returnScale: Animated.AnimatedDiffClamp = this.switchAnimation.interpolate({
      inputRange: [-componentStyle.switchOffsetValue, 0],
      outputRange: [1, 0.01],
    });
    return (
      <View {...this.props} style={[componentStyle.wrapper, styles.wrapper, style]}>
        {!this.props.disabled && <View style={[styles.highlight, componentStyle.highlight]}/>}
        <TouchableOpacity
          onPressIn={this.onPressIn}
          onPressOut={this.onPressOut}
          onPress={this.onValueChange}
        >
          <Animated.View
            style={[
              styles.container,
              componentStyle.componentContainer,
              { backgroundColor: interpolatedTintColor },
            ]}
            {...this.panResponder.panHandlers}>
            <Animated.View style={[
              styles.ellipse,
              componentStyle.componentEllipse,
              {
                transform: [{ scale: value ? returnScale : this.ellipseAnimation }],
                backgroundColor: interpolatedTintColor,
              },
            ]}
            />
            <Animated.View style={[
              componentStyle.componentThumb,
              styles.thumb,
              {
                width: this.thumbAnimation,
                alignSelf: value ? 'flex-end' : 'flex-start',
                transform: [{ translateX: this.switchAnimation }],
                borderColor: interpolatedTintColor,
                backgroundColor: componentStyle.colors.thumb,
                elevation: disabled ? 0 : 5,
              },
            ]}
            >
              <CheckMark
                size={componentStyle.checkMarkSize}
                color={interpolatedCheckColor}
                isAnimated={true}
              />
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  disableBox: {
    position: 'absolute',
    alignSelf: 'center',
  },
  ellipse: {
    position: 'absolute',
    alignSelf: 'center',
  },
  highlight: {
    position: 'absolute',
    alignSelf: 'center',
  },
  thumb: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});