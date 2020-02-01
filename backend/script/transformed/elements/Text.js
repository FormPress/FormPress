"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _EditableLabel = _interopRequireDefault(require("../common/EditableLabel"));

var _ElementContainer = _interopRequireDefault(require("../common/ElementContainer"));

require("./Text.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Text extends _react.Component {
  render() {
    const {
      config,
      mode
    } = this.props;
    const inputProps = {};

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value;
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange;
    }

    return _react.default.createElement(_ElementContainer.default, _extends({
      type: config.type
    }, this.props), _react.default.createElement(_EditableLabel.default, {
      className: "fl label",
      mode: mode,
      labelKey: config.id,
      handleLabelChange: this.props.handleLabelChange,
      value: config.label
    }), _react.default.createElement("div", {
      className: "fl input"
    }, _react.default.createElement("input", _extends({
      id: `q_${config.id}`,
      name: `q_${config.id}`
    }, inputProps))));
  }

}

exports.default = Text;

_defineProperty(Text, "weight", 1);

_defineProperty(Text, "defaultConfig", {
  id: 0,
  type: 'Text',
  label: 'Label'
});