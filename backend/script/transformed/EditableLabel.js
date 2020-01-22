"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

class EditableLabel extends _react.Component {
  constructor(props) {
    super(props);
    this.handleOnInput = this.handleOnInput.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.handleOnKeyDown = this.handleOnKeyDown.bind(this);
  }

  handleOnInput(e) {}

  handleOnBlur(e) {
    this.props.handleLabelChange(this.props.labelKey, e.target.innerHTML.replace(/(<([^>]+)>)/ig, ''));
  }

  handleOnKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  }

  render() {
    const extraProps = {};

    if (this.props.mode === 'builder') {
      extraProps.contentEditable = true;
    }

    return _react.default.createElement("div", _extends({
      className: this.props.className,
      onInput: this.handleOnInput,
      onBlur: this.handleOnBlur,
      onKeyDown: this.handleOnKeyDown,
      suppressContentEditableWarning: true
    }, extraProps), this.props.value);
  }

}

exports.default = EditableLabel;