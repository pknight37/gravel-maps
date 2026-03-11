// Jest setup for Gravel Maps app
// Mock MapLibre native module
jest.mock("@maplibre/maplibre-react-native", () => {
  const React = require("react");

  return {
    __esModule: true,
    default: {
      setAccessToken: jest.fn(),
      MapView: React.forwardRef(
        (props: Record<string, unknown>, ref: unknown) =>
          React.createElement("MapView", { ...props, ref })
      ),
      Camera: React.forwardRef(
        (props: Record<string, unknown>, ref: unknown) =>
          React.createElement("Camera", { ...props, ref })
      ),
      ShapeSource: (props: Record<string, unknown>) =>
        React.createElement("ShapeSource", props),
      LineLayer: (props: Record<string, unknown>) =>
        React.createElement("LineLayer", props),
      UserLocation: (props: Record<string, unknown>) =>
        React.createElement("UserLocation", props),
    },
  };
});
