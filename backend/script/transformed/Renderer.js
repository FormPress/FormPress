"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var Elements = _interopRequireWildcard(require("./elements"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Renderer extends _react.Component {
  render() {
    let {
      className,
      ddHandlers
    } = this.props;

    if (this.props.dragging === true) {
      className += ' dragging';
    }

    return _react.default.createElement("div", _extends({
      className: className
    }, ddHandlers), this.props.form.props.elements.map((elem, index) => {
      const Component = Elements[elem.type];
      const extraProps = {
        mode: this.props.mode
      };

      if (typeof this.props.handleFieldChange === 'function') {
        extraProps.onChange = e => {
          this.props.handleFieldChange(elem, e);
        };
      }

      const renderList = [_react.default.createElement(Component, _extends({
        key: index,
        id: elem.id,
        config: elem,
        ddHandlers: this.props.ddHandlers,
        handleLabelChange: this.props.handleLabelChange
      }, extraProps))];

      if (this.props.dragIndex === elem.id.toString() && this.props.dragging === true) {
        if (this.props.insertBefore === true) {
          renderList.unshift(_react.default.createElement("div", {
            key: "dropPlaceHolder",
            className: "dropPlaceHolder"
          }));
        } else {
          renderList.push(_react.default.createElement("div", {
            key: "dropPlaceHolder",
            className: "dropPlaceHolder"
          }));
        }
      }

      return renderList.length === 1 ? renderList[0] : renderList;
    }));
  }

}

exports.default = Renderer;

_defineProperty(Renderer, "defaultProps", {
  mode: 'viewer'
});