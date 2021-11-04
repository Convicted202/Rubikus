# Rubikus

> A full blown **React-native iOS app** that can scan 2x2x2 and 3x3x3 Rubik's cubes using your phone's camera, render it in 3D and then provide a solution.

The provided solution is found based on two algorithms:

- **Two-directional Bread-First Search** for 2x2x2
- **Pochman's optimization over Thistlethwaite's algorithm** for 3x3x3

This project only works on iOS, because it makes use of a wonderful [Apple Vision Framework](https://developer.apple.com/documentation/vision) for rectangle detection.

Initially meant to use OpenCV for color/rectangle detection, but since it requires a lot of Objective-C++, decided to use Vision instead, and it was totally worth it.

React-native is being used due to how easy it is to work with **Three.js + expo unimodules**, instead of Obj-C/C++ wrapper over OpenGL/OpenGL ES or Metal

It also uses wonderful [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera) library and frameprocessors to process camera data in real time.

CIE color space is used for color manipulations, color diff computation ([CIEDE2000](https://en.wikipedia.org/wiki/Color_difference#CIEDE2000))

---

## Libraries and Frameworks used:

- [React Native](https://reactnative.dev/)
- [Apple Vision Framework](https://developer.apple.com/documentation/vision)
- [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera)
- [Three.js](https://threejs.org/docs/) with [expo-three](https://github.com/expo/expo-three)
- [TweenJS](https://github.com/tweenjs/tween.js/)

## Note: The app only works on Physical iPhone devices
