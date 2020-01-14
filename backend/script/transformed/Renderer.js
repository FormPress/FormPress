"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var Elements = _interopRequireWildcard(require("./elements"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Renderer extends _react.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {
      className
    } = this.props;

    if (this.props.dragging === true) {
      className += ' dragging';
    }

    return _react.default.createElement("div", {
      className: className,
      onDrop: this.props.handleDrop,
      onDragEnter: e => this.props.handleDragEnter(e, 'container'),
      onDragLeave: e => this.props.handleDragLeave(e, 'container'),
      onDragOver: this.props.handleDragOver
    }, this.props.form.props.elements.map((elem, index) => {
      const Component = Elements[elem.type];
      const renderList = [_react.default.createElement(Component, {
        key: index,
        id: elem.id,
        props: elem,
        onDrop: this.props.handleDrop,
        onDragOver: e => this.props.handleDragOver(e, elem)
      })];

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