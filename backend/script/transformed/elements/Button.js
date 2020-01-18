"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Button extends _react.Component {
  render() {
    const {
      config,
      ...rest
    } = this.props;
    const inputProps = {};
    console.log('Full props ', Object.keys(this.props));
    console.log('Rest on button ', Object.keys(rest));

    if (typeof config.onClick !== 'undefined') {
      inputProps.onClick = config.onClick;
    }

    return _react.default.createElement("div", _extends({
      className: "element elementButton"
    }, rest), _react.default.createElement("input", _extends({
      type: "submit",
      value: config.buttonText
    }, inputProps)));
  }

}

exports.default = Button;

_defineProperty(Button, "weight", 2);

_defineProperty(Button, "defaultConfig", {
  id: 0,
  type: 'Button',
  buttonText: 'Submit'
});